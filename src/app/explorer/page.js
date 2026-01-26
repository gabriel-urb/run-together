'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import { MapPin, Gauge, Calendar, Plus, Search } from 'lucide-react'
import Link from 'next/link'

export default function Explorer() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchRuns() {
      const { data, error } = await supabase
        .from('runs')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error) setRuns(data)
      setLoading(false)
    }
    fetchRuns()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      {/* Header & Filtres (Inspiré de ton image 4) */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md px-6 pt-12 pb-6 border-b border-white/5">
        <h1 className="text-3xl font-bold mb-6">Prochaines sorties</h1>
        
        {/* Barre de filtres horizontale */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {['Toutes', 'Quais de Saône', 'Parc Tête d\'Or', 'Matin', 'Soir'].map((filter) => (
            <button key={filter} className="px-4 py-2 rounded-full bg-zinc-900 border border-white/10 text-sm whitespace-nowrap hover:bg-orange-600 transition-colors">
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des cartes */}
      <div className="px-6 py-8 space-y-6 max-w-2xl mx-auto">
        {loading ? (
          <p className="text-center text-zinc-500">Chargement des courses...</p>
        ) : runs.map((run) => (
          <div key={run.id} className="group relative bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden hover:border-orange-500/30 transition-all shadow-xl">
            {/* Image de la carte (Optionnelle, on met un dégradé pour le moment) */}
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

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-zinc-400">
                  <MapPin size={16} className="text-orange-500" />
                  <span className="text-sm truncate">{run.location}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Gauge size={16} className="text-orange-500" />
                  <span className="text-sm">{run.pace}</span>
                </div>
              </div>

              <button className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-orange-500 hover:text-white transition-all">
                Rejoindre la meute
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bouton flottant pour créer une course (le "+" en bas à droite) */}
      <Link href="/create-run">
        <div className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/40 hover:scale-110 transition-transform active:scale-95 cursor-pointer z-50">
          <Plus color="white" size={28} />
        </div>
      </Link>
    </main>
  )
}