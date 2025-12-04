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

      {/* --- MODALE DE ZOOM --- */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 cursor-pointer"
          onClick={closeZoom} // Ferme si on clique sur le fond
        >
          {/* Bouton Fermer (Croix) */}
          <button 
            onClick={closeZoom}
            className="absolute top-5 right-5 z-50 text-white hover:text-gray-300 transition"
          >
            <XMarkIcon className="h-10 w-10 drop-shadow-lg" />
          </button>

          {/* L'image en grand */}
          <img 
            src={`${API_URL}${selectedImage}`} 
            alt="Agrandissement" 
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-md shadow-2xl cursor-default"
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

      {/* --- CARROUSEL --- */}
      <div className="relative z-0"> {/* On s'assure que le carrousel reste derrière la modale */}
        <Carousel 
          loop 
          className="w-full rounded-md md:h-[44rem]"
          // Les 3 props suivantes sont importantes pour éviter les erreurs :
          placeholder={undefined} 
          onPointerEnterCapture={undefined} 
          onPointerLeaveCapture={undefined}
          // --- CORRECTION PRINCIPALE ---
          // Si le zoom est activé, on cache les flèches et les points de navigation
          prevArrow={selectedImage ? () => null : undefined}
          nextArrow={selectedImage ? () => null : undefined}
          navigation={selectedImage ? () => null : undefined}
          // -----------------------------
        >
          {house.images.map((pic: string) =>
            <div 
              key={pic} 
              className="h-full w-full cursor-pointer hover:opacity-95 transition relative group"
              // On ouvre le zoom au clic
              onClick={() => setSelectedImage(pic)}
            >
              {/* Petit message "Agrandir" au survol */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-semibold bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Agrandir</span>
              </div>

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
        {/* ... Reste de la page (description, etc.) ... */}
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
