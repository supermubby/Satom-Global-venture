import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, Building2, Factory, Wrench, BatteryCharging, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Satom Global Ventures" },
      { name: "description", content: "Residential, commercial, and industrial solar installations, hybrid inverters, battery storage, and ongoing maintenance." },
      { property: "og:title", content: "Solar Services — Satom Global Ventures" },
      { property: "og:description", content: "Residential, commercial, and industrial solar systems designed for Nigeria." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  { Icon: Home, t: "Residential Solar", d: "1.5kVA – 10kVA hybrid systems for homes, with battery backup and silent operation." },
  { Icon: Building2, t: "Commercial Solar", d: "Offices, schools, shops and clinics — sized for daytime loads with battery resilience." },
  { Icon: Factory, t: "Industrial Solar", d: "20kVA+ three-phase systems for factories, farms and large facilities." },
  { Icon: BatteryCharging, t: "Battery & Inverter Upgrades", d: "Swap your old tubular batteries for lithium and add solar later." },
  { Icon: Wrench, t: "Maintenance & Servicing", d: "Annual cleaning, performance audits, and 24/7 remote monitoring." },
  { Icon: Sun, t: "Solar Borehole & Water", d: "Solar-powered water pumping for farms, estates, and rural communities." },
];

function ServicesPage() {
  return (
    <div>
      <section className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">What we do</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-foreground">Solar services, end-to-end.</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground text-lg">From a single battery swap to a multi-string industrial installation — we cover the full lifecycle.</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 grid gap-5 md:grid-cols-3">
        {services.map(({ Icon, t, d }) => (
          <div key={t} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] hover:-translate-y-1 transition-transform">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[image:var(--gradient-sun)]">
              <Icon className="size-5 text-[color:var(--sun-foreground)]" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">{t}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Not sure what you need?</h2>
          <p className="mt-3 max-w-xl text-primary-foreground/80">Submit your appliance list and we&apos;ll recommend the right system size and configuration.</p>
          <div className="mt-6">
            <Button asChild variant="hero" size="xl"><Link to="/order">Request Custom Design</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}