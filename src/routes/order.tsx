import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { paymentConfig } from "@/lib/payment-config";
import { ArrowLeft, Copy, MessageCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/order")({
  head: () => ({
    meta: [
      { title: "Custom Solar Order — Satom Global Ventures" },
      { name: "description", content: "Order a custom-designed solar system. Describe your loads and budget — pay via OPay or Nigerian bank transfer." },
      { property: "og:title", content: "Custom Solar Order — Satom Global Ventures" },
      { property: "og:description", content: "Design your custom solar system online." },
    ],
  }),
  component: OrderPage,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  email: z.string().trim().email("Enter a valid email").max(120),
  address: z.string().trim().min(5, "Enter your installation address").max(200),
  propertyType: z.string().min(1, "Select property type"),
  systemTier: z.string().min(1, "Select a system size"),
  budget: z.string().min(1, "Select a budget range"),
  appliances: z.string().trim().min(5, "List the appliances you'd like to power").max(2000),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

type FormState = z.infer<typeof schema>;

const initial: FormState = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  propertyType: "",
  systemTier: "",
  budget: "",
  appliances: "",
  notes: "",
};

function OrderPage() {
  const [form, setForm] = useState<FormState>(initial);
  const [submitted, setSubmitted] = useState<FormState | null>(null);
  const [orderId] = useState(() => `SGV-${Date.now().toString(36).toUpperCase()}`);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSubmitted(parsed.data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return <PaymentInstructions order={submitted} orderId={orderId} onBack={() => setSubmitted(null)} />;
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <section className="bg-secondary/60">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Custom Order</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-foreground">Design your solar system.</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground text-lg">Tell us what you need to power. We&apos;ll respond with a tailored proposal within 24 hours.</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <form onSubmit={onSubmit} className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-[var(--shadow-card)] grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full name" required>
              <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Jane Adekunle" />
            </Field>
            <Field label="Phone (WhatsApp preferred)" required>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+234 800 000 0000" />
            </Field>
            <Field label="Email" required>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
            </Field>
            <Field label="Installation address" required>
              <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, City, State" />
            </Field>
            <Field label="Property type" required>
              <Select value={form.propertyType} onValueChange={(v) => set("propertyType", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {["Apartment", "Bungalow", "Duplex", "Office", "Shop / Retail", "School / Clinic", "Factory / Industrial", "Farm"].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="System size needed" required>
              <Select value={form.systemTier} onValueChange={(v) => set("systemTier", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {["Not sure — please advise", "1.5kVA (Essential)", "3.5kVA (Comfort)", "5kVA", "7.5kVA", "10kVA", "15kVA+", "20kVA+ Industrial"].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Budget range (NGN)" required>
              <Select value={form.budget} onValueChange={(v) => set("budget", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {["Under ₦1.5M", "₦1.5M – ₦3M", "₦3M – ₦6M", "₦6M – ₦12M", "Above ₦12M", "Flexible"].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Appliances to power" required hint="e.g. 1 fridge, 4 fans, 6 LED bulbs, 1 TV, 1.5HP AC for 6 hours/day">
            <Textarea rows={5} value={form.appliances} onChange={(e) => set("appliances", e.target.value)} placeholder="List the appliances and approximate daily usage..." />
          </Field>

          <Field label="Additional notes" hint="Roof type, timeline, special requests...">
            <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <p className="text-sm text-muted-foreground">A refundable design deposit of <span className="font-semibold text-foreground">₦{paymentConfig.consultationFeeNGN.toLocaleString()}</span> reserves your site survey.</p>
            <Button type="submit" variant="hero" size="xl">Submit & View Payment Details</Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-sm font-medium">
        {label}{required && <span className="text-accent"> *</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function PaymentInstructions({ order, orderId, onBack }: { order: FormState; orderId: string; onBack: () => void }) {
  const summary = useMemo(() => {
    return [
      `*New Solar Order — ${orderId}*`,
      ``,
      `Name: ${order.fullName}`,
      `Phone: ${order.phone}`,
      `Email: ${order.email}`,
      `Address: ${order.address}`,
      `Property: ${order.propertyType}`,
      `System: ${order.systemTier}`,
      `Budget: ${order.budget}`,
      ``,
      `Appliances:`,
      order.appliances,
      order.notes ? `\nNotes:\n${order.notes}` : ``,
      ``,
      `Design deposit: ₦${paymentConfig.consultationFeeNGN.toLocaleString()}`,
    ].join("\n");
  }, [order, orderId]);

  const waUrl = `https://wa.me/${paymentConfig.whatsappNumber}?text=${encodeURIComponent(summary)}`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="size-4" /> Edit order
      </button>

      <div className="rounded-3xl bg-[image:var(--gradient-hero)] text-white p-8 md:p-10 shadow-[var(--shadow-glow)]">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-7 text-accent" />
          <h1 className="text-2xl md:text-3xl font-bold">Order received</h1>
        </div>
        <p className="mt-3 text-white/85">
          Thank you, {order.fullName.split(" ")[0]}. Your order reference is <span className="font-mono font-bold text-accent">{orderId}</span>. Complete your design deposit below to lock in your site survey.
        </p>
        <div className="mt-5 inline-flex items-baseline gap-2 rounded-xl bg-white/10 backdrop-blur px-4 py-2 border border-white/20">
          <span className="text-sm text-white/70">Design deposit</span>
          <span className="text-2xl font-bold text-accent">₦{paymentConfig.consultationFeeNGN.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <PayCard
          title="Pay via OPay"
          subtitle="Transfer from any bank or the OPay app"
          rows={[
            { k: "Account name", v: paymentConfig.opay.accountName },
            { k: "OPay account #", v: paymentConfig.opay.accountNumber, copy: true },
            { k: "Bank", v: "OPay (Paycom)" },
          ]}
        />
        <PayCard
          title="Pay via Bank Transfer"
          subtitle="Direct transfer to our Nigerian bank account"
          rows={[
            { k: "Bank", v: paymentConfig.bank.bankName },
            { k: "Account name", v: paymentConfig.bank.accountName },
            { k: "Account number", v: paymentConfig.bank.accountNumber, copy: true },
          ]}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold text-foreground">Next step</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          After payment, send your proof of payment with reference <span className="font-mono font-semibold text-foreground">{orderId}</span> to confirm your order.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="hero">
            <a href={waUrl} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> Send via WhatsApp</a>
          </Button>
          <Button variant="outline" onClick={() => copy(summary, "Order summary")}>
            <Copy className="size-4" /> Copy order summary
          </Button>
        </div>
      </div>

      <details className="mt-6 rounded-2xl border border-border bg-card p-6">
        <summary className="cursor-pointer font-semibold text-foreground">View your order details</summary>
        <pre className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">{summary}</pre>
      </details>
    </div>
  );
}

function PayCard({ title, subtitle, rows }: { title: string; subtitle: string; rows: { k: string; v: string; copy?: boolean }[] }) {
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <h3 className="font-semibold text-foreground text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      <dl className="mt-4 divide-y divide-border">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between py-2.5 gap-3">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">{r.k}</dt>
            <dd className="flex items-center gap-2 font-medium text-foreground text-right">
              <span className={r.copy ? "font-mono" : ""}>{r.v}</span>
              {r.copy && (
                <button onClick={() => copy(r.v)} className="p-1 rounded hover:bg-muted" aria-label="Copy">
                  <Copy className="size-3.5 text-muted-foreground" />
                </button>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}