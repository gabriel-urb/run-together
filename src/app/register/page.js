'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase'
import { X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '', password: '', first_name: '', last_name: '', username: ''
  })
  const supabase = createClient()
  const router = useRouter()

  const handleSignUp = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username
        }
      }
    })

    if (error) alert(error.message)
    else {
      alert('Vérifie tes emails pour confirmer ton inscription !')
      router.push('/login')
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6 bg-black overflow-hidden">
      
      {/* 1. Image d'arrière-plan pour voir l'effet de flou */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/group-young-people-doing-sports-together-outdoors.jpg" 
          alt="Background"
          fill
          className="object-cover opacity-50"
        />
        {/* Overlay sombre pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* 2. Bouton Fermer (Croix) */}
      <Link href="/" className="absolute top-8 right-8 z-20 text-white/50 hover:text-white transition-colors">
        <X size={32} />
      </Link>

      {/* 3. Carte en Glassmorphism */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-[40px] bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white italic tracking-tighter">
            REJOINDRE LA <span className="text-orange-500">MEUTE</span>
          </h1>
          <p className="text-zinc-300 text-sm mt-2">Crée ton profil en quelques secondes</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="flex gap-3">
            <input 
              required
              placeholder="Prénom" 
              className="w-1/2 p-4 rounded-2xl bg-black/20 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-orange-500/50 transition-all"
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
            />
            <input 
              required
              placeholder="Nom" 
              className="w-1/2 p-4 rounded-2xl bg-black/20 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-orange-500/50 transition-all"
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            />
          </div>

          <input 
            required
            placeholder="Nom d'utilisateur" 
            className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-orange-500/50 transition-all"
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />

          <input 
            required
            type="email" 
            placeholder="E-mail" 
            className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-orange-500/50 transition-all"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <input 
            required
            type="password" 
            placeholder="Mot de passe" 
            className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-orange-500/50 transition-all"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />

          <button className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl font-bold text-white shadow-lg shadow-orange-900/40 hover:scale-[1.02] active:scale-95 transition-all mt-4">
            S'inscrire
          </button>
        </form>

        <p className="mt-8 text-center text-zinc-300 text-xs">
          Déjà un runner ? {' '}
          <Link href="/login" className="text-orange-500 font-bold hover:underline">
            Connecte-toi ici
          </Link>
        </p>
      </div>
    </main>
  )
}