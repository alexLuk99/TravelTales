import countriesGeoJSON from '@/assets/data/countries-github-30.json';

type CountryFeatureProps = {
  name?: string;
  name_long?: string;
  admin?: string;
  iso_a3?: string;
  iso_a2?: string;
  continent?: string;
  region_un?: string;
  subregion?: string;
  type?: string;
  fillSortKey?: number;
};

export type Country = {
  name_en: string;
  iso_3166_1_alpha_3: string; // ISO3
  iso_3166_1: string;         // ISO2
  continent: string;
  region?: string;
};

const CONTINENTS = [
  'Africa',
  'Antarctica',
  'Asia',
  'Australia and Oceania',
  'Europe',
  'North America',
  'South America',
] as const;

const CONTINENT_INDEX = new Map<string, number>(
  CONTINENTS.map((continent, index) => [continent, index])
);

const CONTINENT_OVERRIDES: Record<string, (typeof CONTINENTS)[number]> = {
  CYP: 'Europe',
  ARM: 'Europe',
  AZE: 'Europe',
  GEO: 'Europe',
  TUR: 'Europe',
};

const ISO2_OVERRIDES: Record<string, string> = {
  KOS: 'XK',
  VAT: 'VA',
};

const NAME_OVERRIDES: Record<string, string> = {
  PRK: 'North Korea',
  LAO: 'Laos',
  KOR: 'South Korea',
  RUS: 'Russia',
  CZE: 'Czechia',
  MKD: 'North Macedonia',
  MDA: 'Republic of Moldova',
  SVK: 'Slovak Republic',
  TUR: 'Türkiye',
  VAT: 'Vatican City',
};

const baseFeatureCollection = countriesGeoJSON as GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  CountryFeatureProps
>;

const normalizedFeatures = baseFeatureCollection.features.map((feature) => {
  const props = feature.properties ?? {};
  const iso3 = props.iso_a3?.toUpperCase();
  const iso2 = props.iso_a2?.toUpperCase();

  const normalizedProps: CountryFeatureProps = {
    ...props,
    iso_a3: iso3,
    iso_a2: iso2,
    fillSortKey: 0,
  };

  return {
    ...feature,
    properties: normalizedProps,
  } as GeoJSON.Feature<GeoJSON.Geometry, CountryFeatureProps>;
});

const featureCollection: GeoJSON.FeatureCollection<GeoJSON.Geometry, CountryFeatureProps> = {
  ...baseFeatureCollection,
  features: normalizedFeatures,
};

const featureIso3 = new Set(
  featureCollection.features
    .map((feature) => feature.properties?.iso_a3)
    .filter((iso): iso is string => !!iso)
);

type Ring = [number, number][];

const closeRing = (ring: Ring): Ring => {
  if (!ring.length) return ring;
  const [firstLon, firstLat] = ring[0];
  const [lastLon, lastLat] = ring[ring.length - 1];
  if (firstLon === lastLon && firstLat === lastLat) return ring;
  return [...ring, [firstLon, firstLat]];
};

const ringArea = (ring: Ring): number => {
  const closed = closeRing(ring);
  let area = 0;
  for (let i = 0; i < closed.length - 1; i++) {
    const [x0, y0] = closed[i];
    const [x1, y1] = closed[i + 1];
    area += x0 * y1 - x1 * y0;
  }
  return area / 2;
};

const ensureOrientation = (ring: Ring, clockwise: boolean): Ring => {
  const closed = closeRing(ring);
  const isClockwise = ringArea(closed) < 0;
  if (clockwise === isClockwise) return closed;
  const reversed = [...closed].reverse();
  return reversed;
};

const polygonCentroid = (ring: Ring): [number, number] => {
  const closed = closeRing(ring);
  let crossSum = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < closed.length - 1; i++) {
    const [x0, y0] = closed[i];
    const [x1, y1] = closed[i + 1];
    const cross = x0 * y1 - x1 * y0;
    crossSum += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }

  if (crossSum === 0) {
    return closed[0];
  }

  const factor = 1 / (3 * crossSum);
  return [cx * factor, cy * factor];
};

