import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eig-blue">{eyebrow}</p>
      ) : null}
      <h2 className={cn("mt-1 text-2xl font-extrabold text-eig-blue md:text-3xl", titleClassName)}>
        <span className="box-decoration-clone bg-eig-yellow/35 px-1">{title}</span>
      </h2>
      {subtitle ? <p className={cn("mt-2 text-sm text-eig-muted md:text-base", align === "center" && "mx-auto max-w-2xl")}>{subtitle}</p> : null}
    </div>
  );
}
