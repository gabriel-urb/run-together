'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import { MapPin, Gauge, Calendar, Plus, Search, List, Map as MapIcon, X } from 'lucide-react'
import Link from 'next/link'
import { Map, Marker } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import JoinDrawer from '@/components/JoinDrawer'

export default function Explorer() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list') // 'list' ou 'map'
  const [selectedRun, setSelectedRun] = useState(null)
  
  const supabase = createClient()

  useEffect(() => {
    async function fetchRuns() {
      const { data, error } = await supabase
        .from('runs_with_coords') // On appelle la VUE au lieu de la TABLE
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erreur de récupération :", error);
      } else {
        console.log("Sorties récupérées :", data);
        setRuns(data || []);
      }
      setLoading(false);
    }
    fetchRuns()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white pb-20 relative">
      {/* Header & Filtres */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md px-6 pt-12 pb-6 border-b border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Explorer</h1>
          
          {/* TOGGLE VUE LISTE / CARTE */}
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'text-zinc-500 hover:text-white'}`}
            >
              <List size={20} />
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-orange-600 text-white' : 'text-zinc-500 hover:text-white'}`}
            >
              <MapIcon size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {['Toutes', 'Quais de Saône', 'Parc Tête d\'Or', 'Matin', 'Soir'].map((filter) => (
            <button key={filter} className="px-4 py-2 rounded-full bg-zinc-900 border border-white/10 text-sm whitespace-nowrap hover:bg-orange-600 transition-colors">
              {filter}
            </button>
          ))}
        </div>
      </div>

{/* CONTENU CONDITIONNEL */}
      <div className="relative">
        {viewMode === 'list' ? (
          /* VUE LISTE */
          <div className="px-6 py-8 space-y-6 max-w-2xl mx-auto">
            {loading ? (
              <p className="text-center text-zinc-500">Chargement des courses...</p>
            ) : (
              runs.map((run) => (
                <div key={run.id} className="group relative bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden hover:border-orange-500/30 transition-all shadow-xl">
                  
                  {/* 1. LIEN VERS LA PAGE DÉTAILS */}
                  <Link href={`/explorer/${run.id}`} className="block">
                    <div className="h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                      <span className="text-4xl opacity-20 group-hover:scale-110 transition-transform duration-500">🏃‍♂️</span>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold tracking-tight">{run.title}</h2>
                        <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border border-orange-500/20">
                          Confirmed
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <MapPin size={16} className="text-orange-500" />
                          <span className="text-sm truncate">{run.place}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Gauge size={16} className="text-orange-500" />
                          <span className="text-sm">{run.pace}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 2. BOUTON REJOINDRE */}
                  <div className="px-6 pb-6">
                    <JoinDrawer run={run}>
                      <button className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-orange-500 hover:text-white transition-all">
                        Rejoindre la meute
                      </button>
                    </JoinDrawer>
                  </div>
                </div>
              )) // Fin du map
            )} 
          </div> // Fin du div de la Vue Liste
        ) : (
          /* VUE CARTE (Reste du code inchangé) */
          <div className="h-[calc(100vh-180px)] w-full relative">
            <Map
              initialViewState={{
                longitude: 4.8357,
                latitude: 45.7640,
                zoom: 12
              }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            >
              {runs.map((run) => (
                <Marker 
                  key={run.id} 
                  longitude={run.lng} 
                  latitude={run.lat}
                  anchor="bottom"
                  onClick={e => {
                    e.originalEvent.stopPropagation();
                    setSelectedRun(run);
                  }}
                >
                  <div className="group cursor-pointer">
                    <div className="bg-orange-600 p-2 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-125">
                      <MapPin size={16} color="white" fill="white" />
                    </div>
                  </div>
                </Marker>
              ))}
            </Map>

            {/* PETITE CARTE D'INFO FLOTTANTE */}
            {selectedRun && (
              <div className="absolute bottom-8 left-6 right-6 z-40 animate-in slide-in-from-bottom duration-300">
                <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl max-w-md mx-auto relative">
                  <button 
                    onClick={() => setSelectedRun(null)}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-2xl">
                      🏃‍♂️
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{selectedRun.title}</h3>
                      <p className="text-zinc-400 text-xs flex items-center gap-1">
                        <MapPin size={12} /> {selectedRun.place}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 bg-white/5 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Allure</p>
                      <p className="text-sm font-semibold">{selectedRun.pace}</p>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Heure</p>
                      <p className="text-sm font-semibold">18:30</p>
                    </div>
                  </div>

                  {/* Ici aussi, on utilise le Link pour aller aux détails depuis la carte */}
                  <Link href={`/explorer/${selectedRun.id}`}>
                    <button className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all text-sm">
                      Voir les détails
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bouton flottant "+" */}
      <Link href="/create-run">
        <div className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/40 hover:scale-110 transition-transform active:scale-95 cursor-pointer z-50">
          <Plus color="white" size={28} />
        </div>
      </Link>
    </main>
  )
}