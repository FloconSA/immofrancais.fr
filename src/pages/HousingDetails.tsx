import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { ShareIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Carousel } from "@material-tailwind/react"

import { DPE, GES } from "../components/Abstract/DPE-GES"
import { API_URL } from "../constants"
import Loading from "../components/Loading"

const HousingDetails = () => {
  const [house, setHouse] = useState<any>(null)
  // Mémoire pour savoir si le zoom est actif
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { id } = useParams()

  const currency = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  })

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_URL}/api/houses/${id}?populate=*`)

      if (!res.ok) {
        window.location.href = '/404'
        return
      }

      const data = await res.json()
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
        caracteristics: (houseData.caracteristics || "").split('\n'),
        facilities: (houseData.facilities || "").split('\n'),
        DPE: houseData.DPE,
        GES: houseData.GES,
        images: houseData.images ? houseData.images.map((pic: any) => pic.url) : []
      })
    })()
  }, [id])

  if (!house)
    return <Loading />

  // Fonction pour fermer le zoom proprement
  const closeZoom = () => setSelectedImage(null);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 relative">

      {/* --- MODALE DE ZOOM AMÉLIORÉE --- */}
      {selectedImage && (
        <div 
          // MODIFICATION ICI : Fond moins noir (60%) et ajout d'un flou (backdrop-blur-md) pour l'esthétique
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 cursor-pointer transition-all duration-300"
          onClick={closeZoom} // Ferme si on clique sur le fond
        >
          {/* Bouton Fermer (Croix) avec une petite ombre pour ressortir */}
          <button 
            onClick={closeZoom}
            className="absolute top-5 right-5 z-50 text-white/80 hover:text-white transition"
          >
            <XMarkIcon className="h-10 w-10 drop-shadow-lg" />
          </button>

          {/* L'image en grand avec une ombre douce */}
          <img 
            src={`${API_URL}${selectedImage}`} 
            alt="Agrandissement" 
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()} // Empêche de fermer si on clique sur l'image
          />
        </div>
      )}
      {/* ----------------------- */}

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

      {/* --- CARROUSEL NETTOYÉ --- */}
      <div className="relative z-0">
        <Carousel 
          loop 
          className="w-full rounded-md md:h-[44rem]"
          placeholder={undefined} 
          onPointerEnterCapture={undefined} 
          onPointerLeaveCapture={undefined}
          // On cache la navigation si le zoom est actif
          prevArrow={selectedImage ? () => null : undefined}
          nextArrow={selectedImage ? () => null : undefined}
          navigation={selectedImage ? () => null : undefined}
        >
          {house.images.map((pic: string) =>
            <div 
              key={pic} 
              // MODIFICATION ICI : On garde juste cursor-pointer. On a enlevé 'group', 'hover:opacity' et 'relative'.
              className="h-full w-full cursor-pointer"
              onClick={() => setSelectedImage(pic)}
            >
              {/* MODIFICATION ICI : J'ai supprimé tout le bloc <div> qui contenait le texte "Agrandir" */}

              <img 
                alt="" 
                src={`${API_URL}${pic}`} 
                className="h-full w-full object-cover" 
              />
            </div>
          )}
        </Carousel>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col gap-6 md:mt-8">
        {/* ... Le reste de la page ne change pas ... */}
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
