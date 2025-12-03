import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { ShareIcon } from "@heroicons/react/24/outline"
import { Carousel } from "@material-tailwind/react"

import { DPE, GES } from "../components/Abstract/DPE-GES"
import { API_URL } from "../constants"
import Loading from "../components/Loading"


const HousingDetails = () => {
  const [house, setHouse] = useState<any>(null)
  const { id } = useParams()

  const currency = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  })


  useEffect(() => {
    (async () => {
      // Strapi v5 cherchera par documentId grâce au changement fait dans Home.tsx
      const res = await fetch(`${API_URL}/api/houses/${id}?populate=*`)

      if (!res.ok) {
        window.location.href = '/404'
        return
      }

      const data = await res.json()
      // ADAPTATION V5 : On prend directement data.data (plus de .attributes)
      const houseData = data.data

      setHouse({
        id: houseData.id,
        name: houseData.name,
        type: houseData.type,
        price: houseData.price,
        rooms: houseData.rooms,
        bedrooms: houseData.bedrooms,
        surface: houseData.surface,
        description: houseData.description,
        // Sécurité pour éviter le crash sur les split
        caracteristics: (houseData.caracteristics || "").split('\n'),
        facilities: (houseData.facilities || "").split('\n'),
        DPE: houseData.DPE,
        GES: houseData.GES,
        // Gestion des images v5
        images: houseData.images ? houseData.images.map((pic: any) => pic.url) : []
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

      <Carousel loop className="w-full rounded-md md:h-[44rem]" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        {house.images.map((pic: string) =>
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
            {house.caracteristics.map((e: string, idx: number) => <div key={idx}>{e}</div>)}
          </div>
        </div>

        <div>
          <h2 className="font-bold mb-3">Aménagements du bien</h2>
          <div className="text-gray-500 grid md:grid-cols-3 md:gap-3">
            {house.facilities.map((e: string, idx: number) => <div key={idx}>{e}</div>)}
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
