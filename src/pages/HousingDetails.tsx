import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { ShareIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import { Carousel } from "@material-tailwind/react"

import { DPE, GES } from "../components/Abstract/DPE-GES"
import { API_URL } from "../constants"
import Loading from "../components/Loading"

const HousingDetails = () => {
  const [house, setHouse] = useState<any>(null)
  // Mémoire pour savoir si le zoom est actif (contient l'URL de l'image)
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
        images: houseData.images ? houseData.images.map((pic: any) => pic.formats.large.url) : []
      })
    })()
  }, [id])

  // --- LOGIQUE DE NAVIGATION DU ZOOM ---
  
  // Fonction pour changer d'image (direction : -1 pour précédent, +1 pour suivant)
  const navigateImage = useCallback((direction: number) => {
    if (!house || !selectedImage) return;
    
    const currentIndex = house.images.indexOf(selectedImage);
    const totalImages = house.images.length;
    
    // Calcul savant pour gérer la boucle (si on est au début et qu'on recule, on va à la fin)
    let newIndex = (currentIndex + direction) % totalImages;
    if (newIndex < 0) newIndex = totalImages - 1;
    
    setSelectedImage(house.images[newIndex]);
  }, [house, selectedImage]);

  // Gestion des touches du clavier (Flèche Gauche / Droite / Echap)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (e.key === 'ArrowRight') navigateImage(1);
      if (e.key === 'ArrowLeft') navigateImage(-1);
      if (e.key === 'Escape') setSelectedImage(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, navigateImage]);

  if (!house)
    return <Loading />

  const closeZoom = () => setSelectedImage(null);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 relative">

      {/* --- MODALE DE ZOOM (GALERIE) --- */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300"
          onClick={closeZoom} // Clique sur le fond = Fermer
        >
          {/* BOUTON PRÉCÉDENT (Gauche) */}
          <button 
            onClick={(e) => { e.stopPropagation(); navigateImage(-1); }}
            className="absolute left-4 z-50 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <ChevronLeftIcon className="h-10 w-10 md:h-12 md:w-12 drop-shadow-lg" />
          </button>

          {/* BOUTON SUIVANT (Droite) */}
          <button 
            onClick={(e) => { e.stopPropagation(); navigateImage(1); }}
            className="absolute right-4 z-50 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <ChevronRightIcon className="h-10 w-10 md:h-12 md:w-12 drop-shadow-lg" />
          </button>

          {/* BOUTON FERMER (Croix en haut à droite) */}
          <button 
            onClick={closeZoom}
            className="absolute top-5 right-5 z-50 text-white/70 hover:text-white transition"
          >
            <XMarkIcon className="h-8 w-8 drop-shadow-lg" />
          </button>

          {/* L'IMAGE EN GRAND */}
          <img 
            src={`${API_URL}${selectedImage}`} 
            alt="Zoom" 
            className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg shadow-2xl animate-fade-in cursor-default select-none"
            onClick={(e) => e.stopPropagation()} // Clic sur l'image ne ferme pas
          />
          
          {/* Compteur d'images (ex: 1 / 5) en bas */}
          <div className="absolute bottom-5 text-white/80 font-medium tracking-widest text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
             {house.images.indexOf(selectedImage) + 1} / {house.images.length}
          </div>
        </div>
      )}
      {/* ------------------------------- */}

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

      <div className="relative z-0">
        <Carousel 
          loop 
          className="w-full rounded-md md:h-[44rem]"
          placeholder={undefined} 
          onPointerEnterCapture={undefined} 
          onPointerLeaveCapture={undefined}
          // On désactive la navigation du carrousel si le zoom est ouvert
          prevArrow={selectedImage ? () => null : undefined}
          nextArrow={selectedImage ? () => null : undefined}
          navigation={selectedImage ? () => null : undefined}
        >
          {house.images.map((pic: string) =>
            <div 
              key={pic} 
              className="h-full w-full cursor-pointer"
              onClick={() => setSelectedImage(pic)}
            >
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
