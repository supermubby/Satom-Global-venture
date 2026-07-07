import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Satom Global Ventures" },
      { name: "description", content: "Indicative pricing for Satom residential and commercial solar systems. Final quotes are tailored to your load and site." },
      { property: "og:title", content: "Solar Pricing — Satom Global Ventures" },
      { property: "og:description", content: "Indicative starting prices for residential and commercial solar systems." },
    ],
  }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Essential",
    price: "₦1.45M",
    tag: "1.5kVA Home Backup",
    features: ["1.5kVA inverter", "2 × 200Ah lithium", "4 × 450W panels", "Powers lights, fans, TV, fridge"],
    cta: "Order Essential",
  },
  {
    name: "Comfort",
    price: "₦3.2M",
    tag: "3.5kVA Home Hybrid",
    featured: true,
    features: ["3.5kVA hybrid inverter", "4 × 200Ah lithium", "8 × 450W panels", "Adds AC + small workshop loads"],
    cta: "Order Comfort",
  },
  {
    name: "Business",
    price: "₦6.8M+",
    tag: "7.5kVA & above",
    features: ["7.5kVA – 50kVA systems", "Commercial-grade lithium", "Remote monitoring portal", "Custom engineering"],
    cta: "Request Quote",
  },
];

function PricingPage() {
  return (
    <div>
      <section className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Pricing</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-foreground">Honest, tailored quotes.</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground text-lg">Starting prices below — your final quote depends on your loads, roof, location, and battery autonomy.</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`rounded-3xl border p-8 flex flex-col ${
              t.featured
                ? "bg-[image:var(--gradient-hero)] text-white border-transparent shadow-[var(--shadow-glow)] md:-translate-y-3"
                : "bg-card text-foreground border-border shadow-[var(--shadow-card)]"
            }`}
          >
            <div className="text-sm font-semibold uppercase tracking-widest opacity-80">{t.tag}</div>
            <div className="mt-3 text-2xl font-bold">{t.name}</div>
            <div className="mt-4 text-4xl font-bold">{t.price}<span className="text-base font-normal opacity-70"> / from</span></div>
            <ul className="mt-6 space-y-2.5 text-sm flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2"><Check className={`size-4 mt-0.5 ${t.featured ? "text-accent" : "text-primary"}`} />{f}</li>
              ))}
            </ul>
            <Button asChild variant={t.featured ? "hero" : "default"} className="mt-8">
              <Link to="/order">{t.cta}</Link>
            </Button>
          </div>
        ))}
      </section>
      <div className="mx-auto max-w-6xl px-4 pb-16 text-center text-sm text-muted-foreground">
        Prices are indicative and exclude installation logistics outside Lagos. Final quotes confirmed after site survey.
      </div>
    </div>
  );
}