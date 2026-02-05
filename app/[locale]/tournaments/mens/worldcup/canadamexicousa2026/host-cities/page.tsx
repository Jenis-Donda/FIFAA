import { Metadata } from "next";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import WorldCupHeader from "@/components/worldcup/WorldCupHeader";
import HostCountriesAndCities from "@/components/worldcup/HostCountriesAndCities";
import PromoCarousel from "@/components/worldcup/PromoCarousel";
import { fetchPromoCarousel } from "@/lib/api";

type PageProps = {
    params: { locale: string };
};

export default async function HostCitiesPage({ params }: PageProps) {
    const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
    const dict = getDictionary(locale);

    const carouselData = await fetchPromoCarousel(locale);

    return (
        <>
            <WorldCupHeader locale={locale} dict={dict} />
            <HostCountriesAndCities />
            <PromoCarousel carouselData={carouselData} />
        </>
    );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";

    return {
        title: "Host Countries and Cities | FIFA World Cup 2026™",
        description: "Explore the host countries and cities for the FIFA World Cup 2026™",
    };
}