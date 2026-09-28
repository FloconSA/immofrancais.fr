import { API_URL } from "./constants";

// Strapi génère des versions réduites de chaque photo (thumbnail, small, medium, large).
// On prend la version demandée si elle existe, sinon l'originale.
export const imageUrl = (pic: any, format?: "small" | "medium" | "large") =>
  `${API_URL}${pic?.formats?.[format ?? ""]?.url ?? pic?.url}`;

export const parseHouse = (house: any) => ({
  id: house.documentId,
  name: house.name,
  type: house.type,
  price: house.price,
  rooms: house.rooms,
  bedrooms: house.bedrooms,
  surface: house.surface,
  description: house.description,
  caracteristics: (house.caracteristics || "").split('\n').filter(Boolean),
  facilities: (house.facilities || "").split('\n').filter(Boolean),
  DPE: house.DPE,
  GES: house.GES,
  // Photo originale (zoom plein écran)
  images: (house.images || []).map((pic: any) => imageUrl(pic)),
  // Photo allégée pour le carrousel
  slides: (house.images || []).map((pic: any) => imageUrl(pic, "large")),
  // Photo allégée pour les cartes d'annonce
  thumbnails: (house.images || []).map((pic: any) => imageUrl(pic, "medium")),
});

export const fetchHouses = async () => {
  const res = await fetch(`${API_URL}/api/houses?sort=id:desc&populate=*`)
  const data = await res.json()
  return data.data.map(parseHouse)
}

export const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export const plural = (count: number, word: string) =>
  `${count} ${word}${count > 1 ? "s" : ""}`
