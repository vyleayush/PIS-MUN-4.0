import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail, MapPin } from "lucide-react";

export const Footer = () => (
  <footer className="relative border-t border-border bg-[#070A0F]">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="font-display text-2xl text-foreground">Paramount International MUN</div>
          <div className="mono-label text-brass mt-1">Chapter IV · 9–10 October 2026</div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
            A Model United Nations conference hosted by Paramount International School. Real agendas, sharp committees, and a room that rewards the well-prepared.
          </p>
        </div>
        <div>
          <div className="mono-label text-muted-foreground mb-4">Explore</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="text-foreground hover:text-brass transition-colors">Home</Link></li>
            <li><Link to="/#committees" className="text-foreground hover:text-brass transition-colors">Committees</Link></li>
            <li><Link to="/#brochure" data-testid="footer-brochure-section" className="text-foreground hover:text-brass transition-colors">Conference Brochure</Link></li>
            <li><Link to="/brochure" data-testid="footer-brochure-page" className="text-brass hover:underline transition-colors flex items-center gap-1 font-mono text-xs">Official PDF Dossier ↗</Link></li>
            <li><Link to="/#director-message" className="text-foreground hover:text-brass transition-colors">Director's Message</Link></li>
            <li><Link to="/handbook" data-testid="footer-handbook" className="text-foreground hover:text-brass transition-colors">Delegate Handbook</Link></li>
            <li><Link to="/register" className="text-foreground hover:text-brass transition-colors">Register</Link></li>
            <li><Link to="/#faq" data-testid="footer-refund" className="text-foreground hover:text-brass transition-colors">Refund Policy</Link></li>
          </ul>
        </div>
        <div>
          <div className="mono-label text-muted-foreground mb-4">Reach us</div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2 text-foreground">
              <Mail size={15} className="text-brass" />
              <a href="mailto:paramountinternationalmun.26@gmail.com" className="hover:text-brass transition-colors break-all">paramountinternationalmun.26@gmail.com</a>
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <Instagram size={15} className="text-brass" />
              <a href="https://instagram.com/theparamountmun4.o" target="_blank" rel="noreferrer" className="hover:text-brass transition-colors">@theparamountmun4.o</a>
            </li>
            <li className="flex items-start gap-2 text-foreground text-xs leading-relaxed">
              <MapPin size={15} className="text-brass shrink-0 mt-0.5" />
              <span>Paramount International School, Sector 23, Dwarka, New Delhi 110077</span>
            </li>
            <li className="pt-2 text-xs text-muted-foreground border-t border-border/50">
              <div className="font-semibold text-brass mb-1">Incharges</div>
              <div>Garima Rana: +91 88829 57182</div>
              <div>Surbhi Sachdeva: +91 97188 19355</div>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="mono-label text-muted-foreground">© 2026 Paramount International MUN. All rights reserved.</span>
        <span className="mono-label text-muted-foreground">Built for delegates, by delegates.</span>
      </div>
    </div>
  </footer>
);
