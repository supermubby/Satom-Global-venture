import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { paymentConfig } from "@/lib/payment-config";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Satom Global Ventures" },
      { name: "description", content: "Get in touch with Satom Global Ventures for solar consultations, quotes, and support." },
      { property: "og:title", content: "Contact Satom Global Ventures" },
      { property: "og:description", content: "Call, email, or WhatsApp our solar team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const cards = [
    { Icon: Phone, t: "Call us", v: `+${paymentConfig.whatsappNumber}`, href: `tel:+${paymentConfig.whatsappNumber}` },
    { Icon: MessageCircle, t: "WhatsApp", v: "Chat with our sales team", href: `https://wa.me/${paymentConfig.whatsappNumber}` },
    { Icon: Mail, t: "Email", v: paymentConfig.contactEmail, href: `mailto:${paymentConfig.contactEmail}` },
    { Icon: MapPin, t: "Office", v: "Lagos, Nigeria", href: "#" },
  ];
  return (
    <div>
      <section className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Contact</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-foreground">Let&apos;s talk solar.</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground text-lg">Reach out for a free consultation, a quote, or post-install support.</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ Icon, t, v, href }) => (
          <a key={t} href={href} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] hover:-translate-y-1 transition-transform">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[image:var(--gradient-sun)]">
              <Icon className="size-5 text-[color:var(--sun-foreground)]" />
            </div>
            <div className="mt-4 font-semibold text-foreground">{t}</div>
            <div className="mt-1 text-sm text-muted-foreground break-all">{v}</div>
          </a>
        ))}
      </section>
    </div>
  );
}