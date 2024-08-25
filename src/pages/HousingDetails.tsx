import { useEffect, useState } from "react"
import { redirect, useParams } from "react-router-dom"
import { ShareIcon } from "@heroicons/react/24/outline"
import { Carousel } from "@material-tailwind/react"

import { DPE, GES } from "../components/Abstract/DPE-GES"
import { API_URL } from "../constants"
import Loading from "../components/Loading"


const HousingDetails = () => {
  const [house, setHouse] = useState(null)
  const { id } = useParams()

  const currency = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  })


  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_URL}/api/houses/${id}?populate=*`)

      if (!res.ok)
        window.location.href = '/404'

      const data = await res.json()
      const house = data.data

      setHouse({
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
      })
    })()
  }, [id])

  if (!house)
    return <Loading />

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">

      <div>
        <div className="flex justify-between font-bold">
          <h1>{house.type} - {house.name}</h1>
          <div>{currency.format(house.price)}</div>
        </div>

        <div className="flex justify-between">
          <div>{house.rooms} pièces - {house.bedrooms} chambre - Surface de {house.surface}m²</div>
          <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="hover:underline text-gray-500 flex items-center gap-1">
            <ShareIcon className="h-4 aspect-square" />
            Partager
          </button>
        </div>
      </div>

      <Carousel loop className="w-full rounded-md md:h-[44rem]">
        {house.images.map(pic =>
          <img key={pic} alt="" src={`${API_URL}${pic}`} className="h-full w-full object-cover" />
        )}
      </Carousel>

      <div className="max-w-5xl mx-auto flex flex-col gap-6 md:mt-8">
        <div>
          <h2 className="font-bold mb-3">Description</h2>
          <p className="text-gray-500 text-justify whitespace-pre-line">{house.description}</p>
        </div>

        <div>
          <h2 className="font-bold mb-3">Caractéristiques générales</h2>
          <div className="text-gray-500 grid md:grid-cols-3 md:gap-3">
            {house.caracteristics.map((e, idx) => <div key={idx}>{e}</div>)}
            </div>
        </div>

        <div>
          <h2 className="font-bold mb-3">Aménagements du bien</h2>
          <div className="text-gray-500 grid md:grid-cols-3 md:gap-3">
            {house.facilities.map((e, idx) => <div key={idx}>{e}</div>)}
            </div>
        </div>

        <div>
          <h2 className="font-bold mb-3">Bilan energétique</h2>
          <div className="grid md:grid-cols-2 gap-6 md:gap-0">
            <div className="flex flex-col justify-center items-center gap-3">
              <h3 className="text-gray-400 text-center">Diagnostique de performance energétique (DPE)</h3>
              <DPE code={house.DPE} />
            </div>
            <div className="flex flex-col justify-center items-center gap-3">
              <h3 className="text-gray-400 text-center">Indice d'émission de gaz à effet de serre (GES)</h3>
              <GES code={house.GES} />
            </div>
          </div>
        </div>

      </div>
    </div >
  )

}

export default HousingDetails
