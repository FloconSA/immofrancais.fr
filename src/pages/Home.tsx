import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Loading from "../components/Loading"
import { API_URL } from "../constants"

// --- 1. LE DESSIN DE LA TOUR EIFFEL (SVG) ---
// Ce composant dessine la tour. C'est du code, donc qualité infinie.
const EiffelTowerDecoration = () => (
  <div 
    className="fixed bottom-0 right-0 h-[80vh] w-auto z-0 pointer-events-none opacity-10 hidden xl:block"
    // Explication des classes :
    // fixed bottom-0 right-0 : Collé en bas à droite de l'écran (ne bouge pas quand on scrolle)
    // h-[80vh] : Prend 80% de la hauteur de l'écran
    // z-0 : Reste en arrière plan derrière le texte
    // opacity-10 : Très discret (gris clair) pour ne pas gêner la lecture
    // hidden xl:block : Ne s'affiche que sur les grands écrans (pas sur mobile)
  >
    <svg 
      viewBox="0 0 180 500" 
      className="h-full w-full stroke-gray-900 fill-none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Base et Pieds */}
      <path d="M20,500 Q90,400 160,500" /> {/* Arche du bas */}
      <path d="M20,500 L50,350" /> {/* Pied gauche ext */}
      <path d="M160,500 L130,350" /> {/* Pied droit ext */}
      
      {/* 1er Étage */}
      <line x1="45" y1="350" x2="135" y2="350" strokeWidth="4" />
      <path d="M50,350 L70,200" /> {/* Structure milieu gauche */}
      <path d="M130,350 L110,200" /> {/* Structure milieu droit */}
      
      {/* Croisillons structure bas */}
      <line x1="50" y1="350" x2="130" y2="200" opacity="0.5" />
      <line x1="130" y1="350" x2="50" y2="200" opacity="0.5" />

      {/* 2ème Étage */}
      <line x1="65" y1="200" x2="115" y2="200" strokeWidth="4" />
      <path d="M70,200 L85,60" /> {/* Structure haut gauche */}
      <path d="M110,200 L95,60" /> {/* Structure haut droit */}
      
      {/* 3ème Étage et Sommet */}
      <rect x="82" y="50" width="16" height="10" />
      <path d="M85,60 L90,10" /> {/* Flèche */}
      <path d="M95,60 L90,10" /> {/* Flèche */}
      <line x1="90" y1="10" x2="90" y2="0" /> {/* Antenne */}
      
      {/* Effets de lumière (lignes minimalistes) */}
      <path d="M90,60 L90,500" opacity="0.2" strokeDasharray="5,5" />
    </svg>
  </div>
)

const Home = () => {
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)

  const currency = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  })

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/houses?populate=*&sort=createdAt:desc`)
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
          image: house.images && house.images.length > 0 ? house.images[0].url : null
        }))

        setHouses(parsed.slice(0, 3))
      } catch (error) {
        console.error("Erreur chargement:", error)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <Loading />

  return (
    <div className="flex flex-col gap-10 relative">
      
      {/* --- 2. INTÉGRATION DE LA TOUR EIFFEL --- */}
      <EiffelTowerDecoration />
      {/* ---------------------------------------- */}

      {/* SECTION 1 : TITRE PRINCIPAL */}
      <div className="max-w-6xl mx-auto w-full px-4 flex flex-col md:flex-row items-center justify-between gap-10 mt-10 relative z-10">
        <div className="flex flex-col items-start gap-4 md:w-1/2">
          <div className="text-blue-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            ImmoFrançais <br />
            <span className="text-gray-500 text-4xl">Propriétés à vendre</span>
          </h1>
          <p className="text-gray-500 text-lg">
            Découvrez nos biens d'exception sélectionnés pour vous.
          </p>
          <Link to="/housing" className="bg-blue-400 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-500 transition shadow-lg mt-4">
            Consulter les biens
          </Link>
        </div>
        
        <div className="md:w-1/2 w-full h-80 md:h-[500px] overflow-hidden rounded-2xl shadow-2xl relative">
             <img 
               src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
               className="w-full h-full object-cover transform hover:scale-105 transition duration-700"
               alt="Maison moderne" 
             />
        </div>
      </div>

      {/* SECTION 2 : BANDEAU VISUEL */}
      <div 
        className="w-full h-64 md:h-96 relative flex items-center justify-center bg-fixed bg-center bg-cover my-8 z-10"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" 
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">Votre projet, notre passion</h2>
          <p className="text-lg md:text-xl font-light max-w-2xl mx-auto drop-shadow-sm">
            Faites confiance à notre expertise pour trouver le bien qui correspond à votre style de vie.
          </p>
        </div>
      </div>

      {/* SECTION 3 : LISTE DES BIENS */}
      <div className="max-w-6xl mx-auto w-full px-4 mb-20 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
          Nos <span className="text-blue-500">dernières nouveautés</span>
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {houses.map((house: any) => (
            <Link 
              key={house.id} 
              to={`/housing/${house.id}`} 
              className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden border border-gray-100 flex flex-col"
            >
              <div className="h-64 overflow-hidden relative">
                {house.image ? (
                  <img 
                    src={`${API_URL}${house.image}`} 
                    alt={house.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    Pas d'image
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-600 uppercase shadow-sm">
                  {house.type}
                </div>
              </div>

              <div className="p-6 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-xl text-gray-800 line-clamp-1 group-hover:text-blue-500 transition">{house.name}</h3>
                </div>
                
                <div className="text-2xl font-bold text-blue-600">
                  {currency.format(house.price)}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                  <span className="flex items-center gap-1">
                    🏡 {house.surface}m²
                  </span>
                  <span className="flex items-center gap-1">
                    🛏️ {house.bedrooms} ch.
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm line-clamp-2 mt-2">
                  {house.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
        
        {houses.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            Aucun bien affiché pour le moment.
          </div>
        )}
        
        <div className="text-center mt-12">
           <Link to="/housing" className="inline-block border-2 border-blue-500 text-blue-500 px-8 py-3 rounded-full font-bold hover:bg-blue-500 hover:text-white transition">
             Voir tous nos biens
           </Link>
        </div>
      </div>

    </div>
  )
}

export default Home
