'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import Map, { Marker } from 'react-map-gl/mapbox'
import { MapPin, Gauge, Clock, AlertTriangle, ShieldCheck, ChevronLeft, Users } from 'lucide-react'
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 uppercase tracking-widest text-xs">Chargement de la course...</div>
  if (!run) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Course introuvable.</div>

  return (
    <main className="min-h-screen bg-black text-white pb-32">
      {/* 1. HEADER AVEC CARTE */}
      <div className="h-[45vh] w-full relative">
        <Map
          initialViewState={{ 
            longitude: run.lng, 
            latitude: run.lat, 
            zoom: 14,
            pitch: 45 // Effet 3D léger
          }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        >
          <Marker longitude={run.lng} latitude={run.lat}>
            <div className="bg-orange-600 p-2.5 rounded-full border-2 border-white shadow-[0_0_20px_rgba(234,88,12,0.5)]">
              <MapPin size={20} color="white" fill="white" />
            </div>
          </Marker>
        </Map>

        {/* Bouton Retour */}
        <button 
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-20 w-10 h-10 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Gradient pour fondre la carte dans le contenu */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="px-6 -mt-12 relative z-10 space-y-8">
        {/* 2. TITRE ET AVATARS PARTICIPANTS */}
        <section>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-6 leading-none">
            {run.title}
          </h1>
          
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[24px] border border-white/5">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                  👤
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-black bg-orange-600 flex items-center justify-center text-[10px] font-black italic">
                +7
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none mb-1">12 participants</p>
              <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Meute en cours de formation</p>
            </div>
          </div>
        </section>

        {/* 3. INFOS DÉTAILLÉES */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-zinc-900 border border-white/5 p-5 rounded-[28px]">
              <p className="text-zinc-500 text-[10px] font-black uppercase mb-3 tracking-widest">Point de RDV</p>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-orange-500 shrink-0" />
                <p className="text-sm text-zinc-200 font-medium leading-snug">{run.place}</p>
              </div>
           </div>
           <div className="bg-zinc-900 border border-white/5 p-5 rounded-[28px]">
              <p className="text-zinc-500 text-[10px] font-black uppercase mb-3 tracking-widest">Allure cible</p>
              <div className="flex items-center gap-3">
                <Gauge size={18} className="text-orange-500 shrink-0" />
                <p className="text-sm text-zinc-200 font-medium">{run.pace}</p>
              </div>
           </div>
        </div>

        {/* 4. RÈGLES & PRÉVENTION */}
        <section className="bg-zinc-900/50 border border-white/5 p-6 rounded-[32px] space-y-8 shadow-2xl">
          <div>
            <h3 className="flex items-center gap-2 font-black mb-5 text-white italic uppercase tracking-tighter text-lg">
              <ShieldCheck size={22} className="text-orange-500"/> Code de la meute
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-4 text-sm text-zinc-400 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                Ponctualité : On part ensemble à l'heure indiquée.
              </li>
              <li className="flex gap-4 text-sm text-zinc-400 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                Solidarité : On attend les derniers en haut des montées.
              </li>
              <li className="flex gap-4 text-sm text-zinc-400 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                Esprit Wolfpack : On court pour le plaisir et le groupe.
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-zinc-600" />
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Responsabilité</p>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              En rejoignant cette sortie, tu reconnais être en bonne santé physique. L'organisateur n'est pas responsable des blessures ou incidents. Reste visible et respecte le code de la route.
            </p>
          </div>
        </section>
      </div>

      {/* 5. CTA FIXE (Bouton rejoindre) */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-30">
        <JoinDrawer run={run}>
          <button className="w-full py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 transition-all">
            Rejoindre la sortie
          </button>
        </JoinDrawer>
      </div>
    </main>
  )
}