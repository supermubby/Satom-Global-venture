import { Link } from "@tanstack/react-router";
import { Sun, Mail, Phone, MapPin } from "lucide-react";
import { paymentConfig } from "@/lib/payment-config";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[image:var(--gradient-sun)]">
              <Sun className="size-5 text-[color:var(--sun-foreground)]" />
            </span>
            <span className="font-bold">Satom Global Ventures</span>
          </div>
          <p className="mt-3 text-sm text-primary-foreground/70">
            Custom solar energy systems designed and installed across Nigeria.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/services" className="hover:text-accent">Services</Link></li>
            <li><Link to="/pricing" className="hover:text-accent">Pricing</Link></li>
            <li><Link to="/about" className="hover:text-accent">About</Link></li>
            <li><Link to="/order" className="hover:text-accent">Custom Order</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li className="flex items-start gap-2"><Mail className="size-4 mt-0.5" />{paymentConfig.contactEmail}</li>
            <li className="flex items-start gap-2"><Phone className="size-4 mt-0.5" />+{paymentConfig.whatsappNumber}</li>
            <li className="flex items-start gap-2"><MapPin className="size-4 mt-0.5" />Lagos, Nigeria</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Payments</h4>
          <p className="text-sm text-primary-foreground/80">
            We accept OPay transfers and direct Nigerian bank transfers. Account details are shared at checkout.
          </p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Satom Global Ventures. All rights reserved.
        </div>
      </div>
    </footer>
  );
}