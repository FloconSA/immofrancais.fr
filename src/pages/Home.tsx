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

      setHouses(parsed.slice(0, 3))
    })()
  }, [])

  return (
    <div className="max-w-7xl mx-auto">

      {/* Hero (Code Original Intouché) */}
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

      {/* --- BANDEAU GLASSMORPHISM (MODIFIÉ : Chaud & Haussmannien) --- */}
      <div className="relative w-full h-80 my-12 md:mb-24 rounded-xl overflow-hidden flex items-center justify-center mx-auto px-4">
        
        {/* 1. Nouvelle Image de fond (Haussmannien ensoleillé) */}
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            // Image changée pour un immeuble parisien avec une lumière chaude
            backgroundImage: "url('https://images.unsplash.com/photo-1550353127-b0da3aeaa0ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80')",
            backgroundPosition: 'center', 
            backgroundSize: 'cover'
          }}
        />

        {/* 2. L'effet Verre avec le nouveau texte */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-10 rounded-2xl shadow-2xl max-w-3xl text-center mx-4">
          {/* Nouveau Titre */}
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 drop-shadow-md">
            L'Élégance du Patrimoine Français
          </h3>
          {/* Nouveau Texte (plus de technologie) */}
          <p className="text-white/90 text-lg font-light leading-relaxed">
            Découvrez une sélection exclusive de biens au charme unique, baignés de lumière et d'histoire.
          </p>
        </div>
      </div>
      {/* -------------------------------------------------------- */}

      {/* Houses (Code Original Intouché) */}
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


      {/* Contact (Code Original Intouché) */}
      <Contact />

    </div>
  )
}

export default Home;
