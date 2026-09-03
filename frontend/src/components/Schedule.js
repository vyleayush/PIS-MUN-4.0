import React from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "@/components/Reveal";
import { Calendar, Clock } from "lucide-react";

const DAYS = [
  {
    id: "day1",
    label: "Day 1",
    date: "9 October 2026",
    rows: [
      { time: "08:30", title: "Registration & delegate kit collection", tag: "Foyer", part: "AM" },
      { time: "09:30", title: "Opening ceremony & keynote", tag: "Auditorium", part: "AM" },
      { time: "10:30", title: "Committee Session I", tag: "Committees", part: "AM" },
      { time: "13:00", title: "Lunch", tag: "Mess", part: "PM" },
      { time: "14:00", title: "Committee Session II", tag: "Committees", part: "PM" },
      { time: "15:30", title: "Day 1 wrap & socials", tag: "Lawn", part: "PM" },
    ],
  },
  {
    id: "day2",
    label: "Day 2",
    date: "10 October 2026",
    rows: [
      { time: "09:00", title: "Committee Session III", tag: "Committees", part: "AM" },
      { time: "11:30", title: "Lunch", tag: "Mess", part: "AM" },
      { time: "13:00", title: "Committee Session IV", tag: "Committees", part: "PM" },
      { time: "14:00", title: "Final voting procedure", tag: "Committees", part: "PM" },
      { time: "16:00", title: "Closing ceremony & awards", tag: "Auditorium", part: "PM" },
    ],
  },
];

export const Schedule = () => (
  <section id="schedule" className="section-lazy relative py-16 sm:py-20 lg:py-28 scroll-mt-16 overflow-hidden">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mono-label text-brass mb-4 flex items-center gap-2">
          <Calendar size={14} className="text-brass" />
          / The Schedule
        </div>
        <h2 className="section-heading text-foreground">Two days, mapped.</h2>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-10 rounded-2xl border border-border bg-card/40 backdrop-blur-md p-2 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
          <Accordion type="single" collapsible defaultValue="day1">
            {DAYS.map((d) => (
              <AccordionItem key={d.id} value={d.id} className="border-b border-border/70 last:border-b-0 px-2 sm:px-4">
                <AccordionTrigger data-testid={`schedule-${d.id}`} className="hover:no-underline py-5 group">
                  <div className="flex items-baseline gap-4">
                    <motion.span 
                      initial={{ y: "48%", opacity: 0, rotateX: -55 }}
                      whileInView={{ y: "0%", opacity: 1, rotateX: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      style={{ perspective: "600px", display: "inline-block" }}
                      className="font-display text-3xl sm:text-4xl text-foreground group-hover:text-brass transition-colors"
                    >
                      {d.label}
                    </motion.span>
                    <span className="mono-label text-brass bg-brass/10 border border-brass/30 px-2.5 py-0.5 rounded-full text-xs">
                      {d.date}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pb-4 pt-1 space-y-1">
                    {d.rows.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="group flex items-start gap-4 sm:gap-6 p-3 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-border/50"
                      >
                        <div className="flex items-center gap-1.5 font-mono tabular-nums text-sm text-brass w-20 shrink-0 pt-0.5 font-medium">
                          <Clock size={12} className="text-brass/60 group-hover:text-brass transition-colors" />
                          <span>{r.time}</span>
                        </div>
                        <span className="mono-label text-muted-foreground w-8 shrink-0 pt-1 text-[10px]">
                          {r.part}
                        </span>
                        <span className="flex-1 text-foreground group-hover:text-[#FBE7B6] transition-colors text-sm sm:text-base">
                          {r.title}
                        </span>
                        <span className="mono-label text-muted-foreground group-hover:text-brass hidden sm:block pt-1 text-xs transition-colors">
                          {r.tag}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Reveal>
    </div>
  </section>
);
