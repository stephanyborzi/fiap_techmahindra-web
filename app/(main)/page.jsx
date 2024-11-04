import HeroCarousel from '@/components/landing-page/hero-carousel';
import Features from '@/components/landing-page/features';
import TechnologySection from '@/components/landing-page/technology';
import HowItWorks from '@/components/landing-page/how-it-works';
import StatsSection from '@/components/landing-page/stats';
import CTASection from '@/components/landing-page/cta';

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <Features />
      <TechnologySection />
      <HowItWorks />
      <StatsSection />
      <CTASection />
    </>
  );
}