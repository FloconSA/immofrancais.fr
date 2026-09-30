// Plan du site pour Google (https://immo-francais.fr/sitemap.xml) : les pages fixes et chaque annonce publiée.
// Les annonces sont relues dans Strapi : une nouvelle annonce y figure sans remettre le site en ligne.

const SITE_URL = "https://immo-francais.fr"
const API_URL = "https://backend-immo-production-7c35.up.railway.app"

type Entry = { path: string; lastmod?: string }

const listHouses = async () => {
  const entries: Entry[] = []
  for (let page = 1, pageCount = 1; page <= pageCount; page++) {
    const query = new URLSearchParams({
      "fields[0]": "updatedAt",
      "pagination[pageSize]": "100",
      "pagination[page]": String(page),
    })
    const res = await fetch(`${API_URL}/api/houses?${query}`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`Strapi : erreur ${res.status}`)
    const { data, meta } = await res.json()
    for (const house of data ?? []) {
      entries.push({ path: `/housing/${encodeURIComponent(house.documentId)}`, lastmod: house.updatedAt })
    }
    pageCount = meta?.pagination?.pageCount ?? 1
  }
  return entries
}

export default async () => {
  let houses: Entry[] = []
  let complete = true
  try {
    houses = await listHouses()
  } catch (error) {
    // Serveur des annonces indisponible : on donne au moins les pages fixes
    complete = false
    console.error(error)
  }

  // L'accueil et la liste changent quand une annonce est ajoutée ou modifiée
  const latest = houses.map((house) => house.lastmod ?? "").sort().at(-1) || undefined
  const entries: Entry[] = [
    { path: "/", lastmod: latest },
    { path: "/housing", lastmod: latest },
    { path: "/simulateurs" },
    { path: "/contact" },
    ...houses,
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(({ path, lastmod }) => `  <url><loc>${SITE_URL}${path}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`)
  .join("\n")}
</urlset>
`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      // Gardé une heure par Netlify ; jamais gardé s'il manque les annonces
      "Netlify-CDN-Cache-Control": complete ? "public, s-maxage=3600, stale-while-revalidate=86400" : "no-store",
    },
  })
}

export const config = { path: "/sitemap.xml" }
