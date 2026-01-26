'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else {
      alert('Connecté !')
      router.push('/explorer') 
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6 bg-black">
      {/* Arrière-plan avec image locale */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/group-young-people-doing-sports-together-outdoors.jpg" 
          alt="Background"
          fill
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* Croix pour quitter (Placée ici pour être en haut à droite de l'ÉCRAN) */}
      <Link 
        href="/" 
        className="absolute top-8 right-8 z-50 text-white/50 hover:text-white transition-colors"
      >
        <X size={32} />
      </Link>

      {/* Carte du formulaire en Glassmorphism */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-[40px] bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white italic tracking-tighter">
            CONTENT DE TE <span className="text-orange-500">REVOIR</span>
          </h1>
          <p className="text-zinc-300 text-sm mt-2">Prêt pour ta prochaine sortie ?</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">E-mail</label>
            <input
              type="email"
              required
              placeholder="votre@email.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl bg-black/20 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Mot de passe</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl bg-black/20 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all"
            />
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-orange-900/40"
            >
              Se connecter
            </button>
            
            <p className="text-center text-zinc-400 text-sm">
              Pas encore de compte ?{' '}
              <Link href="/register" className="text-orange-500 font-bold hover:underline underline-offset-4 transition-all">
                Créer un compte ici
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}