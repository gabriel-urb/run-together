'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { Map, Marker } from 'react-map-gl/mapbox'
import dynamic from 'next/dynamic'
import { LocateFixed, MapPin, Gauge, Type, ChevronLeft } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'

const SearchBox = dynamic(
  () => import('@mapbox/search-js-react').then((mod) => mod.SearchBox),
  { 
    ssr: false,
    loading: () => <div className="h-14 w-full bg-zinc-900 animate-pulse rounded-2xl" /> 
  }
)

export default function CreateRun() {
  const [title, setTitle] = useState('')
  const [place, setPlace] = useState('')
  const [pace, setPace] = useState('')
  const [viewport, setViewport] = useState({
    latitude: 45.7640,
    longitude: 4.8357,
    zoom: 12
  })
  const [marker, setMarker] = useState(null)

  const supabase = createClient()
  const router = useRouter()
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  const paceOptions = [
    "- de 3:00 min/km", "Entre 3:00 et 3:30 min/km", "Entre 3:30 et 4:00 min/km",
    "Entre 4:00 et 4:30 min/km", "Entre 4:30 et 5:00 min/km", "Entre 5:00 et 5:30 min/km",
    "+ de 5:30 min/km"
  ]

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { longitude, latitude } = position.coords
        setViewport(prev => ({ ...prev, longitude, latitude, zoom: 14 }))
        setMarker({ longitude, latitude })
        updateAddress(longitude, latitude)
      })
    }
  }, [])

  const updateAddress = async (lng, lat) => {
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&language=fr`)
      const data = await res.json()
      if (data.features && data.features.length > 0) {
        setPlace(data.features[0].place_name)
      }
    } catch (err) { console.error(err) }
  }

  const handleMapClick = (e) => {
    const { lng, lat } = e.lngLat
    setMarker({ longitude: lng, latitude: lat })
    updateAddress(lng, lat)
  }

  const handleRetrieve = useCallback((res) => {
    const feature = res.features[0]
    if (feature) {
      const [lng, lat] = feature.geometry.coordinates
      setPlace(feature.properties.full_address || feature.properties.name)
      setMarker({ longitude: lng, latitude: lat })
      setViewport(prev => ({ ...prev, longitude: lng, latitude: lat, zoom: 15 }))
    }
  }, [])

  const handleRecenter = (e) => {
    e.preventDefault()
    navigator.geolocation.getCurrentPosition((position) => {
      const { longitude, latitude } = position.coords
      setViewport(prev => ({ ...prev, longitude, latitude, zoom: 15 }))
      setMarker({ longitude, latitude })
      updateAddress(longitude, latitude)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!marker) return alert("Positionne le RDV sur la carte !")
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert("Connecte-toi d'abord !")

    const { error } = await supabase.from('runs').insert([{ 
      title, 
      place, 
      pace, 
      location: `POINT(${marker.longitude} ${marker.latitude})`,
      organizer_id: user.id 
    }])

    if (error) alert(error.message)
    else router.push('/explorer')
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-600/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl my-10">
        <h1 className="text-3xl font-extrabold mb-2 italic text-white">PROPOSER UNE <span className="text-orange-500">SORTIE</span></h1>
        <p className="text-zinc-400 mb-8 text-sm">Précise l'allure et le point de rendez-vous sur la carte.</p>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2 ml-1">Titre de la sortie</label>
              <input required placeholder="ex: Footing Quais de Saône" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 rounded-2xl bg-zinc-900/50 border border-white/10 text-white focus:border-orange-500/50 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2 ml-1">Allure prévue</label>
              <select required onChange={(e) => setPace(e.target.value)} value={pace}
                className="w-full p-4 rounded-2xl bg-zinc-900/50 border border-white/10 text-white focus:border-orange-500/50 outline-none appearance-none cursor-pointer">
                <option value="" disabled>Choisir une allure</option>
                {paceOptions.map((option) => (<option key={option} value={option} className="bg-zinc-900">{option}</option>))}
              </select>
            </div>

            <div className="relative z-50">
              <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2 ml-1">Adresse de la sortie</label>
              <SearchBox 
                accessToken={mapboxToken}
                value={place}
                onRetrieve={handleRetrieve}
                placeholder="Rechercher une adresse..."
                options={{ proximity: [viewport.longitude, viewport.latitude], countries: 'fr', language: 'fr' }}
                theme={{
                  variables: {
                    fontFamily: 'inherit',
                    unit: '16px',
                  },
                  cssText: `
                    /* 1. Le conteneur principal : on imite ton style zinc-900/50 */
                    .mapboxsearch-search-container {
                      background-color: rgba(24, 24, 27, 0.5) !important; 
                      border: 1px solid rgba(255, 255, 255, 0.1) !important;
                      border-radius: 1rem !important; /* Arrondi identique à tes inputs */
                      height: 58px !important; /* Hauteur identique à tes autres champs */
                      display: flex !important;
                      align-items: center !important;
                      padding-left: 1rem !important;
                    }

                    /* 2. L'input texte : BLANC et même taille de police */
                    .mapboxsearch-search-input {
                      color: white !important;
                      -webkit-text-fill-color: white !important; /* Sécurité pour certains navigateurs */
                      font-family: inherit !important;
                      font-size: 1rem !important;
                      background: transparent !important;
                      width: 100% !important;
                      outline: none !important;
                      border: none !important;
                    }

                    /* 3. Le placeholder (texte indicatif) */
                    .mapboxsearch-search-input::placeholder {
                      color: #71717a !important; /* zinc-400 */
                    }

                    /* 4. Masquer l'icône loupe de Mapbox pour un look épuré comme tes autres champs */
                    .mapboxsearch-search-icon {
                      display: none !important;
                    }

                    /* 5. Menu déroulant des suggestions (Dark mode) */
                    .mapboxsearch-dropdown {
                      background-color: #18181b !important;
                      border: 1px solid rgba(255, 255, 255, 0.1) !important;
                      border-radius: 1rem !important;
                      margin-top: 8px !important;
                      overflow: hidden !important;
                      z-index: 9999 !important;
                    }

                    .mapboxsearch-suggestion {
                      color: white !important;
                      padding: 12px 16px !important;
                      font-family: inherit !important;
                    }

                    .mapboxsearch-suggestion:hover {
                      background-color: #27272a !important;
                    }
                  `
                }}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2 ml-1">Position précise (clique sur la carte)</label>
            <div className="flex-grow min-h-[350px] rounded-3xl overflow-hidden border border-white/10 relative">
              <Map
                {...viewport}
                onMove={evt => setViewport(evt.viewState)}
                onClick={handleMapClick}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={mapboxToken}
              >
                {marker && <Marker longitude={marker.longitude} latitude={marker.latitude} color="#f97316" />}
                
                <button onClick={handleRecenter} className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur-md border border-white/10 p-2.5 rounded-xl hover:bg-orange-600 transition-all z-10 group">
                  <LocateFixed size={20} className="text-white group-hover:scale-110" />
                </button>
              </Map>
            </div>
          </div>

          <div className="md:col-span-2">
            <button type="submit" className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl font-bold text-lg shadow-lg shadow-orange-900/30 hover:scale-[1.01] active:scale-95 transition-all">
              Publier la course
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}