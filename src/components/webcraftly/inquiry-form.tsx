import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveInquiry, type InquiryFormValues } from "@/lib/inquiries";
import { services, type CartItem } from "@/lib/webcraftly";
import { z } from "zod";

const requestSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  phone: z.string().trim().max(40),
  businessName: z.string().trim().max(160),
  serviceName: z.string().trim().min(1, "Choose a service.").max(160),
  budget: z.string().trim().max(80),
  timeline: z.string().trim().max(120),
  referenceUrl: z.string().trim().max(2000).refine((value) => !value || /^https?:\/\//i.test(value), "Use a URL starting with http:// or https://."),
  projectDescription: z.string().trim().min(1, "Tell us a little about your project.").max(10000),
  specialInstructions: z.string().trim().max(5000),
});

const emptyValues: InquiryFormValues = {
  fullName: "", email: "", phone: "", businessName: "", serviceName: "", budget: "", timeline: "", referenceUrl: "", projectDescription: "", specialInstructions: "",
};

export function InquiryForm({ cart = [], initialService = "", inquiryType = "quote", checkout = false }: { cart?: CartItem[]; initialService?: string; inquiryType?: "quote" | "cart"; checkout?: boolean }) {
  const [values, setValues] = useState<InquiryFormValues>({ ...emptyValues, serviceName: initialService });
  const [errors, setErrors] = useState<Partial<Record<keyof InquiryFormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [inquiryId, setInquiryId] = useState("");

  function updateField(field: keyof InquiryFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = requestSchema.safeParse(values);
    if (!result.success) {
      const next: Partial<Record<keyof InquiryFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && field in values) next[field as keyof InquiryFormValues] = issue.message;
      }
      setErrors(next);
      toast.error("Please review the highlighted fields.");
      return;
    }
    setSubmitting(true);
    try {
      const id = await saveInquiry(result.data, cart, inquiryType);
      setInquiryId(id);
      toast.success("Your project request has been received.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Your request could not be sent.");
    } finally {
      setSubmitting(false);
    }
  }

  if (inquiryId) return <div className="inquiry-success" role="status">
    <span className="success-icon"><CheckCircle2 /></span><span className="eyebrow">Request received</span><h2>Let’s make something meaningful.</h2><p>Your request is saved. Keep this reference handy while we review your project details.</p><div className="inquiry-id"><span>Inquiry reference</span><strong>{inquiryId}</strong></div><p className="text-sm text-muted-foreground">This is a project inquiry, not a paid order. No payment was taken.</p><div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link to="/orders">View your requests <ArrowRight /></Link></Button><Button variant="outline" asChild><Link to="/services">Explore services</Link></Button></div>
  </div>;

  return <form className="inquiry-form" onSubmit={handleSubmit} noValidate>
    {checkout && <div className="checkout-steps" aria-label="Request steps"><span className="checkout-step-active"><i>01</i>Your details</span><span><i>02</i>Project brief</span><span><i>03</i>Send request</span></div>}
    {cart.length > 0 && <section className="form-section"><span className="form-step">01 / REVIEW</span><h2>Your selected services</h2><div className="review-items">{cart.map((item) => <div key={item.id} className="review-item"><div><strong>{item.serviceName}</strong><span>{item.packageName} package · {item.addOns.length} optional extras</span></div><span className="quote-label">Quote</span></div>)}</div><p className="text-xs text-muted-foreground">Package and extra prices have not been configured. This request will not collect payment.</p></section>}
    <section className="form-section"><span className="form-step">{cart.length ? "02" : "01"} / YOUR DETAILS</span><h2>Who should we get back to?</h2><div className="form-grid">
      <Field label="Full name" error={errors.fullName}><Input autoComplete="name" maxLength={120} required value={values.fullName} onChange={(event) => updateField("fullName", event.target.value)} placeholder="Your name" /></Field>
      <Field label="Email address" error={errors.email}><Input type="email" autoComplete="email" maxLength={255} required value={values.email} onChange={(event) => updateField("email", event.target.value)} placeholder="you@example.com" /></Field>
      <Field label="Phone number" hint="Optional"><Input type="tel" autoComplete="tel" maxLength={40} value={values.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="+91" /></Field>
      <Field label="Business name" hint="Optional"><Input autoComplete="organization" maxLength={160} value={values.businessName} onChange={(event) => updateField("businessName", event.target.value)} placeholder="Your company or brand" /></Field>
      {!cart.length && <Field label="Service you’re interested in"><select className="field-input" required value={values.serviceName} onChange={(event) => updateField("serviceName", event.target.value)}><option value="">Choose a service</option>{services.map((service) => <option key={service.slug} value={service.name}>{service.name}</option>)}<option value="Other digital solution">Other digital solution</option></select>{errors.serviceName && <span className="field-error">{errors.serviceName}</span>}</Field>}
      <Field label="Preferred budget" hint="Optional"><Input maxLength={80} value={values.budget} onChange={(event) => updateField("budget", event.target.value)} placeholder="Share a range that feels comfortable" /></Field>
      <Field label="Preferred timeline" hint="Optional"><Input maxLength={120} value={values.timeline} onChange={(event) => updateField("timeline", event.target.value)} placeholder="When would you like to begin?" /></Field>
      <Field label="Reference URL" hint="Optional" error={errors.referenceUrl}><Input type="url" maxLength={2000} value={values.referenceUrl} onChange={(event) => updateField("referenceUrl", event.target.value)} placeholder="https://example.com" /></Field>
    </div></section>
    <section className="form-section"><span className="form-step">{cart.length ? "03" : "02"} / PROJECT BRIEF</span><h2>Tell us what you have in mind.</h2><div className="form-grid"><Field className="field-span" label="Project description" error={errors.projectDescription}><Textarea required maxLength={10000} rows={5} value={values.projectDescription} onChange={(event) => updateField("projectDescription", event.target.value)} placeholder="What are you building, who is it for, and what would success look like?" /></Field><Field className="field-span" label="Required functionality or special instructions" hint="Optional" error={errors.specialInstructions}><Textarea maxLength={5000} rows={4} value={values.specialInstructions} onChange={(event) => updateField("specialInstructions", event.target.value)} placeholder="Features, integrations, or details we should know..." /></Field></div></section>
    <div className="form-submit"><p>By sending this request, you agree that WebCraftly may contact you about your project.</p><Button type="submit" size="lg" disabled={submitting}>{submitting ? <><LoaderCircle className="animate-spin" /> Sending request</> : <>Send project request <ArrowRight /></>}</Button></div>
  </form>;
}

function Field({ label, hint, error, className = "", children }: { label: string; hint?: string | undefined; error?: string | undefined; className?: string | undefined; children: React.ReactNode }) {
  return <label className={`form-field ${className}`}><span className="form-label">{label}{hint && <small>{hint}</small>}</span>{children}{error && <span className="field-error">{error}</span>}</label>;
}