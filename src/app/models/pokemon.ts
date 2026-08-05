export interface Pokemon {
  id: number;
  ja: string;
  en: string;
  types: string[];
}

/** 公式アートワークの URL は図鑑番号から組み立てられる */
export function artworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
