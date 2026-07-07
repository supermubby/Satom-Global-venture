import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sun, Battery, Wrench, ShieldCheck, ArrowRight, Zap, LineChart, Leaf } from "lucide-react";
import heroImg from "@/assets/hero-solar.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Satom Global Ventures — Custom Solar Energy Systems" },
      { name: "description", content: "Power your home or business with a solar system designed for your exact load. Order custom systems and pay via OPay or bank transfer." },
      { property: "og:title", content: "Satom Global Ventures — Custom Solar Energy" },
      { property: "og:description", content: "Custom solar systems designed and installed across Nigeria." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="Solar panels on a modern Nigerian rooftop" className="h-full w-full object-cover" width={1600} height={1100} />
          <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-85" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-24 md:py-36 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-medium border border-white/20">
            <Sun className="size-3.5" /> Nigeria&apos;s custom solar specialists
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Solar power, <span className="text-accent">designed around your life.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85">
            Tell us what you run — fridges, ACs, workshops, server rooms — and we&apos;ll engineer a solar + battery system that fits your roof, your budget, and the Nigerian grid.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/order">Start Your Custom Order <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild variant="outlineOnDark" size="xl">
              <Link to="/services">Explore Services</Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
            {[
              { k: "500+", v: "Systems installed" },
              { k: "24/7", v: "Monitoring" },
              { k: "5 yr", v: "Workmanship warranty" },
              { k: "100%", v: "Made for Nigeria" },
            ].map((s) => (
              <div key={s.v}>
                <div className="text-2xl font-bold text-accent">{s.k}</div>
                <div className="text-xs uppercase tracking-wider text-white/70">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Engineered for Nigerian conditions</h2>
          <p className="mt-3 text-muted-foreground">Every system is sized by a qualified engineer. No copy-paste kits.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { Icon: Zap, title: "Load-based sizing", body: "We audit your actual appliances and usage patterns before quoting." },
            { Icon: Battery, title: "Lithium-first storage", body: "Long-life LiFePO4 batteries with 10-year cycle expectancy." },
            { Icon: Wrench, title: "Clean installation", body: "Tidy cabling, surge protection, monitoring app, the lot." },
            { Icon: ShieldCheck, title: "Warranty you can use", body: "Panels 25y, inverter 5y, workmanship 5y. We pick up the phone." },
            { Icon: LineChart, title: "Live monitoring", body: "Watch your generation and consumption from your phone." },
            { Icon: Leaf, title: "Cleaner, quieter", body: "Cut diesel costs and noise without compromising uptime." },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] hover:-translate-y-1 transition-transform">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[image:var(--gradient-sun)]">
                <Icon className="size-5 text-[color:var(--sun-foreground)]" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-secondary/60 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">How it works</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              { n: "01", t: "Submit requirements", d: "Fill the custom order form with your loads and location." },
              { n: "02", t: "Pay design deposit", d: "Secure your slot via OPay or bank transfer." },
              { n: "03", t: "Site survey & design", d: "Our engineer visits, then delivers a tailored system design." },
              { n: "04", t: "Install & monitor", d: "We install, commission, and hand over a monitoring app." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-card p-6 border border-border">
                <div className="text-sm font-bold text-accent">{s.n}</div>
                <h3 className="mt-2 font-semibold text-foreground">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-3xl bg-[image:var(--gradient-hero)] p-10 md:p-14 text-white shadow-[var(--shadow-glow)]">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to design your system?</h2>
          <p className="mt-3 max-w-xl text-white/85">Share your requirements in under 3 minutes. We&apos;ll respond with a tailored proposal within 24 hours.</p>
          <div className="mt-6">
            <Button asChild variant="hero" size="xl">
              <Link to="/order">Get Custom Quote <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
