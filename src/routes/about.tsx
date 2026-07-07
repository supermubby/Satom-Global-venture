import { createFileRoute } from "@tanstack/react-router";
import { Leaf, Users, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Satom Global Ventures" },
      { name: "description", content: "Learn about Satom Global Ventures, a Nigerian solar energy company designing custom power systems for homes and businesses." },
      { property: "og:title", content: "About Satom Global Ventures" },
      { property: "og:description", content: "Our mission: clean, reliable, custom-designed solar power for every Nigerian." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest">About us</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">Built in Nigeria, for Nigeria.</h1>
          <p className="mt-4 max-w-2xl text-primary-foreground/80 text-lg">
            Satom Global Ventures was founded to end the cycle of noisy generators and rising fuel bills. We design, supply, and install solar systems tailored to each customer — not off-the-shelf kits that under-deliver.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Our mission</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            To make clean, reliable solar power accessible to every Nigerian household and business. We combine engineering rigour with honest pricing, so customers know exactly what they&apos;re buying and what it will deliver.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            From a 1.5kVA home backup to a 50kVA factory hybrid system — every project starts with a real load audit, not a sales pitch.
          </p>
        </div>
        <div className="grid gap-4">
          {[
            { Icon: Award, t: "Certified engineers", d: "NABCEP-trained installers and licensed electricians on every job." },
            { Icon: Users, t: "Customer-first", d: "Honest sizing, transparent quotes, and post-install support that picks up." },
            { Icon: Leaf, t: "Cleaner future", d: "Every Satom system displaces tonnes of diesel emissions per year." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[image:var(--gradient-sun)]">
                  <Icon className="size-5 text-[color:var(--sun-foreground)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}