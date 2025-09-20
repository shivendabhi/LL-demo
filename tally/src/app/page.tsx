import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Background from "@/components/Background";

export default function Home() {
  return (
    <div className="h-screen w-screen bg-white relative overflow-hidden selection:bg-[rgba(68,78,170,0.15)]">
      <Background />
      <Header />
      <Hero />
    </div>
  );
}
