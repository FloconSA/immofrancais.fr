import { useMemo, useState } from "react"
import HouseCard, { HouseCardSkeleton } from "../components/HouseCard"
import Reveal, { RisingWords } from "../components/Reveal"
import { Segmented } from "../components/simulators/fields"
import { useHouses } from "../lib/houses"
import { plural } from "../lib/format"

type Sort = "recent" | "price-asc" | "price-desc" | "surface"

const SORTS: { value: Sort; label: string }[] = [
  { value: "recent", label: "Récents" },
  { value: "price-asc", label: "Prix ↑" },
  { value: "price-desc", label: "Prix ↓" },
  { value: "surface", label: "Surface" },
]

const Listings = () => {
  const { houses, loading, error, retry } = useHouses()
  const [sort, setSort] = useState<Sort>("recent")

  const sorted = useMemo(() => {
    const list = [...(houses ?? [])]
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price)
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price)
    if (sort === "surface") list.sort((a, b) => b.surface - a.surface)
    return list
  }, [houses, sort])

  // Le premier bien est mis en avant tant que l'ordre est « récents »
  const [first, ...rest] = sorted
  const featureFirst = sort === "recent" && !!first

  return (
    <div className="container-page pb-24 pt-32 md:pb-36 md:pt-40">
      <header className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <p className="eyebrow rise">Catalogue</p>
          <h1 className="display-1 mt-5">
            <RisingWords text="Biens" delay={80} />
            <span className="serif-accent">
              <RisingWords text="à vendre." delay={180} />
            </span>
          </h1>
          <p className="rise mt-5 text-lg text-muted" style={{ ["--delay" as string]: "300ms" }}>
            {houses ? plural(houses.length, "bien disponible", "biens disponibles") : "Chargement des annonces…"}
          </p>
        </div>
        {houses && houses.length > 1 && (
          <Segmented<Sort> label="Trier par" value={sort} onChange={setSort} options={SORTS} size="sm" className="rise" />
        )}
      </header>

      <div className="mt-16 md:mt-20">
        {loading && <HouseCardSkeleton featured />}

        {error && (
          <div className="rounded-3xl bg-soft p-10 text-center">
            <p className="text-lg">Les annonces n'ont pas pu être chargées.</p>
            <p className="mt-1 text-muted">Le serveur met parfois quelques secondes à se réveiller.</p>
            <button type="button" onClick={retry} className="btn-primary btn-md mt-6">Réessayer</button>
          </div>
        )}

        {houses && houses.length === 0 && (
          <div className="rounded-3xl bg-soft p-10 text-center">
            <p className="text-lg">Aucun bien en vente pour le moment.</p>
            <p className="mt-1 text-muted">De nouvelles annonces arrivent bientôt.</p>
          </div>
        )}

        {featureFirst && (
          <Reveal>
            <HouseCard house={first} featured priority />
          </Reveal>
        )}

        {(featureFirst ? rest : sorted).length > 0 && (
          <div className={featureFirst ? "mt-20 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"}>
            {(featureFirst ? rest : sorted).map((house, i) => (
              <Reveal key={house.id} delay={(i % 3) * 90}>
                <HouseCard house={house} priority={!featureFirst && i < 3} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Listings
