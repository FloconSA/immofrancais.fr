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
        id: house.id,
        name: house.attributes.name,
        type: house.attributes.type,
        price: house.attributes.price,
        rooms: house.attributes.rooms,
        bedrooms: house.attributes.bedrooms,
        surface: house.attributes.surface,
        description: house.attributes.description.split('\n'),
        caracteristics: house.attributes.caracteristics.split('\n'),
        facilities: house.attributes.facilities,
        DPE: house.attributes.DPE,
        GES: house.attributes.GES,
        images: house.attributes.images.data.map((pic: any) => pic.attributes.url)
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
