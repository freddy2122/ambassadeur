import { Suspense } from "react";
import { fetchFormationPricingCatalog } from "@/lib/catalogApi";
import { FormationsListing } from "./FormationsListing";

function FormationsLoading() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
        Chargement des formations…
      </section>
    </div>
  );
}

export default async function FormationsPage() {
  const pricingCatalog = await fetchFormationPricingCatalog();

  return (
    <Suspense fallback={<FormationsLoading />}>
      <FormationsListing pricingCatalog={pricingCatalog} />
    </Suspense>
  );
}
