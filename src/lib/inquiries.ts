import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/lib/webcraftly";

export type InquiryFormValues = {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  serviceName: string;
  budget: string;
  timeline: string;
  referenceUrl: string;
  projectDescription: string;
  specialInstructions: string;
};

export async function saveInquiry(values: InquiryFormValues, cart: CartItem[], inquiryType: "quote" | "cart" = "quote") {
  const { data: { user } } = await supabase.auth.getUser();
  const id = crypto.randomUUID();
  const { error } = await supabase.from("service_inquiries").insert({
    id,
    user_id: user?.id ?? null,
    inquiry_type: inquiryType,
    full_name: values.fullName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    business_name: values.businessName.trim(),
    service_name: values.serviceName.trim(),
    budget: values.budget.trim(),
    timeline: values.timeline.trim(),
    reference_url: values.referenceUrl.trim(),
    project_description: values.projectDescription.trim(),
    special_instructions: values.specialInstructions.trim(),
    cart_snapshot: cart,
  });
  if (error) throw new Error("Your request could not be sent. Please try again.");
  return id;
}