import { Hero }               from "@/components/home/Hero";
import { StatsBar }           from "@/components/home/StatsBar";
import { ServicesSection }    from "@/components/home/ServicesSection";
import { CaseStudiesTeaser }  from "@/components/home/CaseStudiesTeaser";
import { TestimonialsTeaser } from "@/components/home/TestimonialsTeaser";
import { CTABanner }          from "@/components/home/CTABanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <ServicesSection />
      <CaseStudiesTeaser />
      <TestimonialsTeaser />
      <CTABanner />
    </>
  );
}
