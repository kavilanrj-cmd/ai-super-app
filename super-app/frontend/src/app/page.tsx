'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks';
import LenisProvider from '@/components/cinematic/LenisProvider';
import CursorGlow from '@/components/cinematic/CursorGlow';
import CinematicNavbar from '@/components/cinematic/CinematicNavbar';
import CinematicHero from '@/components/cinematic/CinematicHero';
import AIWorkspace from '@/components/cinematic/AIWorkspace';
import AppBuilderShowcase from '@/components/cinematic/AppBuilderShowcase';
import CareerSection from '@/components/cinematic/CareerSection';
import DocumentIntelligence from '@/components/cinematic/DocumentIntelligence';
import CreativeAI from '@/components/cinematic/CreativeAI';
import AgentNetwork from '@/components/cinematic/AgentNetwork';
import StatsSection from '@/components/cinematic/StatsSection';
import FinalCTA from '@/components/cinematic/FinalCTA';
import CinematicFooter from '@/components/cinematic/CinematicFooter';

export default function Home() {
  const { loadUser } = useAuth();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <LenisProvider>
      <div className="relative min-h-screen bg-[#030308] text-white overflow-x-hidden selection:bg-primary-500/30 selection:text-white">
        {/* Ambient subtle cursor glow */}
        <CursorGlow />

        {/* Cinematic sticky dynamic navbar */}
        <CinematicNavbar />

        <main className="relative z-10 w-full">
          {/* SECTION 1 — HERO with React Three Fiber AI Core */}
          <CinematicHero />

          {/* SECTION 2 — AI WORKSPACE (Central Console & Modules) */}
          <AIWorkspace />

          {/* SECTION 3 — APP BUILDER (The Flagship Experience) */}
          <AppBuilderShowcase />

          {/* SECTION 4 — CAREER INTELLIGENCE (End-to-End Workflow) */}
          <CareerSection />

          {/* SECTION 5 — DOCUMENT INTELLIGENCE (Visual RAG Pipeline) */}
          <DocumentIntelligence />

          {/* SECTION 6 — CREATIVE + DEVELOPER AI (3D Tilt Gallery) */}
          <CreativeAI />

          {/* SECTION 7 — AI AGENT NETWORK (Full-Screen Neural Mesh) */}
          <AgentNetwork />

          {/* SECTION 8 — STATISTICS (Animated Full-Width Strip) */}
          <StatsSection />

          {/* SECTION 9 — FINAL CTA (Dramatic Conclusion) */}
          <FinalCTA />
        </main>

        {/* Global Cinematic Footer */}
        <CinematicFooter />
      </div>
    </LenisProvider>
  );
}
