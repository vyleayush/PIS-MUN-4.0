import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Gallery } from "@/components/Gallery";
import { Committees } from "@/components/Committees";
import { BrochureSection } from "@/components/BrochureSection";
import { HandbookSection } from "@/components/HandbookSection";
import { Schedule } from "@/components/Schedule";
import { FAQ } from "@/components/FAQ";
import { MDMessage } from "@/components/MDMessage";
import { RegisterCTA } from "@/components/RegisterCTA";
import { Footer } from "@/components/Footer";
import { MobileBottomDock } from "@/components/MobileBottomDock";

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [location]);

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-brass selection:text-[#070A0F] overflow-x-hidden">
      <Nav />
      <main>
        <Hero />
        <About />
        <Gallery />
        <Committees />
        <BrochureSection />
        <HandbookSection />
        <Schedule />
        <FAQ />
        <MDMessage />
        <RegisterCTA />
      </main>
      <Footer />
      <MobileBottomDock />
    </div>
  );
}
