import raw from '@/assets/countries.json';

export type Country = {
  name_en: string;
  iso_3166_1_alpha_3: string; // cca3
  iso_3166_1: string;         // cca2
  continent?: string;
  region?: string;
};

export const COUNTRIES: Country[] = (raw as any[])
  .map((c) => ({
    name_en: c?.name?.common,
    iso_3166_1_alpha_3: c?.cca3,
    iso_3166_1: c?.cca2,
    continent: c?.region,
    region: c?.region,
  }))
  .filter((c) => c.name_en && c.iso_3166_1_alpha_3 && c.iso_3166_1)
  .sort((a, b) => a.name_en.localeCompare(b.name_en));

export type Section = { title: string; data: Country[] };

export const COUNTRY_SECTIONS: Section[] = (() => {
  const by: Record<string, Country[]> = {};
  for (const c of COUNTRIES) {
    const key = (c.continent || c.region || 'Other') as string;
    (by[key] ||= []).push(c);
  }
  return Object.keys(by)
    .sort()
    .map((k) => ({ title: k, data: by[k].sort((a, b) => a.name_en.localeCompare(b.name_en)) }));
})();