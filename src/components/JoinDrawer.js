'use client'

import { Drawer } from 'vaul'
import { MapPin, Gauge, Users, CheckCircle2, Calendar, X } from 'lucide-react'
import { useState } from 'react'

export default function JoinDrawer({ run, children }) {
  const [step, setStep] = useState('form') // 'form' ou 'success'

  const handleConfirm = () => {
    // Plus tard : insertion dans une table 'participants' de Supabase
    setStep('success')
  }

  // Fonction pour réinitialiser le tiroir quand on le ferme
  const onOpenChange = (open) => {
    if (!open) {
      setTimeout(() => setStep('form'), 300)
    }
  }

  return (
    <Drawer.Root shouldScaleBackground onOpenChange={onOpenChange}>
      <Drawer.Trigger asChild>
        {children}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Drawer.Content className="bg-zinc-900 border-t border-white/10 flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-50 max-h-[94vh] outline-none">
          {/* Barre de drag sur mobile */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-700 my-4" />
          
          <div className="p-6 overflow-y-auto no-scrollbar">
            {step === 'form' ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* 1. Rappel Rapide */}
                <section>
                  <h2 className="text-xl font-bold mb-4 text-white">Rejoindre la sortie</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-zinc-500 uppercase font-black mb-1 tracking-widest">Lieu</p>
                      <div className="flex items-center gap-2 text-sm text-zinc-200">
                        <MapPin size={14} className="text-orange-500 shrink-0"/> 
                        <span className="truncate">{run.place}</span>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-zinc-500 uppercase font-black mb-1 tracking-widest">Allure</p>
                      <div className="flex items-center gap-2 text-sm text-zinc-200">
                        <Gauge size={14} className="text-orange-500 shrink-0"/> 
                        {run.pace}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. Participants */}
                <section className="flex items-center justify-between bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20">
                  <div className="flex items-center gap-3">
                    <Users className="text-orange-500" size={20} />
                    <span className="font-bold text-orange-500 text-sm">12 runners participent</span>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-[10px]">👤</div>
                    ))}
                  </div>
                </section>

                {/* 3. Règles de bonne conduite */}
                <section>
                  <h3 className="font-bold mb-4 text-[11px] uppercase tracking-[0.2em] text-zinc-500">Règles d'or</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4 p-1">
                      <div className="bg-green-500/10 p-1.5 rounded-lg h-fit">
                        <CheckCircle2 size={16} className="text-green-500" />
                      </div>
                      <div className="text-sm">
                        <p className="text-zinc-200 font-medium">Ponctualité</p>
                        <p className="text-zinc-500 text-xs">Je serai au RDV 5 min avant le départ.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-1">
                      <div className="bg-green-500/10 p-1.5 rounded-lg h-fit">
                        <CheckCircle2 size={16} className="text-green-500" />
                      </div>
                      <div className="text-sm">
                        <p className="text-zinc-200 font-medium">Communication</p>
                        <p className="text-zinc-500 text-xs">Je préviens si j'ai un empêchement.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 4. Micro-formulaire */}
                <section>
                  <label className="block font-bold mb-3 text-[11px] uppercase tracking-[0.2em] text-zinc-500">Info pour le capitaine (optionnel)</label>
                  <textarea 
                    placeholder="Ex: Je serai en t-shirt rouge !"
                    className="w-full bg-zinc-800/50 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-zinc-600"
                    rows="2"
                  />
                </section>

                <button 
                  onClick={handleConfirm}
                  className="w-full py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5"
                >
                  Confirmer ma présence
                </button>
              </div>
            ) : (
              /* ÉTAPE 2 : SUCCÈS (Pop-up de confirmation) */
              <div className="py-10 text-center space-y-8 animate-in slide-in-from-bottom duration-500">
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
                  <div className="relative bg-green-500/20 rounded-full w-full h-full flex items-center justify-center">
                    <CheckCircle2 size={48} className="text-green-500" />
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-black mb-3 italic uppercase tracking-tighter">On se voit là-bas !</h2>
                  <p className="text-zinc-400 text-sm max-w-[250px] mx-auto leading-relaxed">
                    Ton inscription pour <span className="text-white font-bold">"{run.title}"</span> est confirmée.
                  </p>
                </div>
                
                <div className="bg-white/5 p-6 rounded-[24px] border border-white/5 space-y-4">
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Ajouter à mon calendrier</p>
                  <div className="flex gap-2 justify-center">
                    <button className="flex-1 py-3 bg-zinc-800 rounded-xl text-xs font-bold hover:bg-zinc-700 border border-white/5 transition-colors">Google</button>
                    <button className="flex-1 py-3 bg-zinc-800 rounded-xl text-xs font-bold hover:bg-zinc-700 border border-white/5 transition-colors">Apple</button>
                    <button className="flex-1 py-3 bg-zinc-800 rounded-xl text-xs font-bold hover:bg-zinc-700 border border-white/5 transition-colors">Outlook</button>
                  </div>
                </div>

                <Drawer.Close className="w-full py-4 bg-white text-black rounded-2xl font-bold text-sm uppercase tracking-widest active:scale-95">
                  Fermer
                </Drawer.Close>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}