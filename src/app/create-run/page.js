'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

export default function CreateRun() {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [pace, setPace] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const paceOptions = [
    "- de 3:00 min/km",
    "Entre 3:00 et 3:30 min/km",
    "Entre 3:30 et 4:00 min/km",
    "Entre 4:00 et 4:30 min/km",
    "Entre 4:30 et 5:00 min/km",
    "Entre 5:00 et 5:30 min/km",
    "+ de 5:30 min/km"
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 1. Récupération de l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("Tu dois être connecté pour publier une course !")
      return
    }

    // 2. Insertion avec l'ID de l'organisateur
    const { data, error } = await supabase
      .from('runs')
      .insert([{ 
        title, 
        location, 
        pace, 
        organizer_id: user.id 
      }])

    if (error) {
      alert("Erreur : " + error.message)
    } else {
      alert("Course créée avec succès ! 🏃‍♂️")
      router.push('/explorer') // On pourra créer cette page juste après
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
      {/* Effet de halo orange en arrière-plan */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-600/20 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-extrabold mb-2 text-white tracking-tight">Proposer une <span className="text-orange-500">course</span></h1>
        <p className="text-zinc-400 mb-8 text-sm">Remplis les détails pour trouver tes partenaires.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Titre de la sortie</label>
            <input 
              required
              placeholder="ex: Footing matinal Quais de Saône" 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 rounded-2xl bg-zinc-900/50 border border-white/10 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all placeholder:text-zinc-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Allure prévue</label>
            <div className="relative">
              <select 
                required
                onChange={(e) => setPace(e.target.value)}
                className="w-full p-4 rounded-2xl bg-zinc-900/50 border border-white/10 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none appearance-none transition-all cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled className="bg-zinc-900 text-zinc-500">Choisir une allure</option>
                {paceOptions.map((option) => (
                  <option key={option} value={option} className="bg-zinc-900 text-white">{option}</option>
                ))}
              </select>
              {/* Petite flèche personnalisée pour le select */}
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-500">
                ▼
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Lieu de RDV</label>
            <input 
              required
              placeholder="ex: Place Bellecour" 
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-4 rounded-2xl bg-zinc-900/50 border border-white/10 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all placeholder:text-zinc-700"
            />
          </div>

          <button className="w-full py-4 mt-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl font-bold text-lg shadow-lg shadow-orange-900/20 hover:scale-[1.02] active:scale-95 transition-all">
            Publier la course
          </button>
        </form>
      </div>
    </main>
  )
}