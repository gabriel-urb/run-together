'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase'
import { 
  Calendar, Clock, Trophy, AlignLeft, 
  Gauge, Mountain, Ruler, Filter, X, MapPin,
  List, Map as MapIcon, Plus, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { Map, Marker } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import JoinDrawer from '@/components/JoinDrawer'

export default function Explorer() {
  const supabase = createClient()
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list') // 'list' ou 'map'
  const [selectedRun, setSelectedRun] = useState(null)

  const [filters, setFilters] = useState({
    date: '',
    time: '',
    run_type: 'Tous',
    accessibility: 'Tous',
    pace: 'Tous',
    run_profile: 'Tous',
    distance: 'Tous'
  })

  useEffect(() => {
    fetchRuns()
  }, [filters])

  const fetchRuns = async () => {
    setLoading(true)
    // On utilise bien la VUE
    let query = supabase.from('runs_with_coords').select('*').order('start_time', { ascending: true })

    // Filtres Supabase
    if (filters.date) {
      query = query.gte('start_time', `${filters.date} 00:00:00`)
      query = query.lte('start_time', `${filters.date} 23:59:59`)
    }
    if (filters.run_type !== 'Tous') query = query.eq('run_type', filters.run_type)
    if (filters.accessibility !== 'Tous') query = query.eq('accessibility', filters.accessibility)
    if (filters.run_profile !== 'Tous') query = query.eq('run_profile', filters.run_profile)
    if (filters.pace !== 'Tous') query = query.eq('pace', filters.pace)

    const { data, error } = await query
    
    if (error) {
      console.error("Erreur sur la vue runs_with_coords:", error)
    } else {
      let filteredData = data || []

      // Filtre Heure local (+/- 1h)
      if (filters.time) {
        filteredData = filteredData.filter(run => {
          const runDate = new Date(run.start_time)
          const [fH, fM] = filters.time.split(':').map(Number)
          const runMinutes = runDate.getHours() * 60 + runDate.getMinutes()
          const filterMinutes = fH * 60 + fM
          return Math.abs(runMinutes - filterMinutes) <= 60
        })
      }

      // Filtre Distance local
      if (filters.distance !== 'Tous') {
        filteredData = filteredData.filter(run => {
          const d = parseFloat(run.distance)
          if (filters.distance === '0-5') return d <= 5
          if (filters.distance === '5-10') return d > 5 && d <= 10
          if (filters.distance === '10-20') return d > 10 && d <= 20
          if (filters.distance === '20+') return d > 20
          return true
        })
      }
      setRuns(filteredData)
    }
    setLoading(false)
  }

  const resetFilters = () => setFilters({
    date: '', time: '', run_type: 'Tous', accessibility: 'Tous',
    pace: 'Tous', run_profile: 'Tous', distance: 'Tous'
  })

  const FilterSelect = ({ label, icon: Icon, options, field, values }) => (
    <div className="flex flex-col gap-1.5 min-w-[130px]">
      <label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2 ml-1">
        {Icon && <Icon size={12} className="text-orange-500" />} {label}
      </label>
      <select 
        value={filters[field]}
        onChange={(e) => setFilters({...filters, [field]: e.target.value})}
        className="bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-orange-500/50 transition-all appearance-none cursor-pointer hover:bg-zinc-800"
      >
        <option value="Tous">Tous</option>
        {options.map((opt, i) => (
          <option key={opt} value={values ? values[i] : opt}>{opt}</option>
        ))}
      </select>
    </div>
  )

  return (
    <main className="min-h-screen bg-black text-white relative">
      {/* HEADER & FILTRES STICKY */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/5 shadow-2xl px-4 md:px-8 py-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Explorer</h1>
            
            {/* TOGGLE VUE */}
            <div className="flex bg-zinc-900 p-1 rounded-xl border border-white/10">
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'text-zinc-500'}`}>
                <List size={20} />
              </button>
              <button onClick={() => setViewMode('map')} className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-orange-600 text-white' : 'text-zinc-500'}`}>
                <MapIcon size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2 ml-1"><Calendar size={12} className="text-orange-500"/> Quand ?</label>
              <div className="flex gap-2">
                <input type="date" suppressHydrationWarning value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} className="bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold outline-none [color-scheme:dark]"/>
                <input type="time" suppressHydrationWarning value={filters.time} onChange={(e) => setFilters({...filters, time: e.target.value})} className="bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold outline-none [color-scheme:dark]"/>
              </div>
            </div>

            <FilterSelect label="Type" icon={Trophy} field="run_type" options={['EF', 'Sortie Longue', 'Seuil', 'Fractionné', 'Run Social']} />
            <FilterSelect label="Niveau" icon={AlignLeft} field="accessibility" options={['Tous niveaux', 'Débutant' , 'Intermédiaire', 'Confirmé']} />
            <FilterSelect label="Allure" icon={Gauge} field="pace" options={['4:00', '4:30', '5:00', '5:30', '6:00', '6:30+']} />
            <FilterSelect label="Profil" icon={Mountain} field="run_profile" options={['Plat', 'Vallonné', 'Côte', 'Montagne']} />
            <FilterSelect label="Distance" icon={Ruler} field="distance" options={['< 5km', '5-10km', '10-20km', '20km+']} values={['0-5', '5-10', '10-20', '20+']} />

            <button onClick={resetFilters} className="h-10 w-10 flex items-center justify-center bg-zinc-900 rounded-xl border border-white/5 hover:bg-red-900/20 transition-all">
              <X size={18} className="text-zinc-500" />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div className="relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : viewMode === 'list' ? (
          /* --- VUE LISTE --- */
          <div className="max-w-7xl mx-auto p-6 md:p-12">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8">
              {runs.length} {runs.length > 1 ? 'Sorties trouvées' : 'Sortie trouvée'}
            </h2>
            {runs.length === 0 ? (
              <NoResults reset={resetFilters} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {runs.map(run => <RunCard key={run.id} run={run} />)}
              </div>
            )}
          </div>
        ) : (
          /* --- VUE CARTE --- */
          <div className="h-[calc(100vh-220px)] w-full relative">
            <Map
              initialViewState={{ longitude: 4.8357, latitude: 45.7640, zoom: 12 }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            >
              {runs.map((run) => {
                // On s'assure que lng et lat sont bien des nombres valides
                const longitude = parseFloat(run.lng);
                const latitude = parseFloat(run.lat);

                if (isNaN(longitude) || isNaN(latitude)) return null;

                return (
                  <Marker 
                    key={run.id} 
                    longitude={longitude} 
                    latitude={latitude} 
                    anchor="bottom"
                    onClick={e => { 
                      e.originalEvent.stopPropagation(); 
                      setSelectedRun(run); 
                    }}
                  >
                    <div className="cursor-pointer group">
                      <div className="bg-orange-600 p-2 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-125">
                        <MapPin size={16} color="white" fill="white" />
                      </div>
                    </div>
                  </Marker>
                )
              })}
            </Map>

            {/* INFO FLOTTANTE CARTE */}
            {selectedRun && (
              <div className="absolute bottom-8 left-6 right-6 z-40">
                <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 p-5 rounded-[32px] shadow-2xl max-w-md mx-auto relative animate-in slide-in-from-bottom duration-300">
                  <button onClick={() => setSelectedRun(null)} className="absolute top-4 right-4 text-zinc-500"><X size={20} /></button>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-2xl">🏃‍♂️</div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{selectedRun.title}</h3>
                      <p className="text-zinc-400 text-xs flex items-center gap-1"><MapPin size={12} /> {selectedRun.place}</p>
                    </div>
                  </div>
                  <Link href={`/explorer/${selectedRun.id}`}>
                    <button className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 transition-all flex items-center justify-center gap-2">
                      Voir les détails <ChevronRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOUTON FLOTTANT CRÉATION */}
      <Link href="/create-run">
        <div className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-900/40 hover:scale-110 transition-transform z-50">
          <Plus color="white" size={32} />
        </div>
      </Link>
    </main>
  )
}

function RunCard({ run }) {
  return (
    <div className="group relative bg-zinc-900/30 border border-white/5 rounded-[35px] hover:bg-zinc-900/50 transition-all duration-500 overflow-hidden flex flex-col">
      <Link href={`/explorer/${run.id}`} className="p-6 pb-0 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{run.run_type}</span>
            <h3 className="text-xl font-bold leading-tight line-clamp-2 group-hover:text-orange-500 transition-colors">{run.title}</h3>
          </div>
          <div className="bg-zinc-800 p-2 rounded-2xl border border-white/5 group-hover:border-orange-500/50 transition-colors">
             <Calendar size={16} className="text-zinc-400" />
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-zinc-400">
            <Clock size={14} className="text-orange-500/50" />
            <span className="text-xs font-bold font-mono">
              {new Date(run.start_time).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date(run.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <MapPin size={14} className="text-orange-500/50" />
            <span className="text-xs font-medium line-clamp-1">{run.place}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-4 border-t border-white/5">
          <div className="text-center"><p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Dist.</p><p className="text-sm font-bold">{run.distance}km</p></div>
          <div className="text-center border-x border-white/5"><p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Allure</p><p className="text-sm font-bold">{run.pace}</p></div>
          <div className="text-center"><p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Profil</p><p className="text-sm font-bold text-zinc-300">{run.run_profile}</p></div>
        </div>
      </Link>

      <div className="px-6 pb-6 mt-2">
        <JoinDrawer run={run}>
          <button className="w-full py-4 bg-white text-black rounded-[20px] font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 hover:text-white transition-all active:scale-95 shadow-xl">
            Rejoindre la meute
          </button>
        </JoinDrawer>
      </div>
    </div>
  )
}

function NoResults({ reset }) {
  return (
    <div className="text-center py-24 bg-zinc-900/20 rounded-[40px] border border-dashed border-white/10">
      <p className="text-zinc-500 font-bold mb-4">Aucun run ne correspond à tes critères.</p>
      <button onClick={reset} className="text-orange-500 text-[10px] font-black uppercase underline tracking-widest">Réinitialiser les filtres</button>
    </div>
  )
}