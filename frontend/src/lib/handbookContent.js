// "The Delegate Diaries" — persona content
export const PERSONAS = [
  {
    id: "start",
    tab: "Where do I even start?",
    hero: "Where do I even start?",
    subtitle: "the blank-page problem",
    statusTag: "Total blank",
    hook: "You registered on a whim, the agenda reads like a legal document, and every guide online assumes you already know what a 'GSL' is. Breathe. Everyone in that room started exactly here.",
    diagnostic: {
      prompt: "Check what's true for you — two or more, and this is your tab:",
      items: [
        "I don't fully understand my committee's agenda yet",
        "I've never spoken in a formal debate",
        "I don't know what documents I'm supposed to produce",
        "I'm mostly worried about looking stupid",
      ],
    },
    chapters: [
      {
        n: "1", title: "Understand the room, not the rules",
        oneliner: "Procedure is the floor, not the ceiling.",
        body: [
          "Before you memorise a single rule of procedure, understand what your committee actually does. UNGA debates and recommends. A crisis cabinet acts and reacts. AIPPM is a political knife-fight in a room. The 'right' way to behave changes entirely based on which of these you're in.",
          "Read your agenda three times. First for gist. Second with a highlighter on every phrase you don't understand. Third to write, in one sentence, what your country/character actually wants. That one sentence is your whole conference.",
        ],
        callout: { label: "Reframe", text: "You're not being tested on trivia. You're being asked: given who you are, what would you push for — and can you convince the room?" },
      },
      {
        n: "2", title: "Build a one-page brief",
        oneliner: "If it doesn't fit on one page, you don't understand it yet.",
        body: [
          "Your position, three arguments, three facts, and the two countries you'd ally with. That's it. That single page will out-perform a 20-page dossier you never re-read.",
        ],
      },
    ],
    template: {
      label: "Your first speech, filled in",
      lines: [
        "Honourable chair, the delegate of [COUNTRY] believes that [AGENDA] cannot be solved until we address [YOUR ONE ISSUE].",
        "We propose [ONE CONCRETE ACTION], and we invite [ALLY COUNTRY] to work with us on it.",
      ],
    },
    closing: { line: "Start before you feel ready.", quote: "\"Confidence is a result, not a prerequisite. Speak once, and the second time is easy.\"" },
  },
  {
    id: "first-timer",
    tab: "First Timer",
    hero: "First Timer",
    subtitle: "your first placard",
    statusTag: "Nervous but in",
    hook: "You know the basics. You've watched a YouTube MUN or two. Now you actually have to open your mouth in a room full of strangers who all sound more confident than you feel. Here's the truth: half of them are faking it.",
    diagnostic: {
      prompt: "Check what's true for you:",
      items: [
        "I freeze when the chair opens the speakers' list",
        "I have points but can't structure them fast enough",
        "I don't know when to raise which motion",
        "I've prepared, but I panic when someone attacks my point",
      ],
    },
    chapters: [
      {
        n: "1", title: "Speak in the first hour",
        oneliner: "The longer you wait, the heavier it gets.",
        body: [
          "The single biggest first-timer mistake is waiting for the 'perfect' moment. It never comes. Raise your placard in the first General Speakers' List and say something small but clear. Once you've broken the seal, everything after is downtime.",
          "Your first speech does not need to be brilliant. It needs to exist. 'The delegate of X believes the core issue here is Y, and looks forward to working with the committee on it' is a completely acceptable first speech.",
        ],
        callout: { label: "Analogy", text: "Speaking in committee is like jumping into cold water. Standing at the edge thinking about it is worse than the jump." },
      },
      {
        n: "2", title: "Master three motions and ignore the rest",
        oneliner: "You don't need the whole rulebook to win.",
        body: [
          "Motion to open the GSL, motion for a moderated caucus, motion for an unmoderated caucus. That's 90% of what you'll use. Learn those cold and you'll never look lost, even if you forget the fancy ones.",
        ],
      },
      {
        n: "3", title: "Get attacked, stay calm",
        oneliner: "A point of information is not a personal insult.",
        body: [
          "When someone challenges you, don't defend everything. Concede the small thing, then redirect to your strongest point. 'The delegate raises a fair concern on cost — which is exactly why our proposal phases funding over three years.' Calm beats loud, every single time.",
        ],
      },
    ],
    template: {
      label: "GSL speech skeleton",
      lines: [
        "The delegate of [COUNTRY] rises to address [AGENDA].",
        "Our position rests on three points: [ONE], [TWO], and [THREE].",
        "We therefore urge the committee to [ACTION], and yield our time to the chair.",
      ],
    },
    closing: { line: "Nobody remembers your shaky first speech.", quote: "\"They remember the delegate who kept showing up to the mic. Be that one.\"" },
  },
  {
    id: "regular",
    tab: "Regular Delegate",
    hero: "Regular Delegate",
    subtitle: "breaking the plateau",
    statusTag: "Stalled progress",
    hook: "You're good. You speak well, you know procedure, you're never the weakest in the room. And yet the awards keep going to someone else. The gap between 'solid' and 'special' is real — and it's not about talking more.",
    diagnostic: {
      prompt: "Check what's true for you:",
      items: [
        "I speak a lot but rarely change the room's direction",
        "My blocs form around me but fall apart under pressure",
        "My speeches are polished but forgettable",
        "I'm always in the top 5 but never number one",
      ],
    },
    chapters: [
      {
        n: "1", title: "Stop performing, start steering",
        oneliner: "Influence is quieter than you think.",
        body: [
          "The plateau delegate treats committee as a speaking contest. The award-winner treats it as a negotiation they happen to be narrating. Before every unmod, decide the one outcome you want from it — a clause, an ally, a split in the opposing bloc — and work the room toward it. Speeches are just the visible tip.",
        ],
        callout: { label: "Reframe", text: "Chairs don't award the loudest voice. They award the delegate whose fingerprints are on the final document." },
      },
      {
        n: "2", title: "Own a clause, not a speech",
        oneliner: "Authorship is the currency of committee.",
        body: [
          "Pick one substantive clause of the resolution and make it yours — draft it, defend it, get others to co-sponsor it. A delegate associated with a specific, adopted idea beats one associated with 'good speaking' every time.",
        ],
      },
    ],
    template: {
      label: "The bloc-forming pitch",
      lines: [
        "Look, [COUNTRY] and [COUNTRY], we all want [SHARED GOAL].",
        "I'll draft the clause on [YOUR AREA] if you take [THEIR AREA] — we present as one bloc.",
        "That way none of us gets sidelined when voting starts.",
      ],
    },
    closing: { line: "Good delegates react. Great ones set the agenda.", quote: "\"Stop asking to be heard. Start deciding what the room talks about next.\"" },
  },
  {
    id: "experienced",
    tab: "Experienced",
    hero: "Experienced",
    subtitle: "sharpening the edge",
    statusTag: "Comfortable — careful",
    hook: "You've won before. You walk in knowing you belong. The danger at your level isn't nerves — it's autopilot. The moves that won you your first gavel are now exactly what a sharp chair is bored of seeing.",
    diagnostic: {
      prompt: "Check what's true for you:",
      items: [
        "I run the same playbook every conference",
        "I dominate early but coast in the second half",
        "I win procedure but lose the intangible 'diplomacy' marks",
        "Newer delegates copy me — and sometimes beat me at it",
      ],
    },
    chapters: [
      {
        n: "1", title: "Diagnose the committee, then adapt",
        oneliner: "The best delegates are situational, not scripted.",
        body: [
          "A cabinet crisis rewards decisiveness; UNCSW rewards nuance; AIPPM rewards raw political instinct. Reading which game you're in — and switching registers accordingly — is the skill that separates repeat winners from one-hit wonders.",
        ],
        callout: { label: "Edge", text: "Mentor a first-timer in your bloc. Nothing sharpens your own fundamentals like having to explain them." },
      },
      {
        n: "2", title: "Win the room you're not speaking to",
        oneliner: "Diplomacy marks are earned in the unmod, not the GSL.",
        body: [
          "At your level, the executive board is watching how you handle people, not just the mic. Bring a wavering delegate into your bloc. Defuse a clash you're not even part of. That's the behaviour that turns a strong delegate into a memorable one.",
        ],
      },
    ],
    template: {
      label: "The crisis directive",
      lines: [
        "Given [DEVELOPMENT], [YOUR CHARACTER] directs [ACTOR] to [ACTION].",
        "Objective: [STRATEGIC GOAL]. Contingency if it fails: [PLAN B].",
      ],
    },
    closing: { line: "Experience is a floor, not a trophy.", quote: "\"The moment you think you've mastered committee is the moment a first-timer starts studying your patterns.\"" },
  },
  {
    id: "press",
    tab: "International Press",
    hero: "International Press",
    subtitle: "the story behind the room",
    statusTag: "Watching everything",
    hook: "You're not here to pass a resolution. You're here to capture the room — the alliances, the collapses, the quotable disasters. IP is the most underrated seat at any MUN, and the hardest to do brilliantly.",
    diagnostic: {
      prompt: "Check what's true for you:",
      items: [
        "I struggle to turn hours of debate into one sharp story",
        "My reports read like minutes, not journalism",
        "I capture what was said but not what it meant",
        "I'm not sure whether to be neutral or have an angle",
      ],
    },
    chapters: [
      {
        n: "1", title: "Find the tension, not the transcript",
        oneliner: "A report that lists speeches is a report nobody reads.",
        body: [
          "Every committee has one live wire — the rivalry, the doomed bloc, the delegate over-promising. Your job is to find it by the first unmod and follow it. Facts are your evidence; the tension is your story.",
        ],
        callout: { label: "Craft", text: "Lead with the moment, not the schedule. 'The alliance cracked at 2:14 PM' beats 'The committee reconvened after lunch.'" },
      },
      {
        n: "2", title: "Quote like a journalist, caption like a director",
        oneliner: "The right quote does the work of a paragraph.",
        body: [
          "Collect verbatim lines. A single sharp quote — attributed and in context — carries more weight than your summary of it. If you're on photo/caricature, treat every caption as a headline: short, pointed, unmistakable.",
        ],
      },
    ],
    template: {
      label: "The report lede",
      lines: [
        "[COMMITTEE] spent the morning pretending to agree on [AGENDA].",
        "By [TIME], [DELEGATE/COUNTRY] had made that impossible — [WHAT HAPPENED].",
        "The question now isn't [SURFACE ISSUE]. It's [THE REAL STAKES].",
      ],
    },
    closing: { line: "Everyone else argues. You decide how it's remembered.", quote: "\"The delegates write the resolution. The press writes the history.\"" },
  },
];
