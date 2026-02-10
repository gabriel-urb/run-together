'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import { 
  Calendar, MapPin, Trophy, ChevronRight, 
  History, Rocket, Clock, User 
} from 'lucide-react'
import Link from 'next/link'

export default function MyRuns() {
  const supabase = createClient()
  const [upcomingRuns, setUpcomingRuns] = useState([])
  const [pastRuns, setPastRuns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyRuns()
  }, [])

  const fetchMyRuns = async () => {
    setLoading(true)
    
    // 1. Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    // 2. Requête sur runs_attendees pour récupérer les runs liés
    // On filtre deleted_at IS NULL pour ne pas voir les inscriptions annulées
    const { data, error } = await supabase
      .from('runs_attendees')
      .select(`
        is_organizer,
        run:runs_with_coords(*)
      `)
      .eq('user_id', user.id)
      .is('deleted_at', null) 

    if (error) {
      console.error("Erreur fetch runs:", error)
    } else if (data) {
      const now = new Date()
      
      // On extrait les objets 'run' et on les sépare par date
      const allRuns = data.map(item => ({
        ...item.run,
        is_organizer: item.is_organizer
      })).filter(r => r !== null) // Sécurité si un run n'existe plus

      const upcoming = allRuns
        .filter(run => new Date(run.start_time) >= now)
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))

      const past = allRuns
        .filter(run => new Date(run.start_time) < now)
        .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
      
      setUpcomingRuns(upcoming)
      setPastRuns(past)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-2">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter italic">Mes <span className="text-orange-500">Sorties</span></h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest px-1">Ton historique de sorties</p>
        </header>

        {/* SECTION À VENIR */}
        <section className="space-y-6">
          <h2 className="flex items-center gap-3 text-xl font-black italic uppercase tracking-tight text-white bg-zinc-900/50 w-fit px-4 py-2 rounded-2xl border border-white/5">
            <Rocket size={20} className="text-orange-500" /> Prochaines sorties
          </h2>
          
          {upcomingRuns.length > 0 ? (
            <div className="grid gap-4">
              {upcomingRuns.map(run => (
                <RunCard key={run.id} run={run} />
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/20 border border-dashed border-white/10 rounded-[32px] p-12 text-center">
              <p className="text-zinc-500 font-medium">Aucune sortie prévue pour le moment.</p>
              <Link href="/explorer" className="text-orange-500 text-sm font-bold uppercase mt-4 inline-block hover:underline">
                Explorer la carte
              </Link>
            </div>
          )}
        </section>

        {/* SECTION PASSÉES */}
        {pastRuns.length > 0 && (
          <section className="space-y-6 pt-6">
            <h2 className="flex items-center gap-3 text-xl font-black italic uppercase tracking-tight text-zinc-500 px-4">
              <History size={20} /> Historique
            </h2>
            <div className="grid gap-4 opacity-70 grayscale-[0.5] hover:grayscale-0 transition-all">
              {pastRuns.map(run => (
                <RunCard key={run.id} run={run} isPast={true} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function RunCard({ run, isPast = false }) {
  const date = new Date(run.start_time)
  
  return (
    <Link href={`/explorer/${run.id}`}>
      <div className="group bg-zinc-900/40 border border-white/5 p-5 rounded-[32px] hover:bg-zinc-900 hover:border-orange-500/30 transition-all flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Date Badge */}
          <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border ${isPast ? 'bg-zinc-950 border-white/5' : 'bg-zinc-800 border-white/10 shadow-lg'}`}>
            <span className="text-[10px] font-black uppercase text-orange-500">
              {date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}
            </span>
            <span className="text-2xl font-black leading-none">{date.getDate()}</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {run.is_organizer && (
                <span className="flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20">
                  <User size={8} /> Leader
                </span>
              )}
              <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-white/5 text-zinc-500 rounded-full">
                {run.run_type}
              </span>
            </div>
            <h3 className="font-bold text-xl tracking-tight group-hover:text-orange-500 transition-colors uppercase italic">
              {run.title}
            </h3>
            <div className="flex items-center gap-4 text-zinc-500">
              <span className="text-xs flex items-center gap-1.5"><MapPin size={14} className="text-orange-500/50" /> {run.place.split(',')[0]}</span>
              <span className="text-xs flex items-center gap-1.5"><Clock size={14} className="text-orange-500/50" /> {date.getHours()}:{date.getMinutes().toString().padStart(2, '0')}</span>
              <span className="text-xs flex items-center gap-1.5"><Trophy size={14} className="text-orange-500/50" /> {run.distance}km</span>
            </div>
          </div>
        </div>
        
        <div className="pr-2">
          <div className="w-10 h-10 rounded-full bg-zinc-950 flex items-center justify-center border border-white/5 group-hover:border-orange-500/50 group-hover:bg-orange-500/10 transition-all">
            <ChevronRight className="text-zinc-700 group-hover:text-orange-500" size={20} />
          </div>
        </div>
      </div>
    </Link>
  )
}