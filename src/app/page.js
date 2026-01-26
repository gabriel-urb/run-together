import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-end pb-24 bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/group-young-people-doing-sports-together-outdoors.jpg" 
          alt="Runners" fill className="object-cover opacity-60" priority 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-lg w-full">
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-tight">
          RUN<br /><span className="text-orange-500">TOGETHER</span>
        </h1>
        
        <div className="flex flex-col gap-4 mt-8">
          <Link href="/register">
            <button className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-bold text-xl shadow-lg shadow-orange-900/20 transition-all active:scale-95">
              Créer un compte
            </button>
          </Link>
          
          <Link href="/login">
            <button className="w-full py-5 bg-zinc-900/80 text-white border border-white/10 rounded-2xl font-bold text-xl backdrop-blur-md transition-all active:scale-95">
              Se connecter
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}