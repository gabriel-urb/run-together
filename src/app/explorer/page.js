'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase'
import { 
  Calendar, Clock, Trophy, AlignLeft, 
  Gauge, Mountain, Ruler, Filter, X , MapPin
} from 'lucide-react'

export default function Explorer() {
  const supabase = createClient()
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)

  // États des filtres complets
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
    let query = supabase.from('runs').select('*').order('start_time', { ascending: true })

    // 1. Filtres Supabase (Catégories exactes)
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
      console.error(error)
    } else {
      let filteredData = data

      // 2. Filtre Heure local (+/- 1h)
      if (filters.time) {
        filteredData = filteredData.filter(run => {
          const runDate = new Date(run.start_time)
          const [fH, fM] = filters.time.split(':').map(Number)
          const runMinutes = runDate.getHours() * 60 + runDate.getMinutes()
          const filterMinutes = fH * 60 + fM
          return Math.abs(runMinutes - filterMinutes) <= 60
        })
      }

      // 3. Filtre Distance local (Tranches)
      if (filters.distance !== 'Tous') {
        filteredData = filteredData.filter(run => {
          if (filters.distance === '0-5') return run.distance <= 5
          if (filters.distance === '5-10') return run.distance > 5 && run.distance <= 10
          if (filters.distance === '10-20') return run.distance > 10 && run.distance <= 20
          if (filters.distance === '20+') return run.distance > 20
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

  // Composant petit Select stylisé
  const FilterSelect = ({ label, icon: Icon, options, field, values }) => (
    <div className="flex flex-col gap-1.5 min-w-[140px]">
      <label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2 ml-1">
        {Icon && <Icon size={12} className="text-orange-500" />} {label}
      </label>
      <select 
        value={filters[field]}
        onChange={(e) => setFilters({...filters, [field]: e.target.value})}
        className="bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-orange-500/50 transition-all appearance-none cursor-pointer hover:bg-zinc-800"
      >
        <option value="Tous text-zinc-500">Tous</option>
        {options.map((opt, i) => (
          <option key={opt} value={values ? values[i] : opt}>{opt}</option>
        ))}
      </select>
    </div>
  )

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER & FILTRES */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/5 shadow-2xl">
        <div className="max-w-[1600px] mx-auto p-4 md:p-6">
          <div className="flex flex-wrap items-end gap-4">
            
            {/* Ligne 1 : Date & Heure */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2 ml-1"><Calendar size={12} className="text-orange-500"/> Quand ?</label>
              <div className="flex gap-2">
                <input type="date" suppressHydrationWarning value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} className="bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500/50 [color-scheme:dark]"/>
                <input type="time" suppressHydrationWarning value={filters.time} onChange={(e) => setFilters({...filters, time: e.target.value})} className="bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500/50 [color-scheme:dark]"/>
              </div>
            </div>

            {/* Ligne 1 : Autres Filtres */}
            <FilterSelect label="Type" icon={Trophy} field="run_type" options={['EF', 'Sortie Longue', 'Seuil', 'Fractionné', 'Run Social']} />
            <FilterSelect label="Niveau" icon={AlignLeft} field="accessibility" options={['Tous niveaux', 'Débutant' , 'Intermédiaire', 'Confirmé']} />
            <FilterSelect label="Allure" icon={Gauge} field="pace" options={['4:00', '4:30', '5:00', '5:30', '6:00', '6:30+']} />
            <FilterSelect label="Profil" icon={Mountain} field="run_profile" options={['Plat', 'Vallonné', 'Côte', 'Montagne']} />
            <FilterSelect label="Distance" icon={Ruler} field="distance" options={['< 5km', '5-10km', '10-20km', '20km+']} values={['0-5', '5-10', '10-20', '20+']} />

            {/* Reset */}
            <button onClick={resetFilters} className="h-10 w-10 flex items-center justify-center bg-zinc-900 rounded-xl border border-white/5 hover:bg-orange-600 transition-all group">
              <X size={18} className="text-zinc-500 group-hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* RESULTATS */}
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Chargement des runs...</p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                {runs.length} {runs.length > 1 ? 'Sorties trouvées' : 'Sortie trouvée'}
              </h2>
            </div>

            {runs.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/20 rounded-[40px] border border-dashed border-white/10">
                <p className="text-zinc-500 font-bold">Aucun run ne correspond à tes critères.</p>
                <button onClick={resetFilters} className="mt-4 text-orange-500 text-xs font-black uppercase underline">Réinitialiser les filtres</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {runs.map(run => (
                  <RunCard key={run.id} run={run} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

// Composant Carte de Run (Extrait pour la clarté)
function RunCard({ run }) {
  return (
    <div className="group relative bg-zinc-900/30 border border-white/5 p-6 rounded-[35px] hover:bg-zinc-900/50 transition-all duration-500 hover:border-orange-500/30 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{run.run_type}</span>
          <h3 className="text-xl font-bold leading-tight line-clamp-2">{run.title}</h3>
        </div>
        <div className="bg-zinc-800 p-2 rounded-2xl border border-white/5">
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

      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
        <div className="text-center">
          <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Dist.</p>
          <p className="text-sm font-bold">{run.distance}km</p>
        </div>
        <div className="text-center border-x border-white/5">
          <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Allure</p>
          <p className="text-sm font-bold">{run.pace}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Profil</p>
          <p className="text-sm font-bold">{run.run_profile}</p>
        </div>
      </div>
    </div>
  )
}