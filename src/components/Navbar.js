'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, Plus, ListStart } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Navbar() {
  const pathname = usePathname()

  const handlePress = () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(15); 
    }
  }

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-sm">
      <div className="relative flex items-end justify-around bg-zinc-900/90 backdrop-blur-2xl border border-white/5 px-4 py-3 rounded-[35px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
        
        {/* EXPLORER */}
        <NavLink 
          href="/explorer" 
          icon={<Map size={22} />} 
          label="Explorer" 
          active={pathname === '/explorer'} 
          onClick={handlePress} 
        />

        {/* BOUTON CENTRAL : CRÉER */}
        <div className="relative -top-8">
          <Link href="/create-run" onClick={handlePress}>
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, rotate: 90 }}
              className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(234,88,12,0.4)] border-4 border-black text-white"
            >
              <Plus size={32} strokeWidth={3} />
            </motion.div>
          </Link>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-orange-500 italic">
            Créer
          </span>
        </div>

        {/* MES SORTIES */}
        <NavLink 
          href="/my-runs" 
          icon={<ListStart size={22} />} 
          label="Mes Runs" 
          active={pathname === '/my-runs'} 
          onClick={handlePress} 
        />
      </div>
    </nav>
  )
}

function NavLink({ href, icon, label, active, onClick }) {
  return (
    <Link href={href} onClick={onClick} className="flex flex-col items-center gap-1 min-w-[64px]">
      <motion.div 
        animate={{ 
          color: active ? '#f97316' : '#71717a',
          y: active ? -2 : 0 
        }}
        className="relative"
      >
        {icon}
        {active && (
          <motion.div 
            layoutId="dot"
            className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-orange-500 rounded-full"
          />
        )}
      </motion.div>
      <span className={`text-[10px] font-bold uppercase tracking-tighter transition-colors ${
        active ? 'text-white' : 'text-zinc-500'
      }`}>
        {label}
      </span>
    </Link>
  )
}