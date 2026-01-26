'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { Map, Marker } from 'react-map-gl/mapbox' // On ajoute /mapbox à la fin
import 'mapbox-gl/dist/mapbox-gl.css'

export default function CreateRun() {
  const [title, setTitle] = useState('')
  const [place, setPlace] = useState('')
  const [pace, setPace] = useState('')
  
  // États pour la carte
  const [viewport, setViewport] = useState({
    latitude: 45.7640, // Lyon par défaut
    longitude: 4.8357,
    zoom: 12
  })
  const [marker, setMarker] = useState(null)

  const supabase = createClient()
  const router = useRouter()

  const paceOptions = [
    "- de 3:00 min/km", "Entre 3:00 et 3:30 min/km", "Entre 3:30 et 4:00 min/km",
    "Entre 4:00 et 4:30 min/km", "Entre 4:30 et 5:00 min/km", "Entre 5:00 et 5:30 min/km",
    "+ de 5:30 min/km"
  ]

  const handleMapClick = (e) => {
    const { lng, lat } = e.lngLat
    setMarker({ longitude: lng, latitude: lat })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!marker) {
      alert("Clique sur la carte pour définir le point de rendez-vous !")
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("Tu dois être connecté pour publier une course !")
      return
    }

    // Formatage pour PostGIS : POINT(longitude latitude)
    const postGisLocation = `POINT(${marker.longitude} ${marker.latitude})`

    const { error } = await supabase
      .from('runs')
      .insert([{ 
        title, 
        place, // Le nom textuel (ex: "Place Bellecour")
        pace, 
        location: postGisLocation, // Le point géographique exact
        organizer_id: user.id 
      }])

    if (error) {
      alert("Erreur : " + error.message)
    } else {
      alert("Course créée avec succès ! 🏃‍♂️")
      router.push('/explorer')
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 flex items-center justify-center relative overflow-hidden">
      {/* Effet de halo orange */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-600/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl my-10">
        <h1 className="text-3xl font-extrabold mb-2 text-white tracking-tight italic">PROPOSER UNE <span className="text-orange-500">SORTIE</span></h1>
        <p className="text-zinc-400 mb-8 text-sm">Précise l'allure et le point de rendez-vous sur la carte.</p>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Colonne de gauche : Infos textuelles */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2 ml-1">Titre de la sortie</label>
              <input 
                required
                placeholder="ex: Footing Quais de Saône" 
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 rounded-2xl bg-zinc-900/50 border border-white/10 focus:border-orange-500/50 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2 ml-1">Allure prévue</label>
              <select 
                required
                onChange={(e) => setPace(e.target.value)}
                className="w-full p-4 rounded-2xl bg-zinc-900/50 border border-white/10 focus:border-orange-500/50 outline-none appearance-none cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Choisir une allure</option>
                {paceOptions.map((option) => (
                  <option key={option} value={option} className="bg-zinc-900">{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2 ml-1">Nom du lieu (RDV)</label>
              <input 
                required
                placeholder="ex: Statue de Louis XIV" 
                onChange={(e) => setPlace(e.target.value)}
                className="w-full p-4 rounded-2xl bg-zinc-900/50 border border-white/10 focus:border-orange-500/50 outline-none transition-all"
              />
            </div>
          </div>

          {/* Colonne de droite : Carte Mapbox */}
          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2 ml-1">Position précise (clique sur la carte)</label>
            <div className="flex-grow min-h-[300px] rounded-3xl overflow-hidden border border-white/10 relative">
              <Map
                {...viewport}
                onMove={evt => setViewport(evt.viewState)}
                onClick={handleMapClick}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
              >
                {marker && (
                  <Marker longitude={marker.longitude} latitude={marker.latitude} color="#f97316" />
                )}
              </Map>
            </div>
          </div>

          {/* Bouton sur toute la largeur */}
          <div className="md:col-span-2">
            <button className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl font-bold text-lg shadow-lg shadow-orange-900/30 hover:scale-[1.01] active:scale-95 transition-all">
              Publier la course
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}