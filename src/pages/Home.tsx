import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Loading from "../components/Loading"
import { API_URL } from "../constants"

// --- DESSIN DE LA TOUR EIFFEL (SVG) ---
const EiffelTowerDecoration = () => (
  <div className="fixed bottom-0 right-0 h-[80vh] w-auto z-0 pointer-events-none opacity-10 hidden xl:block">
    <svg viewBox="0 0 180 500" className="h-full w-full stroke-gray-900 fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20,500 Q90,400 160,500" />
      <path d="M20,500 L50,350" />
      <path d="M160,500 L130,350" />
      <line x1="45" y1="350" x2="135" y2="350" strokeWidth="4" />
      <path d="M50,350 L70,200" />
      <path d="M130,350 L110,200" />
      <line x1="50" y1="350" x2="130" y2="200" opacity="0.5" />
      <line x1="130" y1="350" x2="50" y2="200" opacity="0.5" />
      <line x1="65" y1="200" x2="115" y2="200" strokeWidth="4" />
      <path d="M70,200 L85,60" />
      <path d="M110,200 L95,60" />
      <rect x="82" y="50" width="16" height="10" />
      <path d="M85,60 L90,10" />
      <path d="M95,60 L90,10" />
      <line x1="90" y1="10" x2="90" y2="0" />
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
      
      {/* DECORATION */}
      <EiffelTowerDecoration />

      {/* SECTION 1 : HAUT DE PAGE */}
      <div className="max-w-6xl mx-auto w-full px-4 flex flex-col md:flex-row items-center justify-between gap-10 mt-10 relative z-10">
        
        {/* Partie Gauche (Texte + Logo) */}
        <div className="flex flex-col items-start gap-4 md:w-1/2">
          
          {/* MODIFICATION 1 : VOTRE LOGO */}
          {/* Assurez-vous de mettre votre image 'logo.png' dans le dossier 'public' */}
          <div className="mb-2">
            <img 
              src="/logo.png" 
              alt="Logo ImmoFrançais" 
              className="h-20 w-auto object-contain" // Ajustez h-20 selon la taille voulue
              onError={(e) => {
                // Si le logo n'est pas trouvé, on cache l'image pour éviter l'icône cassée
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            ImmoFrançais <br />
            <span className="text-gray-500 text-4xl">L'élégance immobilière</span>
          </h1>
          <p className="text-gray-500 text-lg">
            Découvrez nos biens d'exception sélectionnés pour vous, au cœur du patrimoine français.
          </p>
          <Link to="/housing" className="bg-blue-400 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-500 transition shadow-lg mt-4">
            Consulter les biens
          </Link>
        </div>
        
        {/* Partie Droite (Image Haussmannienne) */}
        <div className="md:w-1/2 w-full h-80 md:h-[500px] overflow-hidden rounded-2xl shadow-2xl relative">
             {/* MODIFICATION 2 : IMMEUBLE HAUSSMANNIEN */}
             <img 
               src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
               className="w-full h-full object-cover transform hover:scale-105 transition duration-700"
               alt="Immeuble Haussmannien Paris" 
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

      {/* SECTION 3 : LISTE DES BIENS (CENTRÉE) */}
      <div className="max-w-6xl mx-auto w-full px-4 mb-20 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
          Nos <span className="text-blue-500">dernières nouveautés</span>
        </h2>

        {/* MODIFICATION 3 : CENTRAGE PARFAIT (Flexbox au lieu de Grid) */}
        <div className="flex flex-wrap justify-center gap-8">
          {houses.map((house: any) => (
            <Link 
              key={house.id} 
              to={`/housing/${house.id}`} 
              // On force une largeur fixe (w-full sur mobile, w-96 sur ordi) pour que ça fasse de belles cartes
              className="w-full md:w-96 group bg-white rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden border border-gray-100 flex flex-col"
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
