import { CopyButton } from "@/components/ui/CopyButton";
import { Link2 } from "lucide-react";

type ReferralCodeBlockProps = {
  code: string;
  personalUrl: string;
  displayUrl?: string;
};

export function ReferralCodeBlock({ code, personalUrl, displayUrl }: ReferralCodeBlockProps) {
  const shownUrl = displayUrl || personalUrl;

  return (
    <section className="rounded-eig-lg border border-slate-200 bg-white p-5 shadow-eig">
      <h3 className="text-base font-bold text-eig-blue">Mon Code Ambassadeur</h3>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex rounded-xl border border-eig-cyan/30 bg-eig-cyan/10 px-4 py-2 text-lg font-extrabold tracking-wide text-eig-blue">
          {code}
        </span>
        <CopyButton value={code} label="Copier" />
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-slate-700">Mon Lien Personnel</h4>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
            <Link2 size={16} className="shrink-0 text-eig-muted" />
            <span className="truncate">{shownUrl}</span>
          </div>
          <CopyButton value={personalUrl} label="Copier" />
        </div>
      </div>
    </section>
  );
}
