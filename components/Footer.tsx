import type { Dictionary } from "@/i18n/dictionaries";

type FooterProps = {
  dict: Dictionary;
};

export default function Footer({ dict }: FooterProps) {
  const footerColumns = [
    {
      title: dict.footer.tournaments,
      links: ["FIFA World Cup", "Women's World Cup", "Youth", "Futsal", "Beach Soccer"],
    },
    {
      title: "FIFA+",
      links: ["Watch Live", "Originals", "Highlights", "Replay", "Calendar"],
    },
    {
      title: dict.footer.tickets,
      links: ["Sales Phases", "Hospitality", "Help Center", "Mobile Tickets"],
    },
    {
      title: dict.nav.insideFifa,
      links: ["About", "Women in Football", "Sustainability", "Integrity", "Careers"],
    },
  ];

  return (
    <footer className="bg-navy-950 text-white py-12 mt-16">
      <div className="container-main">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="font-display mt-0 mb-3 tracking-[0.06em] uppercase text-sm">
                {column.title}
              </h4>
              <ul className="list-none p-0 m-0 grid gap-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white/80 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 text-white/60 text-xs">
          {dict.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
