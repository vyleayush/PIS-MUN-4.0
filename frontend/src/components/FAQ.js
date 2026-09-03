import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "@/components/Reveal";
import { HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "Why is Paramount International MUN worth your two days?",
    a: "Because we obsess over the things that actually make a conference great: agendas with real teeth, executive boards that push you instead of babysitting you, and committees sized so every delegate gets the floor. No filler sessions, no participation-trophy energy — just sharp debate, a proper delegate kit, meals sorted, and awards that mean something. You walk out a genuinely better delegate. That's the whole point.",
  },
  {
    q: "Do I need prior MUN experience to register?",
    a: "No. We allot portfolios across experience levels — that's exactly why the registration form asks how many conferences you've done. Be honest: first-timers get beginner-friendly countries and committees, veterans get the heavier portfolios. Under-selling your experience to get an 'easy' seat usually backfires; over-selling it lands you somewhere you'll struggle. The form's experience field directly feeds allotment.",
  },
  {
    q: "What's the delegate fee, and what's included?",
    a: "The delegate fee is ₹1700 per delegate. It covers your full delegate kit — a pad file, an ID card, a pen, and a notepad — plus meals across both conference days. You'll complete payment via UPI at the final step of registration.",
  },
  {
    q: "What's your refund policy?",
    a: "No refunds. Once you register and pay, the fee is non-refundable — no partial refunds, no exceptions for withdrawal. What we do allow is a delegate replacement: you can transfer your spot to another delegate, subject to organizer approval.",
  },
  {
    q: "How does the referral / ambassador code work?",
    a: "If you've been issued a referral code, enter it at the reference-code step and your eligible rate is applied automatically — it's validated on our server, so it can't be faked. No code? You simply register at the standard rate.",
  },
  {
    q: "Can I register as a delegation / team?",
    a: "Yes. Tick the delegation option on the form and tell us your team size. Each delegate still submits their own registration so we can allot portfolios individually.",
  },
  {
    q: "How and when do I get my committee allotment?",
    a: "You pick three committee preferences during registration. After your payment is verified by the organizing committee, we allot your portfolio based on your preferences, experience level, and seat availability, and confirm it over email.",
  },
];

export const FAQ = () => (
  <section id="faq" className="section-lazy relative py-16 sm:py-20 lg:py-28 scroll-mt-16 overflow-hidden">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mono-label text-brass mb-4 flex items-center gap-2">
          <HelpCircle size={14} className="text-brass" />
          / FAQ
        </div>
        <h2 className="section-heading text-foreground">Before you ask.</h2>
      </Reveal>
      <Reveal delay={0.05}>
        <div className="mt-10 rounded-2xl border border-border bg-card/40 backdrop-blur-md p-2 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
          <Accordion type="single" collapsible>
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-b border-border/60 last:border-b-0 px-2 sm:px-4 group"
              >
                <AccordionTrigger
                  data-testid={`faq-${i}`}
                  className="text-left text-base md:text-lg text-foreground group-hover:text-brass hover:no-underline py-5 transition-colors"
                >
                  <span className="pr-4">{f.q}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5 pl-2 border-l-2 border-brass/40 ml-1 mt-1">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Reveal>
    </div>
  </section>
);
