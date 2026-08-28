{
  "brand": {
    "name": "Paramount International MUN",
    "vibe": [
      "cinematic",
      "dark editorial",
      "high-production student conference",
      "confident + punchy copy",
      "one wow moment (3D committees)"
    ],
    "non_negotiables": [
      "No pricing anywhere on public site",
      "Readable text over photos via scrim",
      "Respect prefers-reduced-motion (pause hero cycle + reduce scroll motion)",
      "3D limited to committee cards only",
      "All interactive + key info elements must include data-testid"
    ]
  },

  "design_tokens": {
    "color_palette_hex": {
      "ink": {
        "bg": "#070A0F",
        "bg_2": "#0B1020",
        "surface": "#0E1426",
        "surface_2": "#121A2F",
        "border": "#1E2A44",
        "border_soft": "#162038"
      },
      "text": {
        "primary": "#F2F0EA",
        "secondary": "#C9C6BC",
        "muted": "#9A98A0",
        "disabled": "#6E7280"
      },
      "accent_brass": {
        "primary": "#C7A35A",
        "hover": "#D7B56B",
        "pressed": "#B89245",
        "subtle_fill": "#1A1710",
        "subtle_border": "#3A2F18"
      },
      "states": {
        "success": "#2FBF71",
        "warning": "#E0B84A",
        "danger": "#E35D6A",
        "info": "#4AA3DF"
      },
      "handbook": {
        "paper": "#F6F1E6",
        "ink": "#141414",
        "muted": "#5B5B5B",
        "rule": "#E6DDCC",
        "brass": "#B08A3C"
      },
      "admin": {
        "bg": "#070A0F",
        "panel": "#0E1426",
        "table_row": "#0B1020",
        "highlight": "#C7A35A"
      }
    },

    "css_variables_blueprint": {
      "where": "/app/frontend/src/index.css",
      "notes": [
        "Replace current :root and .dark HSL tokens with these HSL values OR keep shadcn structure but map to this palette.",
        "Site should default to dark theme (apply class 'dark' on html/body/root).",
        "Keep gradients minimal (<=20% viewport) and only as section background overlays."
      ],
      "tokens": "@layer base {\n  :root {\n    --radius: 0.75rem;\n\n    /* Dark editorial base */\n    --background: 222 43% 4%;      /* #070A0F */\n    --foreground: 45 22% 94%;      /* #F2F0EA */\n\n    --card: 224 44% 10%;           /* #0E1426 */\n    --card-foreground: 45 22% 94%;\n\n    --popover: 224 44% 10%;\n    --popover-foreground: 45 22% 94%;\n\n    /* Brass accent as primary */\n    --primary: 41 47% 57%;         /* #C7A35A */\n    --primary-foreground: 222 43% 4%;\n\n    --secondary: 224 44% 14%;      /* #121A2F */\n    --secondary-foreground: 45 22% 94%;\n\n    --muted: 224 30% 16%;          /* ~#162038 */\n    --muted-foreground: 240 6% 66%; /* #9A98A0 */\n\n    --accent: 224 44% 14%;\n    --accent-foreground: 45 22% 94%;\n\n    --destructive: 353 70% 63%;    /* #E35D6A */\n    --destructive-foreground: 45 22% 94%;\n\n    --border: 220 38% 19%;         /* #1E2A44 */\n    --input: 220 38% 19%;\n    --ring: 41 47% 57%;\n\n    /* Optional: chart colors tuned for dark */\n    --chart-1: 41 47% 57%;\n    --chart-2: 160 55% 46%;\n    --chart-3: 200 65% 55%;\n    --chart-4: 353 70% 63%;\n    --chart-5: 260 55% 62%;\n  }\n\n  .dark {\n    /* Keep same as :root to make dark default */\n  }\n}\n"
    },

    "typography": {
      "google_fonts": {
        "display_serif": {
          "name": "Instrument Serif",
          "fallback": "serif",
          "weights": ["400"],
          "usage": "Hero + section headlines, handbook pull-quotes"
        },
        "ui_sans": {
          "name": "Inter",
          "fallback": "system-ui",
          "weights": ["400", "500", "600"],
          "usage": "Body, nav, buttons, forms, admin"
        },
        "mono": {
          "name": "IBM Plex Mono",
          "fallback": "ui-monospace",
          "weights": ["400", "500"],
          "usage": "Countdown digits, labels, tags, schedule times, admin table meta"
        },
        "implementation_note": "Use Google Fonts <link> with font-display: swap. In React, add to public/index.html."
      },
      "tailwind_font_families": {
        "note": "Add to tailwind.config.js theme.extend.fontFamily",
        "fontFamily": {
          "display": "['Instrument Serif','ui-serif','Georgia','serif']",
          "sans": "['Inter','ui-sans-serif','system-ui']",
          "mono": "['IBM Plex Mono','ui-monospace','SFMono-Regular','Menlo','monospace']"
        }
      },
      "type_scale": {
        "h1": "text-4xl sm:text-5xl lg:text-6xl (override hero with clamp below)",
        "hero_h1_css": "font-size: clamp(2.5rem, 6vw, 5.5rem); line-height: 0.95; letter-spacing: -0.02em;",
        "h2": "text-base md:text-lg (keep subheads compact, editorial)",
        "body": "text-sm md:text-base leading-relaxed",
        "small": "text-xs md:text-sm",
        "mono_label": "font-mono text-[11px] tracking-[0.18em] uppercase",
        "countdown_digits": "font-mono tabular-nums text-3xl sm:text-4xl"
      }
    },

    "spacing_system": {
      "principle": "2–3x more spacing than feels comfortable; sections breathe like a magazine spread.",
      "section_padding": "py-16 sm:py-20 lg:py-28",
      "container": "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
      "vertical_rhythm": {
        "between_sections": "gap-16 sm:gap-20",
        "within_section": "gap-6 sm:gap-8",
        "micro": "gap-2/3/4 for labels + meta"
      },
      "grid": {
        "default": "12-col mental model; implement as Tailwind grid grid-cols-12 gap-6",
        "editorial_break": "Use asymmetry: 7/5 or 8/4 splits; avoid perfectly centered hero blocks."
      }
    },

    "radius_shadow": {
      "radius": {
        "card": "rounded-xl",
        "pill": "rounded-full",
        "button": "rounded-lg (8–12px feel)",
        "admin_panels": "rounded-xl"
      },
      "shadows": {
        "rule": "No heavy drop shadows on dark; use borders + subtle highlights.",
        "card": "shadow-[0_0_0_1px_hsl(var(--border))]",
        "hover_lift": "hover:translate-y-[-1px] hover:shadow-[0_0_0_1px_hsl(var(--ring)),0_12px_40px_-24px_rgba(0,0,0,0.8)]"
      }
    }
  },

  "visual_personality": {
    "layout_style": "Dark editorial poster + cinematic stills. Big serif headlines, compact mono labels, brass rules/lines.",
    "texture": {
      "grain": "Use a faint noise overlay (opacity 0.06–0.10) on hero + occasional section dividers.",
      "implementation": "Add a pseudo-element overlay with a tiny noise PNG or CSS noise via repeating-radial-gradient (keep subtle)."
    },
    "rules_lines": "Use 1px borders and brass hairlines to create structure (like a newspaper rule).",
    "iconography": "lucide-react only; keep stroke 1.5–1.75; icons used sparingly."
  },

  "components": {
    "component_path": {
      "shadcn_primary": "/app/frontend/src/components/ui",
      "use": [
        "button.jsx",
        "badge.jsx",
        "card.jsx",
        "accordion.jsx",
        "tabs.jsx",
        "dialog.jsx",
        "sheet.jsx",
        "carousel.jsx (optional for gallery)",
        "table.jsx (admin)",
        "form.jsx + input.jsx + label.jsx + textarea.jsx + select.jsx",
        "sonner.jsx (toasts)",
        "progress.jsx (wizard step indicator)",
        "separator.jsx",
        "tooltip.jsx"
      ]
    },

    "buttons": {
      "variants": {
        "primary": {
          "look": "Brass fill, ink text, crisp border",
          "tailwind": "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border border-[hsl(var(--primary))] hover:bg-[#D7B56B] active:bg-[#B89245] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]",
          "motion": "transition-colors duration-200"
        },
        "secondary": {
          "look": "Ink surface with brass border + subtle glow on hover",
          "tailwind": "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[#3A2F18] hover:border-[#C7A35A] hover:bg-[hsl(var(--secondary))]",
          "motion": "transition-colors duration-200"
        },
        "ghost": {
          "look": "Text button with brass underline rule",
          "tailwind": "bg-transparent text-[hsl(var(--foreground))] hover:text-[#D7B56B] underline underline-offset-4 decoration-[#3A2F18] hover:decoration-[#C7A35A]",
          "motion": "transition-colors duration-200"
        }
      },
      "sizes": {
        "md": "h-11 px-5 text-sm",
        "lg": "h-12 px-6 text-sm",
        "icon": "h-11 w-11"
      },
      "data_testid_examples": [
        "data-testid=\"hero-register-now-button\"",
        "data-testid=\"hero-view-committees-button\"",
        "data-testid=\"registration-next-step-button\""
      ]
    },

    "cards": {
      "default": {
        "tailwind": "rounded-xl bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border border-[hsl(var(--border))]",
        "header_rule": "Add a top meta row with mono label + brass dot; separate with <Separator />"
      },
      "committee_card_2d_fallback": {
        "when": "prefers-reduced-motion OR WebGL unsupported",
        "tailwind": "group rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5 hover:border-[#C7A35A] transition-colors duration-200",
        "front": "Committee name (display font) + mono tags (difficulty, seats open)",
        "back": "Agenda bullets + EB names + CTA row (Download Handbook / Register)"
      }
    },

    "pills_tags_badges": {
      "badge_style": {
        "tailwind": "font-mono text-[11px] tracking-[0.18em] uppercase rounded-full px-3 py-1 border border-[hsl(var(--border))] bg-[rgba(255,255,255,0.02)] text-[hsl(var(--foreground))]",
        "accent": "For important tags (LIVE seats): border-[#3A2F18] text-[#D7B56B]"
      },
      "persona_tabs_handbook": {
        "tailwind": "rounded-full px-4 py-2 text-sm font-medium border border-[hsl(var(--border))] data-[state=active]:bg-[#C7A35A] data-[state=active]:text-[#070A0F]"
      }
    },

    "inputs_forms": {
      "input": {
        "tailwind": "bg-[rgba(255,255,255,0.02)] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]",
        "label": "font-mono text-[11px] tracking-[0.18em] uppercase text-[hsl(var(--muted-foreground))]"
      },
      "wizard": {
        "layout": "Modal (Dialog) on desktop; full-screen Sheet/route on mobile.",
        "step_indicator": "Use Progress + mono step label (e.g., STEP 02/05).",
        "no_pricing": "Never render fee; only show 'Proceed to Payment' and UPI QR."
      }
    },

    "accordion": {
      "faq": {
        "tailwind": "border-b border-[hsl(var(--border))]",
        "trigger": "font-sans text-base md:text-lg text-[hsl(var(--foreground))] hover:text-[#D7B56B] transition-colors duration-200",
        "content": "text-[hsl(var(--muted-foreground))] leading-relaxed"
      },
      "schedule": {
        "pattern": "Two accordions: Day 1 and Day 2. Inside: timeline rows with time (mono) + title + location tag.",
        "time": "font-mono tabular-nums text-xs tracking-[0.12em] text-[hsl(var(--muted-foreground))]"
      }
    },

    "countdown": {
      "styling": {
        "digits": "font-mono tabular-nums text-3xl sm:text-4xl text-[hsl(var(--foreground))]",
        "unit": "font-mono text-[11px] tracking-[0.18em] uppercase text-[hsl(var(--muted-foreground))]",
        "frame": "rounded-2xl border border-[hsl(var(--border))] bg-[rgba(255,255,255,0.02)] p-4"
      },
      "data_testid": [
        "countdown-days",
        "countdown-hours",
        "countdown-minutes",
        "countdown-seconds"
      ]
    },

    "gallery_lightbox": {
      "grid": "Masonry-ish bento: 2 cols mobile, 6 cols desktop; mix 2x2 and 1x1 tiles.",
      "tile": "rounded-xl overflow-hidden border border-[hsl(var(--border))] hover:border-[#C7A35A] transition-colors duration-200",
      "lightbox": "Use Dialog with Carousel inside; include keyboard nav + close button with data-testid."
    },

    "admin_dashboard": {
      "tone": "Same dark editorial base, but more utilitarian: tighter spacing, clearer table density.",
      "table": {
        "use": "shadcn table.jsx",
        "row": "odd:bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(199,163,90,0.06)] transition-colors duration-150",
        "status_pill": "Badge with success/warning/danger colors; always include text label (not color-only)."
      },
      "actions": "Use DropdownMenu for row actions; status flip uses Switch with label."
    }
  },

  "hero_treatment": {
    "photo_sequence": {
      "effect": "Ken Burns (slow scale 1.05->1.12) + crossfade between 5–8 photos.",
      "timing": {
        "crossfade": "900–1200ms",
        "hold": "4500–6500ms",
        "kenburns_duration": "~7–9s"
      },
      "reduced_motion": "If prefers-reduced-motion: stop cycling; show first image only; disable ken burns."
    },
    "scrim": {
      "goal": "Always readable text over photos.",
      "css": "background: radial-gradient(1200px 600px at 20% 20%, rgba(7,10,15,0.35), rgba(7,10,15,0.85) 60%, rgba(7,10,15,0.92)), linear-gradient(180deg, rgba(7,10,15,0.55), rgba(7,10,15,0.92));",
      "restriction": "Scrim is allowed; avoid colorful gradients."
    },
    "grain_overlay": {
      "css": "opacity: 0.08; mix-blend-mode: overlay; pointer-events:none;",
      "implementation": "Pseudo-element ::after with background-image: url('/noise.png') OR CSS noise; keep subtle."
    },
    "hero_layout": {
      "pattern": "Left-aligned headline block (max-w-2xl) + right-side meta column (date, venue, countdown).",
      "headline": "Instrument Serif, clamp(2.5rem, 6vw, 5.5rem)",
      "meta": "Mono labels + brass rules"
    }
  },

  "3d_committees": {
    "libraries": {
      "already_installed": ["@react-three/fiber", "@react-three/drei", "three"],
      "optional": ["@react-three/postprocessing (only if needed; keep minimal)"]
    },
    "interaction": {
      "wow_moment": "This is the ONE big wow moment. Everything else restrained.",
      "behavior": [
        "Hover: subtle tilt + brass rim light",
        "Click: flip/morph to reveal detail panel",
        "Drag: rotate carousel slightly (optional)"
      ],
      "accessibility": "Provide 2D fallback cards + keyboard-accessible committee list below canvas."
    },
    "styling": {
      "materials": "Matte ink card with slight sheen; brass edge line; avoid neon.",
      "lighting": "One key light warm (brass), one cool fill (navy), soft ambient."
    },
    "data": {
      "api": "Committee data + live seats from backend; show 'X of Y portfolios open' as mono label.",
      "data_testid": [
        "committee-card-unga",
        "committee-card-aippm",
        "committee-card-who",
        "committee-card-uncsw",
        "committee-card-unhrc"
      ]
    }
  },

  "motion": {
    "library": "framer-motion",
    "principles": [
      "Purposeful, not decorative",
      "Section entry reveals only (fade/slide 12–20px)",
      "No constant floating animations",
      "Respect prefers-reduced-motion"
    ],
    "timings": {
      "section_enter": "duration 0.55–0.7s, ease [0.22,1,0.36,1]",
      "stagger": "0.06–0.1s",
      "hover": "150–220ms (colors only)"
    },
    "scroll": {
      "pattern": "Use whileInView with viewport={{ once: true, amount: 0.25 }}",
      "reduced_motion": "Disable transforms; keep opacity changes minimal"
    }
  },

  "page_systems": {
    "home_single_page": {
      "sections": [
        "Hero (photo sequence + countdown + CTAs)",
        "About (short punchy copy + stat strip)",
        "Gallery (bento grid + lightbox)",
        "Committees (3D showcase + fallback list)",
        "Schedule (Day 1/Day 2 accordion timeline)",
        "FAQ",
        "Registration CTA (repeat countdown + urgency)",
        "Footer"
      ],
      "nav": "Sticky top nav with mono section links; active section indicator as brass hairline."
    },

    "handbook_page": {
      "route": "/handbook",
      "visual_shift": "Feels like a printed handbook on warm paper, but still within the same brand.",
      "background": "Use handbook.paper (#F6F1E6) with subtle paper grain; text in handbook.ink (#141414).",
      "components": {
        "tabs": "shadcn tabs.jsx styled as pill-tabs (wrap on mobile)",
        "callouts": "Card with left brass rule + small mono label",
        "template_card": "Textarea-like fill-in-the-blank card with dashed border"
      },
      "type": {
        "headline": "Instrument Serif in ink",
        "labels": "IBM Plex Mono in muted",
        "body": "Inter in ink"
      },
      "data_testid": [
        "handbook-persona-tabs",
        "handbook-chapter-list",
        "handbook-download-button"
      ]
    },

    "admin": {
      "routes": ["/admin/login", "/admin"],
      "layout": "Left rail (collapsible) + main content; on mobile use Sheet for nav.",
      "login": "Single card centered vertically but content left-aligned; include password visibility toggle.",
      "dashboard": {
        "registrations_table": "Search input + filters row + table + pagination",
        "committee_editor": "Tabs per committee; edit portfolios + seat counts",
        "referral_codes": "Table + create dialog"
      },
      "data_testid": [
        "admin-login-form",
        "admin-login-submit-button",
        "admin-registrations-table",
        "admin-registration-status-switch"
      ]
    }
  },

  "image_urls": {
    "placeholders_until_real_assets": [
      {
        "category": "hero_background",
        "description": "Cinematic crowd / student energy (replace with real event photos)",
        "url": "https://images.unsplash.com/photo-1549804070-87eb7f0946b8?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      },
      {
        "category": "gallery",
        "description": "Hallway / venue vibe",
        "url": "https://images.unsplash.com/photo-1545415478-58643688b231?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      },
      {
        "category": "students_group",
        "description": "Group photo energy (replace with delegates group photo)",
        "url": "https://images.pexels.com/photos/7683728/pexels-photo-7683728.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
      }
    ],
    "real_assets_expected": [
      "delegates group photo (hero/gallery)",
      "Paramount International School building photo (venue/about)",
      "YES BANK UPI payment QR (payment step)"
    ]
  },

  "instructions_to_main_agent": {
    "global": [
      "Make dark theme default by applying className='dark' at the root (html/body/app wrapper).",
      "Replace App.css default CRA centering styles; do not center-align the whole app.",
      "Implement CSS variables in index.css as provided; map shadcn tokens to palette.",
      "Use Instrument Serif for all major headings; Inter for body; IBM Plex Mono for labels/digits.",
      "Every button/link/input/accordion trigger/tab must include a stable data-testid in kebab-case.",
      "Hero: implement photo crossfade + ken burns with prefers-reduced-motion guard.",
      "Committees: build R3F scene only for committee cards; provide 2D fallback list below.",
      "Gallery: bento grid + Dialog lightbox; optimize images (lazy, responsive sizes).",
      "Registration wizard: no pricing; final step shows UPI QR; use sonner for errors/success.",
      "Admin: use shadcn Table + Dialog + DropdownMenu; keep density higher than marketing pages."
    ],
    "tailwind_notes": [
      "Avoid transition-all; use transition-colors, transition-opacity, etc.",
      "Use tabular-nums for countdown digits.",
      "Use borders + subtle background alpha for depth instead of heavy shadows."
    ]
  },

  "general_ui_ux_design_guidelines": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
