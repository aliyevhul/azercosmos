"""Turn the worksheet PDFs into what the site shows: page images plus the
fill-in fields that sit on top of them.

    python3 scripts/worksheets/build.py            # images + fields
    python3 scripts/worksheets/build.py --preview  # also write overlay PNGs to check

Reads    worksheets/source/*.pdf          (not published — no downloads)
         scripts/worksheets/overrides.json (hand fixes per page)
Writes   public/worksheet-pages/<id>/<n>.webp
         shared/worksheet-fields.js       (used by the site and the API)

How fields are found: each page is rendered and scanned for
  - writing lines   (long thin horizontal lines)       → one-line text field
  - empty boxes     (rectangles drawn with thin lines,
                     table cells)                       → multi-line text box
  - tick squares    (small empty squares)               → checkbox
Boxes that contain printed text are skipped, as are lines that are the
edge of a box, and anything inside a screenshot/photo. Anything detection
gets wrong is fixed in overrides.json:
  { "<id>": { "<page>": { "remove": ["p1-f3"], "add": [ {type, x, y, w, h} ],
                          "skip": true, "ignoreImages": true } } }
(coordinates in PDF points, origin top-left; "skip" drops all detected
fields on that page; "ignoreImages" also looks inside images).

Field ids: detected fields are "p<page>-f<n>" in reading order, hand-added
ones "p<page>-a<n>". Saved answers are keyed by these ids, so once
students have started, check that a rebuild doesn't renumber them
(`git diff shared/worksheet-fields.js`).
"""

import argparse
import json
import sys
from pathlib import Path

import cv2
import numpy as np
import pymupdf

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "worksheets" / "source"
OUT_IMG = ROOT / "public" / "worksheet-pages"
OUT_JS = ROOT / "shared" / "worksheet-fields.js"
OVERRIDES = Path(__file__).with_name("overrides.json")

SCALE = 2.0          # detection resolution: px per PDF point
IMG_WIDTH = 1600     # published page image width in px
HEADER_PT = 175      # the coloured title band at the top of each page


def render(page, scale):
    pix = page.get_pixmap(matrix=pymupdf.Matrix(scale, scale), alpha=False)
    return np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)


def thin_lines(lum, axis, min_len_px, contrast=28, reach=4):
    """Mask of thin dark lines along `axis` (1 = horizontal, 0 = vertical)
    that stand out against the background on both sides."""
    l = lum.astype(np.int16)
    if axis == 1:
        a, b = np.roll(l, reach, axis=0), np.roll(l, -reach, axis=0)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (min_len_px, 1))
    else:
        a, b = np.roll(l, reach, axis=1), np.roll(l, -reach, axis=1)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, min_len_px))
    mask = ((np.minimum(a, b) - l) > contrast).astype(np.uint8) * 255
    return cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)


def words_in(words, x0, y0, x1, y1):
    return [w for w in words if w[0] >= x0 - 1 and w[2] <= x1 + 1 and w[1] >= y0 - 1 and w[3] <= y1 + 1]


def only_a_label(page, words, x0, y0, x1, y1):
    """True when a region holds no printed text, or just a short label
    such as a number ("1", "2.")."""
    inside = words_in(words, x0, y0, x1, y1)
    return len(inside) == 0 or (len(inside) == 1 and len(inside[0][4]) <= 3)


class Page:
    def __init__(self, page, ignore_images=False):
        self.page = page
        img = render(page, SCALE)
        self.lum = (0.299 * img[..., 0] + 0.587 * img[..., 1] + 0.114 * img[..., 2]).astype(np.uint8)
        self.words = [w[:5] for w in page.get_text("words")]  # x0, y0, x1, y1, text (points)
        area = page.rect.width * page.rect.height
        # screenshots and photos: nothing inside them is a real blank (a
        # full-page background texture is not counted)
        self.images = [] if ignore_images else [
            i["bbox"] for i in page.get_image_info()
            if (i["bbox"][2] - i["bbox"][0]) * (i["bbox"][3] - i["bbox"][1]) < 0.5 * area
        ]

    def px(self, x0, y0, x1, y1):
        return self.lum[max(int(y0 * SCALE), 0):max(int(y1 * SCALE), 0), max(int(x0 * SCALE), 0):max(int(x1 * SCALE), 0)]

    def ink(self, x0, y0, x1, y1, thr=70):
        """Share of clearly darker-than-background pixels in a region."""
        r = self.px(x0, y0, x1, y1)
        if r.size == 0:
            return 0.0
        return float(np.mean(np.median(r) - r.astype(np.int16) > thr))

    def in_image(self, x0, y0, x1, y1):
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        return any(b[0] - 2 <= cx <= b[2] + 2 and b[1] - 2 <= cy <= b[3] + 2 for b in self.images)


