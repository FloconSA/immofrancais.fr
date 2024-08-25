import { useEffect, useState } from "react";
import Button from "../components/Button";
import { API_URL } from "../constants";
import House from "../components/House";
import Contact from "../components/Abstract/Contact";

const Home = () => {
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
        description: house.attributes.description,
        caracteristics: house.attributes.caracteristics.split('\n'),
        facilities: house.attributes.facilities.split('\n'),
        DPE: house.attributes.DPE,
        GES: house.attributes.GES,
        images: house.attributes.images.data.map((pic: any) => pic.attributes.url)
      }))

      setHouses(parsed.slice(0, 3))
    })()
  }, [])

  return (
    <div className="max-w-7xl mx-auto">

      {/* Hero */}
      <section className="grid grid-cols-1 md:grid-cols-2" id="#">
        <div className="flex flex-col items-center justify-center">
          <div className="grid grid-cols-1 gap-3 my-24 md:my-0">
            <img src="/home.png" alt="" className="h-12 aspect-square" />
            <div>
              <h1 className="font-black text-4xl md:text-6xl">ImmoFrançais</h1>
              <h2 className="font-normal text-2xl md:text-4xl">Propriétés à vendre</h2>
            </div>
            <div className="hidden md:block">
              <Button label="Consulter" href="/housing" as="a" />
            </div>

          </div>
        </div>
        <div className="mb-24 md:p-24">
          <img src="/lyon.png" alt="" className="object-cover rounded-md" />
        </div>
      </section>

      {/* Houses */}
      {houses.length !== 0 &&
        <section className="max-w-4xl mx-auto flex flex-col gap-8 items-center" id="new">
          <h2 className="text-3xl">Nos dernières nouveautés</h2>
          <div className="flex flex-col gap-8">
            {houses.map((house: any) => <House key={house.id} house={house} />)}
          </div>
          <div className="flex items-center mt-8">
            <Button as="a" href="/housing" label="En voir plus" />
          </div>
        </section>}


    {/* Contact */}
    <Contact />

    </div>
  )
}

export default Home;
