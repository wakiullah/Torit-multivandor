"use client";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";
import BestProducts from "@/components/BestSelling";

export default function Home() {
  return (
    <div>
      <Hero />
      <LatestProducts />
      <BestProducts />
      <OurSpecs />
      <Newsletter />
    </div>
  );
}