def detect(page, ignore_images=False):
    P = Page(page, ignore_images)
    lum, words = P.lum, P.words
    pw, ph = page.rect.width, page.rect.height

    hmask = thin_lines(lum, 1, int(24 * SCALE), contrast=18)
    vmask = thin_lines(lum, 0, int(10 * SCALE), contrast=18)
    # tick squares have short sides: find them on a short-kernel mask
    hsmall = thin_lines(lum, 1, int(6 * SCALE), contrast=14, reach=3)
    vsmall = thin_lines(lum, 0, int(6 * SCALE), contrast=14, reach=3)

    def vertical_at(x, y0, y1):
        """Is there a vertical line near x between y0 and y1 (points)?"""
        xs, xe = int((x - 3) * SCALE), int((x + 3) * SCALE)
        col = vmask[max(int(y0 * SCALE), 0):int(y1 * SCALE), max(xs, 0):xe]
        return col.size > 0 and np.mean(col.max(axis=1) > 0) > 0.6

    candidates = []  # (kind, x0, y0, x1, y1)

    # ── 1. boxes and tick squares drawn with thin lines (incl. table cells)
    for grid, kind in ((cv2.bitwise_or(hmask, vmask), "box"), (cv2.bitwise_or(hsmall, vsmall), "check")):
        closed = cv2.morphologyEx(grid, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5)))
        contours, hierarchy = cv2.findContours(closed, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
        if hierarchy is None:
            continue
        for i, c in enumerate(contours):
            if hierarchy[0][i][3] < 0:  # holes only: the inside of a closed outline
                continue
            x, y, w, h = cv2.boundingRect(c)
            if cv2.contourArea(c) / max(w * h, 1) < 0.8:
                continue
            x0, y0, x1, y1 = x / SCALE, y / SCALE, (x + w) / SCALE, (y + h) / SCALE
            wp, hp = x1 - x0, y1 - y0
            if kind == "check" and 7 <= wp <= 20 and 7 <= hp <= 20 and 0.75 <= wp / hp <= 1.33:
                if not words_in(words, x0, y0, x1, y1) and P.ink(x0 + 2, y0 + 2, x1 - 2, y1 - 2) < 0.05:
                    candidates.append(("checkbox", x0, y0, x1, y1))
            elif kind == "box" and wp >= 40 and hp >= 22 and wp * hp < 0.4 * pw * ph:
                if only_a_label(page, words, x0, y0, x1, y1) and P.ink(x0 + 3, y0 + 3, x1 - 3, y1 - 3) < 0.04:
                    candidates.append(("textarea", x0, y0, x1, y1))

    # ── 2. writing lines ──────────────────────────────────────────────────
    n, _labels, stats, _ = cv2.connectedComponentsWithStats(hmask)
    lines = []
    for i in range(1, n):
        x, y, w, h, _a = stats[i]
        if h > 5 or w < 30 * SCALE:
            continue
        x0, x1, ly = x / SCALE, (x + w) / SCALE, (y + h / 2) / SCALE
        lines.append([x0, x1, ly])

    # rounded boxes: a top and a bottom line joined by straight sides
    used = set()
    for a in range(len(lines)):
        for b in range(len(lines)):
            la, lb = lines[a], lines[b]
            gap = lb[2] - la[2]
            if a == b or not (14 <= gap <= 90) or abs(la[0] - lb[0]) > 8 or abs(la[1] - lb[1]) > 8:
                continue
            x0, x1 = max(la[0], lb[0]), min(la[1], lb[1])
            if (vertical_at(x0 - 3, la[2] + 5, lb[2] - 5) or vertical_at(x0, la[2] + 5, lb[2] - 5)) and (
                vertical_at(x1 + 3, la[2] + 5, lb[2] - 5) or vertical_at(x1, la[2] + 5, lb[2] - 5)
            ):
                if only_a_label(page, words, x0, la[2], x1, lb[2]):
                    candidates.append(("textarea", x0 - 4, la[2], x1 + 4, lb[2]))
                    used.update((a, b))

    line_fields = []
    for i, (x0, x1, ly) in enumerate(lines):
        if i in used or ly < HEADER_PT or P.in_image(x0, ly - 10, x1, ly):
            continue
        # the edge of a box or table: vertical lines meet it at both ends
        if (vertical_at(x0, ly - 12, ly) or vertical_at(x0, ly, ly + 12)) and (
            vertical_at(x1, ly - 12, ly) or vertical_at(x1, ly, ly + 12)
        ):
            continue
        # underlined text, or part of a drawing: a real blank has empty space above it
        if sum(w[2] - w[0] for w in words_in(words, x0, ly - 12, x1, ly + 1)) > 0.3 * (x1 - x0):
            continue
        if P.ink(x0 + 2, ly - 13, x1 - 2, ly - 2, thr=110) > 0.03:
            continue
        line_fields.append((x0, x1, ly))

    # ── 3. empty filled areas: white boxes on a coloured panel, speech
    #       bubbles, tick squares filled white ────────────────────────────
    flat = cv2.morphologyEx(
        ((lum >= 190) & (cv2.Laplacian(lum, cv2.CV_16S, ksize=3) == 0)).astype(np.uint8) * 255,
        cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3)),
    )
    # split regions by colour so a light-grey bubble on a white page counts on its own
    quant = (lum // 6).astype(np.int32)
    for level in np.unique(quant[flat > 0]):
        mask = ((quant == level) & (flat > 0)).astype(np.uint8) * 255
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7)))
        n, _labels, stats, _ = cv2.connectedComponentsWithStats(mask)
        for i in range(1, n):
            x, y, w, h, area = stats[i]
            if x <= 2 or y <= 2 or x + w >= mask.shape[1] - 2 or y + h >= mask.shape[0] - 2:
                continue  # the page background
            x0, y0, x1, y1 = x / SCALE, y / SCALE, (x + w) / SCALE, (y + h) / SCALE
            wp, hp, fill = x1 - x0, y1 - y0, area / (w * h)
            if y0 < HEADER_PT or P.in_image(x0, y0, x1, y1):
                continue
            if 7 <= wp <= 20 and 7 <= hp <= 20 and 0.75 <= wp / hp <= 1.33 and fill > 0.85:
                candidates.append(("checkbox", x0, y0, x1, y1))
            elif wp >= 40 and hp >= 22 and wp * hp < 0.4 * pw * ph and fill > 0.6:
                if not only_a_label(page, words, x0, y0, x1, y1):
                    continue
                if any(x0 - 2 <= lx0 and lx1 <= x1 + 2 and y0 < ly < y1 for lx0, lx1, ly in line_fields):
                    continue  # a panel holding writing lines
                if fill < 0.88:  # bubble / ellipse: use the middle of it
                    candidates.append(("textarea", x0 + 0.16 * wp, y0 + 0.2 * hp, x1 - 0.16 * wp, y1 - 0.25 * hp))
                else:
                    candidates.append(("textarea", x0, y0, x1, y1))

    # ── de-duplicate (the same box can be found by several passes) ─────────
    candidates = [c for c in candidates if c[2] >= HEADER_PT and not P.in_image(*c[1:])]
    candidates.sort(key=lambda b: (b[3] - b[1]) * (b[4] - b[2]))
    kept = []
    for b in candidates:
        overlaps = [
            k for k in kept
            if min(b[3], k[3]) - max(b[1], k[1]) > 0 and min(b[4], k[4]) - max(b[2], k[2]) > 0
            and (min(b[3], k[3]) - max(b[1], k[1])) * (min(b[4], k[4]) - max(b[2], k[2]))
            > 0.5 * min((b[3] - b[1]) * (b[4] - b[2]), (k[3] - k[1]) * (k[4] - k[2]))
        ]
        if not overlaps:
            kept.append(b)

    fields = []
    for x0, x1, ly in line_fields:
        if any(k[0] == "textarea" and k[1] - 3 <= x0 and x1 <= k[3] + 3 and k[2] - 3 <= ly <= k[4] + 3 for k in kept):
            continue  # line inside or on the edge of a box we already have
        fields.append({"type": "text", "x": x0, "y": ly - 15, "w": x1 - x0, "h": 15})
    for kind, x0, y0, x1, y1 in kept:
        if kind == "checkbox":
            fields.append({"type": "checkbox", "x": x0, "y": y0, "w": x1 - x0, "h": y1 - y0})
        else:
            pad = 3
            fields.append({"type": "textarea", "x": x0 + pad, "y": y0 + pad, "w": x1 - x0 - 2 * pad, "h": y1 - y0 - 2 * pad})
    return fields


