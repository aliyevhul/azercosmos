// Renders the small subset of Markdown the AI is asked to use: paragraphs,
// "- " / "1. " lists and **bold**. Everything is plain React text, so no
// HTML from the model is ever interpreted.

function inline(text, keyBase) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={`${keyBase}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );
}

export default function MiniMarkdown({ text, className = "" }) {
  const blocks = [];
  let list = null;
  const flush = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const raw of String(text).split("\n")) {
    const line = raw.trim();
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      const type = bullet ? "ul" : "ol";
      if (!list || list.type !== type) {
        flush();
        list = { type, items: [] };
      }
      list.items.push((bullet || numbered)[1]);
    } else if (!line) {
      flush();
    } else {
      flush();
      blocks.push({ type: "p", text: line.replace(/^#+\s*/, "") });
    }
  }
  flush();

  return (
    <div className={`space-y-2 ${className}`}>
      {blocks.map((b, i) => {
        if (b.type === "p") return <p key={i}>{inline(b.text, i)}</p>;
        const List = b.type;
        return (
          <List key={i} className={`space-y-1 pl-5 ${b.type === "ul" ? "list-disc" : "list-decimal"}`}>
            {b.items.map((item, j) => (
              <li key={j}>{inline(item, `${i}-${j}`)}</li>
            ))}
          </List>
        );
      })}
    </div>
  );
}
