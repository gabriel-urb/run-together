'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import Map, { Marker } from 'react-map-gl/mapbox'
import { 
  MapPin, Gauge, Clock, AlertTriangle, ShieldCheck, 
  ChevronLeft, Users, Calendar, Trophy, Mountain, 
  Ruler, Activity, Info
} from 'lucide-react'
import JoinDrawer from '@/components/JoinDrawer'
import 'mapbox-gl/dist/mapbox-gl.css'

export default function RunDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [run, setRun] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchRun() {
      // Note: On récupère aussi les infos de l'organisateur via une jointure si possible, 
      // ou on simule l'avatar si les profils ne sont pas encore liés.
      const { data, error } = await supabase
        .from('runs_with_coords')
        .select('*')
        .eq('id', id)
        .single()
      
      if (data) setRun(data)
      setLoading(false)
    }
    fetchRun()
  }, [id])

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 uppercase tracking-widest text-[10px] animate-pulse">Chargement de la course...</div>
  if (!run) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-bold">Course introuvable.</div>

  const hasElevation = run.elevation ;

  return (
    <main className="min-h-screen bg-black text-white pb-40">
      {/* 1. HEADER AVEC CARTE */}
      <div className="h-[40vh] w-full relative">
        <Map
          initialViewState={{ 
            longitude: run.lng, 
            latitude: run.lat, 
            zoom: 14,
            pitch: 50 
          }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        >
          <Marker longitude={run.lng} latitude={run.lat}>
            <div className="bg-orange-600 p-2.5 rounded-full border-2 border-white shadow-[0_0_20px_rgba(234,88,12,0.6)]">
              <MapPin size={20} color="white" fill="white" />
            </div>
          </Marker>
        </Map>

        <button 
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-20 w-12 h-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-orange-600 transition-all"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
      </div>

      <div className="px-6 -mt-16 relative z-10 space-y-6">
        
        {/* 2. CARTE ORGANISATEUR & TITRE */}
        <section className="bg-zinc-900/80 backdrop-blur-md border border-white/5 p-6 rounded-[32px] shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
            {/* Affichage de la photo ou de l'initiale par défaut */}
            {run.profile_picture_url ? (
            <img 
                src={run.profile_picture_url} 
                alt={`${run.first_name} ${run.last_name}`}
                className="w-10 h-10 rounded-full border-2 border-white/10 object-cover"
            />
            ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center font-bold text-white border-2 border-white/10">
                {/* On prend la première lettre du prénom ou 'W' par défaut */}
                {run.first_name ? run.first_name[0].toUpperCase() : "W"}
            </div>
            )}
            
            <div>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.1em]">Organisé par</p>
            <p className="text-sm font-bold text-white">
                {/* Fusion du Prénom et Nom */}
                {run.first_name && run.last_name 
                ? `${run.first_name} ${run.last_name}` 
                : "Membre de la meute"}
            </p>
            </div>
        </div>
          
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-4">
            {run.title}
          </h1>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-orange-600 text-white text-[10px] font-black uppercase rounded-full tracking-wider italic">
              {run.run_type}
            </span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-black uppercase rounded-full tracking-wider">
              {run.accessibility}
            </span>
          </div>
        </section>

        {/* 3. GRILLE DE STATS TECHNIQUES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox icon={Calendar} label="Date" value={new Date(run.start_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} />
        <StatBox icon={Clock} label="Heure" value={new Date(run.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} />
        <StatBox icon={Ruler} label="Distance" value={`${run.distance} km`} />
        <StatBox icon={Activity} label="Durée estimée" value={`${run.duration} min`} />
        <StatBox icon={Mountain} label="Profil" value={run.run_profile} />
        
        {/* On affiche toujours le dénivelé, s'il est vide ou nul on met 0 */}
        <StatBox 
            icon={Mountain} 
            label="Dénivelé" 
            value={`D+ ${run.elevation || 0}m`} 
            color={run.elevation > 0 ? "text-orange-500" : "text-zinc-400"} 
        />
        
        <StatBox icon={Gauge} label="Allure" value={run.pace} />
        <StatBox icon={Info} label="Revêtement" value={run.run_soil || "Route"} />
        </div>

        {/* 4. POINT DE RENDEZ-VOUS */}
        <section className="bg-zinc-900 border border-white/5 p-6 rounded-[32px] flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
              <MapPin size={24} className="text-orange-500" />
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Point de ralliement</p>
              <p className="text-sm text-white font-bold leading-snug">{run.place}</p>
            </div>
          </div>
        </section>

        {/* 5. PARTICIPANTS */}
        <section className="bg-white/5 border border-white/5 p-6 rounded-[32px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-xs">👤</div>
              ))}
            </div>
            <div>
              <p className="text-sm font-bold">8 participants</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Limite : {run.max_attendees || 15} max</p>
            </div>
          </div>
          <Users size={20} className="text-zinc-700" />
        </section>

        {/* 6. CODE DE LA MEUTE */}
        <section className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] space-y-6">
          <h3 className="flex items-center gap-2 font-black text-white italic uppercase tracking-tighter text-xl">
            <ShieldCheck size={24} className="text-orange-500"/> Code de la meute
          </h3>
          <ul className="grid gap-4">
             <RuleItem text="Ponctualité : On part ensemble à l'heure pile." />
             <RuleItem text="Solidarité : On ne laisse personne derrière." />
             <RuleItem text="Visibilité : Tenue adaptée et respect du code de la route." />
          </ul>
          
          <div className="pt-6 border-t border-white/5">
            <p className="text-[10px] text-zinc-600 leading-relaxed uppercase font-bold tracking-tight">
              Responsabilité : En rejoignant, tu confirmes être apte à l'effort. L'organisateur n'est pas responsable des incidents.
            </p>
          </div>
        </section>
      </div>

      {/* 7. CTA FIXE */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/90 to-transparent z-30">
        <JoinDrawer run={run}>
          <button className="w-full py-5 bg-white text-black rounded-[24px] font-black text-xs uppercase tracking-[0.25em] shadow-[0_20px_50px_rgba(255,255,255,0.15)] active:scale-95 transition-all hover:bg-orange-600 hover:text-white">
            Rejoindre la meute
          </button>
        </JoinDrawer>
      </div>
    </main>
  )
}

// Composants utilitaires pour la clarté
function StatBox({ icon: Icon, label, value, color = "text-white" }) {
  return (
    <div className="bg-zinc-900 border border-white/5 p-4 rounded-[24px]">
      <div className="flex items-center gap-2 mb-2 text-zinc-500">
        <Icon size={14} className="text-orange-500" />
        <p className="text-[9px] font-black uppercase tracking-widest">{label}</p>
      </div>
      <p className={`text-xs font-bold ${color}`}>{value}</p>
    </div>
  )
}

function RuleItem({ text }) {
  return (
    <li className="flex gap-4 text-sm text-zinc-400 font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
      {text}
    </li>
  )
}