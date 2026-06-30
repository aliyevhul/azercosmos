import Reveal from "../components/Reveal";
import { site } from "../config/site";

export default function PrivacyPolicy() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-20">
        <Reveal>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate">
            Legal
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate">Last updated: June 2026</p>
        </Reveal>

        <Reveal delay={80} className="mt-8 rounded-xl border border-dashed border-black/15 bg-card p-5 text-sm leading-relaxed text-slate">
          This is a general-purpose privacy policy template written to match
          a typical static, informational website aimed at students. It
          isn't legal advice, and {site.organization} should have it
          reviewed by a qualified lawyer — particularly given that this site
          is aimed at students, some of whom may be minors, before
          publishing it live. Edit any section below to match what this
          site actually does once you confirm details like analytics,
          hosting, and form usage.
        </Reveal>

        <div className="mt-10 space-y-10">
          <Reveal as="div">
            <h2 className="font-display text-xl font-semibold text-ink">1. Who we are</h2>
            <p className="mt-3 leading-relaxed text-slate">
              This website is operated by {site.organization}. If you have
              questions about this policy or about your data, you can reach
              us at{" "}
              <a href={`mailto:${site.contactEmail}`} className="text-stage-2 underline">
                {site.contactEmail}
              </a>
              .
            </p>
          </Reveal>

          <Reveal as="div">
            <h2 className="font-display text-xl font-semibold text-ink">2. What this site is for</h2>
            <p className="mt-3 leading-relaxed text-slate">
              This site provides career-orientation information and
              downloadable worksheets for students. It does not require an
              account, login, or payment, and most pages can be used without
              submitting any personal information at all.
            </p>
          </Reveal>

          <Reveal as="div">
            <h2 className="font-display text-xl font-semibold text-ink">3. Information we collect</h2>
            <p className="mt-3 leading-relaxed text-slate">
              We try to collect as little as possible. Depending on how this
              site is configured and hosted, the following may apply:
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-card p-5">
                <h3 className="font-display text-base font-semibold text-ink">Server and hosting logs</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate">
                  Like most websites, our hosting provider automatically
                  records basic technical information for every visit — for
                  example, IP address, browser type, device type, the page
                  requested, and the date and time of the request. This is
                  standard server-log information used for security and
                  reliability, and isn't used to identify you personally.
                </p>
              </div>
              <div className="rounded-xl bg-card p-5">
                <h3 className="font-display text-base font-semibold text-ink">Fonts and embedded resources</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate">
                  This site loads typefaces from Google Fonts. Loading a
                  font from Google's servers means your browser makes a
                  request directly to Google, which can see your IP address
                  for that request. Google's own privacy policy governs how
                  that data is handled. If you'd prefer this site not
                  contact Google's servers at all, the fonts can be
                  self-hosted instead — ask whoever maintains this site to
                  switch to local font files if that matters to you.
                </p>
              </div>
              <div className="rounded-xl bg-card p-5">
                <h3 className="font-display text-base font-semibold text-ink">Analytics (if enabled)</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate">
                  If {site.organization} adds an analytics tool to this site
                  (for example, to see which pages are most useful), that
                  tool may collect aggregate, non-identifying usage data such
                  as which pages are visited and for how long. This section
                  should be updated to name the specific tool in use, if any,
                  once one is added.
                </p>
              </div>
              <div className="rounded-xl bg-card p-5">
                <h3 className="font-display text-base font-semibold text-ink">Anything you choose to send us</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate">
                  If you email us directly — for example, at{" "}
                  {site.contactEmail} — we'll have whatever information you
                  include in that message (such as your name and email
                  address). We use it only to respond to you.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal as="div">
            <h2 className="font-display text-xl font-semibold text-ink">4. Cookies</h2>
            <p className="mt-3 leading-relaxed text-slate">
              This site does not use its own cookies for tracking or
              advertising. If a hosting provider, analytics tool, or
              third-party embed adds cookies in the future, this section
              should be updated to list them and explain what each one does.
            </p>
          </Reveal>

          <Reveal as="div">
            <h2 className="font-display text-xl font-semibold text-ink">5. Downloadable documents</h2>
            <p className="mt-3 leading-relaxed text-slate">
              The worksheets and forms on the Documents page are provided
              for your own use. Filling them in and printing or saving them
              happens on your own device — we don't see or collect what you
              write on them unless you choose to send a copy to us
              separately.
            </p>
          </Reveal>

          <Reveal as="div">
            <h2 className="font-display text-xl font-semibold text-ink">6. Information about minors</h2>
            <p className="mt-3 leading-relaxed text-slate">
              This site is designed for use by students, who may be under
              18. We don't knowingly collect more personal information from
              a young visitor than we would from any other visitor, and we
              don't ask for things like full names, home addresses, or
              school details anywhere on this site. If you're a parent or
              guardian and have concerns about a young person's use of this
              site, please contact us at {site.contactEmail}.
            </p>
          </Reveal>

          <Reveal as="div">
            <h2 className="font-display text-xl font-semibold text-ink">7. Sharing your information</h2>
            <p className="mt-3 leading-relaxed text-slate">
              We don't sell or rent visitor information. Limited technical
              data may pass through our hosting provider, our font provider
              (Google Fonts), and any analytics tool we choose to use,
              strictly to operate and maintain the site. We don't share
              anything with advertisers.
            </p>
          </Reveal>

          <Reveal as="div">
            <h2 className="font-display text-xl font-semibold text-ink">8. How long we keep information</h2>
            <p className="mt-3 leading-relaxed text-slate">
              Server logs are typically retained for a limited period by our
              hosting provider for security purposes, then deleted or
              anonymized automatically. Emails you send us are kept only as
              long as needed to respond and to keep a reasonable record of
              the conversation.
            </p>
          </Reveal>

          <Reveal as="div">
            <h2 className="font-display text-xl font-semibold text-ink">9. Your choices</h2>
            <p className="mt-3 leading-relaxed text-slate">
              You can browse this site without providing any personal
              information. If you've emailed us and would like that message
              or our reply deleted from our records, contact us at{" "}
              {site.contactEmail} and we'll take care of it.
            </p>
          </Reveal>

          <Reveal as="div">
            <h2 className="font-display text-xl font-semibold text-ink">10. Changes to this policy</h2>
            <p className="mt-3 leading-relaxed text-slate">
              If how this site handles information changes — for example,
              if we add an analytics tool or a contact form — we'll update
              this page and change the "last updated" date at the top.
            </p>
          </Reveal>

          <Reveal as="div">
            <h2 className="font-display text-xl font-semibold text-ink">11. Contact us</h2>
            <p className="mt-3 leading-relaxed text-slate">
              For any question about this policy or your information, reach{" "}
              {site.organization} at{" "}
              <a href={`mailto:${site.contactEmail}`} className="text-stage-2 underline">
                {site.contactEmail}
              </a>
              .
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
