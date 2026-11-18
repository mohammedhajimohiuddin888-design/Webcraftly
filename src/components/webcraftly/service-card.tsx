import { ArrowRight, Check, ChevronRight, Code2, FileText, PenTool, ShoppingCart, Bot, Search, Megaphone, Layers, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/webcraftly";

function getServiceIcon(slug: string) {
  switch (slug) {
    case "website-development": return <Code2 className="size-5 text-primary" />;
    case "content-development": return <FileText className="size-5 text-primary" />;
    case "ui-ux-design": return <PenTool className="size-5 text-primary" />;
    case "ecommerce-development": return <ShoppingCart className="size-5 text-primary" />;
    case "ai-integration": return <Bot className="size-5 text-primary" />;
    case "seo-optimization": return <Search className="size-5 text-primary" />;
    case "digital-marketing": return <Megaphone className="size-5 text-primary" />;
    case "web-applications": return <Layers className="size-5 text-primary" />;
    default: return <Sparkles className="size-5 text-primary" />;
  }
}

export function ServiceCard({ service, compact = false }: { service: Service; compact?: boolean }) {
  return <article className={`service-card ${service.featured ? "service-card-featured" : ""}`}>
    <div className="service-card-top"><span className="service-icon">{getServiceIcon(service.slug)}</span>{service.featured && <span className="featured-tag">Featured</span>}</div>
    <h3>{service.name}</h3><p>{service.short}</p>
    <div className="service-card-meta"><span>3 tailored packages</span><span>Request a quote</span></div>
    {!compact && <ul className="service-highlight-list">{service.includes.slice(0, 2).map((feature) => <li key={feature}><Check className="size-3.5" />{feature}</li>)}</ul>}
    <div className="service-card-actions"><Button variant="outline" asChild><Link to="/services/$slug" params={{ slug: service.slug }}>Explore service <ArrowRight /></Link></Button><Button variant="ghost" asChild><Link to="/services/$slug" params={{ slug: service.slug }} search={{ package: undefined }}>View packages <ChevronRight /></Link></Button></div>
  </article>;
}