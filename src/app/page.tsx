import CallToAction from "@/components/CallToAction";
import Documentation from "@/components/Documentation";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Keywords from "@/components/Keywords";
import Navbar from "@/components/Navbar";
import Playground from "@/components/Playground";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Playground />
        <Documentation />
        <Keywords />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
