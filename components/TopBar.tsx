import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type TopBarProps = {
  locale: Locale;
  dict: Dictionary;
};

export default function TopBar({ locale, dict }: TopBarProps) {
  return (
    <div className="bg-fifa-topbar text-white h-10 w-full">
    </div>
  );
}
