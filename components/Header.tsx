import TopBar from "./TopBar";
import MainNav from "./MainNav";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type HeaderProps = {
  locale: Locale;
  dict: Dictionary;
};

export default function Header({ locale, dict }: HeaderProps) {
  return (
    <header>
      <TopBar locale={locale} dict={dict} />
      <MainNav locale={locale} dict={dict} />
    </header>
  );
}
