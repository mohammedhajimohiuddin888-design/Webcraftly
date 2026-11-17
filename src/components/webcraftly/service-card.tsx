import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/webcraftly";

export function ServiceCard({ service, compact = false }: { service: Service; compact?: boolean }) {
  return <article className={`service-card ${service.featured ? "service-card-featured" : ""}`}>
    <div className="service-card-top"><span className="service-icon">{service.icon}</span>{service.featured && <span className="featured-tag">Featured</span>}</div>
    <h3>{service.name}</h3><p>{service.short}</p>
    <div className="service-card-meta"><span>3 tailored packages</span><span>Request a quote</span></div>
    {!compact && <ul className="service-highlight-list">{service.includes.slice(0, 2).map((feature) => <li key={feature}><Check className="size-3.5" />{feature}</li>)}</ul>}
    <div className="service-card-actions"><Button variant="outline" asChild><Link to="/services/$slug" params={{ slug: service.slug }}>Explore service <ArrowRight /></Link></Button><Button variant="ghost" asChild><Link to="/services/$slug" params={{ slug: service.slug }} search={{ package: undefined }}>View packages <ChevronRight /></Link></Button></div>
  </article>;
}