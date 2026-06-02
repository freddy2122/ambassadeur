import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-[#0b2e7a] p-6 text-white">
        <h1 className="text-2xl font-bold">Contact</h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100">
          Besoin d&apos;informations sur les formations, les inscriptions ou le programme ambassadeur ? Notre service client est disponible.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 inline-flex rounded-lg bg-[#e8f8ff] p-2 text-[#0b2e7a]">
            <Phone size={18} />
          </div>
          <h2 className="text-base font-bold text-[#0b2e7a]">Service client</h2>
          <p className="mt-2 text-sm text-slate-700">(+229) 01 66 39 22 22</p>
          <p className="text-sm text-slate-700">(+229) 01 67 65 25 72</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 inline-flex rounded-lg bg-[#e8f8ff] p-2 text-[#0b2e7a]">
            <Mail size={18} />
          </div>
          <h2 className="text-base font-bold text-[#0b2e7a]">Email</h2>
          <a href="mailto:contact@eiggroupe.com" className="mt-2 inline-block text-sm font-medium text-[#0b2e7a] hover:underline">
            contact@eiggroupe.com
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 inline-flex rounded-lg bg-[#e8f8ff] p-2 text-[#0b2e7a]">
            <MapPin size={18} />
          </div>
          <h2 className="text-base font-bold text-[#0b2e7a]">Adresse</h2>
          <p className="mt-2 text-sm text-slate-700">Bénin : Cotonou, Aïbatin - Immeuble EIG</p>
        </article>
      </section>
    </div>
  );
}
