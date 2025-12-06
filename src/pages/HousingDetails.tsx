import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { ShareIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import { Carousel } from "@material-tailwind/react"

import { DPE, GES } from "../components/Abstract/DPE-GES"
import { API_URL } from "../constants"
import Loading from "../components/Loading"

const HousingDetails = () => {
  const [house, setHouse] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { id } = useParams()

  const currency = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0, // Dans le luxe, on évite les centimes (,00)
  })

  useEffect(() => {
    (async () => {
      try {
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
          // IMAGE QUALITÉ MAXIMALE (Sécurisée)
          images: houseData.images ? houseData.images.map((pic: any) => pic.url) : []
        })
      } catch (err) {
        console.error(err)
      }
    })()
  }, [id])

  // --- LOGIQUE ZOOM ---
  const navigateImage = useCallback((direction: number) => {
    if (!house || !selectedImage) return;
    const currentIndex = house.images.indexOf(selectedImage);
    const totalImages = house.images.length;
    let newIndex = (currentIndex + direction) % totalImages;
    if (newIndex < 0) newIndex = totalImages - 1;
    setSelectedImage(house.images[newIndex]);
  }, [house, selectedImage]);

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

  if (!house) return <Loading />
  const closeZoom = () => setSelectedImage(null);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 relative px-4 md:px-0 mb-20">
      
      {/* --- MODALE ZOOM --- */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-300"
          onClick={closeZoom}
        >
          <button onClick={(e) => { e.stopPropagation(); navigateImage(-1); }} className="absolute left-4 z-50 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition">
            <ChevronLeftIcon className="h-10 w-10 md:h-12 md:w-12 drop-shadow-lg" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); navigateImage(1); }} className="absolute right-4 z-50 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition">
            <ChevronRightIcon className="h-10 w-10 md:h-12 md:w-12 drop-shadow-lg" />
          </button>
          <button onClick={closeZoom} className="absolute top-5 right-5 z-50 text-white/70 hover:text-white transition">
            <XMarkIcon className="h-8 w-8 drop-shadow-lg" />
          </button>
          <img 
            src={`${API_URL}${selectedImage}`} 
            alt="Zoom" 
            className="max-h-[95vh] max-w-[95vw] object-contain shadow-2xl animate-fade-in cursor-default select-none"
            onClick={(e) => e.stopPropagation()} 
          />
          <div className="absolute bottom-5 text-white/80 font-medium tracking-widest text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
             {house.images.indexOf(selectedImage) + 1} / {house.images.length}
          </div>
        </div>
      )}

      {/* --- HEADER ANNONCE (Version Luxe & Grande) --- */}
      <div className="mt-4 md:mt-8 border-b border-gray-100 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          
          {/* TITRE : Très grand, Police Serif */}
          <h1 className="text-4xl md:text-6xl font-serif text-gray-900 leading-tight md:max-w-3xl">
            <span className="block text-xl md:text-2xl text-blue-500 font-sans font-bold uppercase tracking-widest mb-2">{house.type}</span>
            {house.name}
          </h1>
          
          {/* PRIX : Grand et élégant */}
          <div className="text-3xl md:text-4xl font-serif text-gray-800 whitespace-nowrap">
            {currency.format(house.price)}
          </div>
        </div>

        {/* DETAILS (Surface, Chambres) : Plus gros et aéré */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 md:mt-8 gap-4">
          <div className="text-xl md:text-2xl text-gray-500 font-light flex flex-wrap gap-4 md:gap-8">
            <span>{house.rooms} pièces</span>
            <span className="hidden md:inline text-gray-300">|</span>
            <span>{house.bedrooms} chambres</span>
            <span className="hidden md:inline text-gray-300">|</span>
            <span>{house.surface} m²</span>
          </div>

          <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="group text-lg text-gray-500 hover:text-blue-500 transition flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-full hover:border-blue-500">
            <ShareIcon className="h-5 w-5 group-hover:scale-110 transition" /> 
            <span>Partager cette annonce</span>
          </button>
        </div>
      </div>

      {/* CAROUSEL */}
      <div className="relative z-0">
        <Carousel 
          loop 
          className="w-full rounded-sm md:h-[44rem]" // rounded-sm fait plus 'cadre photo' que rounded-md
          prevArrow={selectedImage ? () => null : undefined}
          nextArrow={selectedImage ? () => null : undefined}
          navigation={selectedImage ? () => null : undefined}
          placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
        >
          {house.images.map((pic: string) =>
            <div key={pic} className="h-full w-full cursor-pointer" onClick={() => setSelectedImage(pic)}>
              <img alt="" src={`${API_URL}${pic}`} className="h-full w-full object-cover" />
            </div>
          )}
        </Carousel>
      </div>

      {/* DETAILS TEXTE */}
      <div className="max-w-5xl mx-auto flex flex-col gap-12 md:mt-8">
        <div>
          <h2 className="text-2xl font-serif mb-6 border-l-4 border-blue-500 pl-4">Description</h2>
          <p className="text-lg md:text-xl text-gray-600 text-justify whitespace-pre-line leading-relaxed font-light">
            {house.description}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
            <div>
            <h2 className="text-2xl font-serif mb-6 border-l-4 border-blue-500 pl-4">Caractéristiques</h2>
            <div className="text-lg text-gray-600 grid gap-3">
                {house.caracteristics.map((e: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                        {e}
                    </div>
                ))}
            </div>
            </div>

            <div>
            <h2 className="text-2xl font-serif mb-6 border-l-4 border-blue-500 pl-4">Aménagements</h2>
            <div className="text-lg text-gray-600 grid gap-3">
                {house.facilities.map((e: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                         <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                        {e}
                    </div>
                ))}
            </div>
            </div>
        </div>

        <div>
          <h2 className="text-2xl font-serif mb-6 border-l-4 border-blue-500 pl-4">Bilan énergétique</h2>
          <div className="grid md:grid-cols-2 gap-10 md:gap-0 bg-gray-50 p-8 rounded-xl">
            <div className="flex flex-col justify-center items-center gap-4">
              <h3 className="text-gray-500 text-center font-bold">DPE (Consommation)</h3>
              <DPE code={house.DPE} />
            </div>
            <div className="flex flex-col justify-center items-center gap-4">
              <h3 className="text-gray-500 text-center font-bold">GES (Émissions)</h3>
              <GES code={house.GES} />
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}

export default HousingDetails
