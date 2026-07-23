/**
 * MOCK / DEMO nearby points of interest for the property detail page's
 * location section. These are illustrative placeholders, not real venues —
 * replace with a real places API (or a curated POI dataset) later without
 * changing the shape consumers depend on (name/category/distanceKm).
 */

export interface NearbyPlace {
  name: string;
  category: "Parque" | "Centro comercial" | "Colegio" | "Restaurante" | "Transporte público";
  distanceKm: number;
}

const TEMPLATES: Record<NearbyPlace["category"], string[]> = {
  Parque: ["Parque El Retiro", "Parque Lineal", "Parque de Bolsillo", "Parque Metropolitano"],
  "Centro comercial": ["Centro Comercial Andino", "Plaza Central", "Centro Comercial Metrópolis"],
  Colegio: ["Colegio San Carlos", "Liceo del Norte", "Colegio Nueva Granada"],
  Restaurante: ["Restaurante La Cebichería", "Café Central", "Restaurante El Fogón"],
  "Transporte público": ["Estación TransMilenio", "Paradero de buses", "Ciclorruta principal"],
};

function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  let state = hash || 1;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

export function generateMockNearbyPlaces(seedKey: string): NearbyPlace[] {
  const random = seededRandom(seedKey);

  return (Object.keys(TEMPLATES) as NearbyPlace["category"][]).map((category) => {
    const options = TEMPLATES[category];
    const name = options[Math.floor(random() * options.length)];
    const distanceKm = Math.round((0.15 + random() * 1.4) * 10) / 10;
    return { name, category, distanceKm };
  });
}
