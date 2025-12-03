import { useEffect, useState } from "react"
import { API_URL } from "../constants"
import House from "../components/House"

const Housing = () => {
  const [houses, setHouses] = useState([])

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_URL}/api/houses?sort=id:desc&populate=*`)
      const data = await res.json()

      const parsed = data.data.map((house: any) => ({
  id: house.documentId,
  name: house.name,
  type: house.type,
  price: house.price,
  rooms: house.rooms,
  bedrooms: house.bedrooms,
  surface: house.surface,
  description: house.description,
  caracteristics: (house.caracteristics || "").split('\n'),
  facilities: (house.facilities || "").split('\n'),
  DPE: house.DPE,
  GES: house.GES,
  // C'est ici que ça change pour les images v5 :
  images: house.images ? house.images.map((pic: any) => pic.url) : []
}))

      setHouses(parsed)
    })()
  }, [])

  return (
    <section className="max-w-4xl mx-auto flex flex-col gap-8 items-center" id="new">
      <h2 className="text-3xl mt-8">Tous nos biens en vente</h2>
      <div className="flex flex-col gap-8">
        {houses.map((house: any) => <House key={house.id} house={house} />)}
      </div>
    </section>
  )
}

export default Housing;
