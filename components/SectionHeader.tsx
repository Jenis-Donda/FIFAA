type SectionHeaderProps = {
  title: string;
  linkLabel?: string;
};

export default function SectionHeader({ title, linkLabel }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-7">
      <h2 className="font-display text-3xl m-0">{title}</h2>
      {linkLabel ? (
        <a
          className="text-brand-blue font-semibold text-sm uppercase tracking-[0.1em]"
          href="#"
        >
          {linkLabel}
        </a>
      ) : null}
    </div>
  );
}