const pointInRing = (point: [number, number], ring: Ring): boolean => {
  const [px, py] = point;
  const closed = closeRing(ring);
  let inside = false;

  for (let i = 0, j = closed.length - 2; i < closed.length - 1; j = i, i++) {
    const [xi, yi] = closed[i];
    const [xj, yj] = closed[j];

    const denominator = yj - yi;
    const intersect =
      yi > py !== yj > py &&
      px <
        ((xj - xi) * (py - yi)) / (denominator === 0 ? Number.EPSILON : denominator) +
          xi;
    if (intersect) inside = !inside;
  }

  return inside;
};

const almostEqual = (a: number, b: number) => Math.abs(a - b) < 1e-9;

const ringsEqual = (a: Ring, b: Ring): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!almostEqual(a[i][0], b[i][0]) || !almostEqual(a[i][1], b[i][1])) {
      return false;
    }
  }
  return true;
};

const VATICAN_BASE_RING: Ring = [
  [12.445231, 41.907372],
  [12.446214, 41.907987],
  [12.447621, 41.907996],
  [12.448846, 41.907219],
  [12.449905, 41.906512],
  [12.450828, 41.905716],
  [12.451433, 41.904767],
  [12.45163, 41.903742],
  [12.450692, 41.903068],
  [12.449332, 41.902611],
  [12.447892, 41.902474],
  [12.446687, 41.902823],
  [12.445704, 41.903538],
  [12.445159, 41.904496],
  [12.444953, 41.905546],
];

const SAN_MARINO_BASE_RING: Ring = [
  [12.42945, 43.892056],
  [12.460456, 43.895259],
  [12.490325, 43.939159],
  [12.48216, 43.982567],
  [12.421389, 43.967219],
  [12.395654, 43.948409],
  [12.385629, 43.924534],
  [12.399581, 43.903218],
];

const createPolygonGeometry = (baseRing: Ring): GeoJSON.Polygon => {
  const outer = ensureOrientation(baseRing, false);
  return {
    type: 'Polygon',
    coordinates: [outer],
  };
};

const createHoleRing = (baseRing: Ring): Ring => ensureOrientation(baseRing, true);

const VATICAN_GEOMETRY = createPolygonGeometry(VATICAN_BASE_RING);
const SAN_MARINO_GEOMETRY = createPolygonGeometry(SAN_MARINO_BASE_RING);
const VATICAN_HOLE_RING = createHoleRing(VATICAN_BASE_RING);
const SAN_MARINO_HOLE_RING = createHoleRing(SAN_MARINO_BASE_RING);

const upsertFeature = (
  iso3: string,
  geometry: GeoJSON.Geometry,
  defaults: CountryFeatureProps
) => {
  const index = featureCollection.features.findIndex(
    (feature) => feature.properties?.iso_a3 === iso3
  );

  const baseProps: CountryFeatureProps = {
    ...defaults,
    iso_a3: iso3,
    iso_a2: defaults.iso_a2?.toUpperCase(),
    fillSortKey: 1,
  };

  if (index >= 0) {
    const existing = featureCollection.features[index];
    featureCollection.features[index] = {
      ...existing,
      geometry,
      properties: {
        ...existing.properties,
        ...baseProps,
      },
    };
  } else {
    featureCollection.features.push({
      type: 'Feature',
      geometry,
      properties: baseProps,
    });
  }

  featureIso3.add(iso3);
};

const ensureHoleInFeature = (iso3: string, holeRing: Ring) => {
  const index = featureCollection.features.findIndex(
    (feature) => feature.properties?.iso_a3 === iso3
  );
  if (index === -1) return;

  const feature = featureCollection.features[index];
  const geometry = feature.geometry;
  if (!geometry) return;

  const hole = ensureOrientation(holeRing, true);
  const centroid = polygonCentroid(hole);

  const attachHoleToPolygon = (polygon: Ring[]) => {
    if (!polygon.length) return false;
    const outer = polygon[0];
    if (!pointInRing(centroid, outer)) return false;
    const hasHole = polygon.some((ring, ringIndex) => ringIndex > 0 && ringsEqual(ring, hole));
    if (!hasHole) {
      polygon.push(hole);
    }
    return true;
  };

  if (geometry.type === 'Polygon') {
    const polygons = geometry.coordinates as Ring[];
    if (!attachHoleToPolygon(polygons)) {
      polygons.push(hole);
    }
    featureCollection.features[index] = {
      ...feature,
      geometry,
    };
    return;
  }

  if (geometry.type === 'MultiPolygon') {
    const polygons = geometry.coordinates as Ring[][];
    for (const polygon of polygons) {
      if (attachHoleToPolygon(polygon)) {
        featureCollection.features[index] = {
          ...feature,
          geometry,
        };
        return;
      }
    }

    if (polygons.length) {
      polygons[0].push(hole);
    } else {
      polygons.push([ensureOrientation(holeRing, false), hole]);
    }

    featureCollection.features[index] = {
      ...feature,
      geometry,
    };
  }
};