def reading_order(fields):
    return sorted(fields, key=lambda f: (round(f["y"] / 6), f["x"]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", action="store_true", help="write overlay PNGs to check detection")
    ap.add_argument("--preview-dir", default=str(ROOT / ".worksheet-preview"))
    args = ap.parse_args()

    overrides = json.loads(OVERRIDES.read_text()) if OVERRIDES.exists() else {}
    catalog = {}
    for pdf in sorted(SRC.glob("*.pdf")):
        doc_id = pdf.stem
        doc = pymupdf.open(pdf)
        pages = []
        out_dir = OUT_IMG / doc_id
        out_dir.mkdir(parents=True, exist_ok=True)
        for pno, page in enumerate(doc, start=1):
            ov = overrides.get(doc_id, {}).get(str(pno), {})
            found = [] if ov.get("skip") else reading_order(detect(page, ov.get("ignoreImages", False)))
            # detected fields: p<page>-f<n> in reading order (overrides' "remove"
            # refers to these); hand-added ones: p<page>-a<n> in the order listed
            for i, f in enumerate(found, start=1):
                f["id"] = f"p{pno}-f{i}"
            removed = set(ov.get("remove", []))
            added = [dict(f, id=f"p{pno}-a{i}") for i, f in enumerate(ov.get("add", []), start=1)]
            fields = reading_order([f for f in found if f["id"] not in removed] + added)

            pw, ph = page.rect.width, page.rect.height
            norm = [
                {
                    "id": f["id"],
                    "type": f["type"],
                    "x": round(f["x"] / pw, 4),
                    "y": round(f["y"] / ph, 4),
                    "w": round(f["w"] / pw, 4),
                    "h": round(f["h"] / ph, 4),
                }
                for f in fields
            ]
            # page image
            scale = IMG_WIDTH / pw
            img = render(page, scale)
            cv2.imwrite(str(out_dir / f"{pno}.webp"), cv2.cvtColor(img, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_WEBP_QUALITY, 80])
            pages.append({"aspect": round(ph / pw, 4), "fields": norm})

            if args.preview:
                prev = cv2.cvtColor(render(page, 1.2), cv2.COLOR_RGB2BGR).copy()
                for f in fields:
                    s = 1.2
                    color = {"text": (0, 140, 255), "textarea": (40, 170, 40), "checkbox": (220, 0, 220)}[f["type"]]
                    p0 = (int(f["x"] * s), int(f["y"] * s))
                    p1 = (int((f["x"] + f["w"]) * s), int((f["y"] + f["h"]) * s))
                    cv2.rectangle(prev, p0, p1, color, 2)
                    cv2.putText(prev, f["id"].split("-")[1], (p0[0] + 2, p0[1] + 11), cv2.FONT_HERSHEY_SIMPLEX, 0.35, color, 1)
                Path(args.preview_dir).mkdir(parents=True, exist_ok=True)
                cv2.imwrite(str(Path(args.preview_dir) / f"{doc_id}-p{pno}.png"), prev)

        total = sum(len(p["fields"]) for p in pages)
        catalog[doc_id] = {"pages": pages, "fieldCount": total}
        print(f"{doc_id:40s} pages={len(pages)} fields={total}  " + " ".join(str(len(p['fields'])) for p in pages))

    OUT_JS.parent.mkdir(parents=True, exist_ok=True)
    OUT_JS.write_text(
        "// Generated by scripts/worksheets/build.py — do not edit by hand.\n"
        "// Field positions are fractions of the page width/height.\n"
        "const worksheets = " + json.dumps(catalog, separators=(",", ":")) + ";\n"
        "export default worksheets;\n"
    )


if __name__ == "__main__":
    sys.exit(main())
