'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase' // On importe notre nouvel outil

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient() // On initialise la connexion

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirige l'utilisateur vers ta page d'accueil après confirmation
        emailRedirectTo: `${window.location.origin}`,
      },
    })

    if (error) {
      alert("Erreur : " + error.message)
    } else {
      alert('Succès ! Vérifie tes emails pour confirmer ton inscription.')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-2xl">
        <h2 className="text-3xl font-extrabold text-center text-blue-600">Rejoindre la meute</h2>
        <form onSubmit={handleSignUp} className="space-y-4">
          <input 
            type="email" 
            placeholder="Ton email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input 
            type="password" 
            placeholder="Mot de passe (6 caractères min.)" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {loading ? 'Chargement...' : "S'inscrire"}
          </button>
        </form>
      </div>
    </div>
  )
}