upsertFeature('VAT', VATICAN_GEOMETRY, {
  name: 'Vatican City',
  name_long: 'Vatican City',
  admin: 'Vatican City',
  iso_a2: 'VA',
  continent: 'Europe',
  region_un: 'Europe',
  subregion: 'Southern Europe',
  type: 'Sovereign country',
});

upsertFeature('SMR', SAN_MARINO_GEOMETRY, {
  name: 'San Marino',
  name_long: 'San Marino',
  admin: 'San Marino',
  iso_a2: 'SM',
  continent: 'Europe',
  region_un: 'Europe',
  subregion: 'Southern Europe',
  type: 'Sovereign country',
});

ensureHoleInFeature('ITA', VATICAN_HOLE_RING);
ensureHoleInFeature('ITA', SAN_MARINO_HOLE_RING);

export const COUNTRY_FEATURE_COLLECTION = featureCollection;

const isValidCode = (code: string | undefined) =>
  typeof code === 'string' && code !== '' && code !== '-99';

const pickName = (props: CountryFeatureProps) =>
  props.name_long || props.name || props.admin || '';

const continentOrder = (continent: string) =>
  CONTINENT_INDEX.get(continent) ?? CONTINENTS.length;

const mappedCountries = featureCollection.features
  .map((feature) => {
    const props = feature.properties ?? {};
    const iso3 = props.iso_a3?.toUpperCase();
    const name = (iso3 && NAME_OVERRIDES[iso3]) || pickName(props);
    const iso2 = ((iso3 && ISO2_OVERRIDES[iso3]) || props.iso_a2)?.toUpperCase();
    const rawContinent =
      (iso3 && CONTINENT_OVERRIDES[iso3]) || props.continent;
    const continent =
      rawContinent === 'Oceania' ? 'Australia and Oceania' : rawContinent;
    const region = props.region_un || props.subregion;

    return {
      name_en: name,
      iso_3166_1_alpha_3: iso3 ?? '',
      iso_3166_1: iso2 ?? '',
      continent: continent ?? 'Other',
      region: region ?? undefined,
    };
  })
  .filter(
    (c) =>
      c.name_en &&
      isValidCode(c.iso_3166_1_alpha_3) &&
      isValidCode(c.iso_3166_1) &&
      c.continent
  );

export const COUNTRIES: Country[] = mappedCountries.sort((a, b) => {
  const continentDiff = continentOrder(a.continent) - continentOrder(b.continent);
  if (continentDiff !== 0) return continentDiff;
  return a.name_en.localeCompare(b.name_en);
});

export type Section = { title: string; data: Country[] };

export const COUNTRY_SECTIONS: Section[] = (() => {
  const continentSet = new Set<string>(CONTINENTS);

  const byContinent = new Map<string, Country[]>();
  for (const country of COUNTRIES) {
    const key = continentSet.has(country.continent) ? country.continent : 'Other';
    const bucket = byContinent.get(key);
    if (bucket) {
      bucket.push(country);
    } else {
      byContinent.set(key, [country]);
    }
  }

  const sections: Section[] = CONTINENTS.map((title) => ({
    title,
    data: (byContinent.get(title) ?? [])
      .slice()
      .sort((a, b) => a.name_en.localeCompare(b.name_en)),
  })).filter((section) => section.data.length > 0);

  if (byContinent.has('Other')) {
    sections.push({
      title: 'Other',
      data: (byContinent.get('Other') ?? [])
        .slice()
        .sort((a, b) => a.name_en.localeCompare(b.name_en)),
    });
  }

  return sections;
})();
