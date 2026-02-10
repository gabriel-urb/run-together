'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { Map, Marker } from 'react-map-gl/mapbox'
import dynamic from 'next/dynamic'
import { 
  LocateFixed, Calendar, Clock, Trophy, Mountain, 
  Zap, Users, ChevronRight, ChevronLeft, Gauge, 
  Ruler, Timer, MapPin, AlignLeft 
} from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'

const SearchBox = dynamic(
  () => import('@mapbox/search-js-react').then((mod) => mod.SearchBox),
  { ssr: false, loading: () => <div className="h-14 w-full bg-zinc-900 animate-pulse rounded-2xl" /> }
)

export default function CreateRun() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    run_type: 'Run Social',
    pace: '5:30',
    distance: 10,
    duration: '45 min - 1h',
    run_profile: 'Plat',
    elevation: 0,
    run_soil: 'Route',
    title: '',
    date_only: new Date().toISOString().split('T')[0],
    time_only: '18:30',
    place: '',
    lat: 45.7640,
    lng: 4.8357,
    accessibility: 'Tous niveaux',
    max_attendees: 10 
  })

  const [viewport, setViewport] = useState({
    latitude: 45.7640,
    longitude: 4.8357,
    zoom: 12
  })

  const updateAddress = async (lng, lat) => {
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&language=fr`)
      const data = await res.json()
      if (data.features?.length > 0) {
        setFormData(prev => ({ ...prev, place: data.features[0].place_name, lat, lng }))
      }
    } catch (err) { console.error(err) }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("Tu dois être connecté !");
        setLoading(false);
        return;
      }

      // Reconstruction du timestamp pour Supabase (combine date + heure)
      const combinedDateTime = new Date(`${formData.date_only}T${formData.time_only}:00`).toISOString();

      const runData = {
        title: formData.title,
        start_time: combinedDateTime, // Correction ici
        distance: parseFloat(formData.distance),
        pace: formData.pace,
        run_type: formData.run_type,
        accessibility: formData.accessibility,
        run_profile: formData.run_profile,
        run_soil: formData.run_soil,
        place: formData.place,
        location: `POINT(${formData.lng} ${formData.lat})`,
        organizer_id: user.id,
        max_attendees: parseInt(formData.max_attendees) || 15,
        elevation: parseInt(formData.elevation) || 0
      };

      const { data: newRun, error: runError } = await supabase
        .from('runs')
        .insert([runData])
        .select()
        .single();

      if (runError) throw runError;

      const { error: attendeeError } = await supabase
        .from('runs_attendees')
        .insert([
          {
            run_id: newRun.id,
            user_id: user.id,
            is_organizer: true
          }
        ]);

      if (attendeeError) throw attendeeError;

      // Redirection
      router.push(`/explorer/${newRun.id}`);

    } catch (err) {
      console.error("Erreur complète:", err);
      alert("Erreur lors de la création : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const BadgeSelector = ({ label, options, current, field, icon: Icon, values }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 ml-1 text-zinc-500">
        {Icon && <Icon size={14} />}
        <label className="text-[10px] font-black uppercase tracking-widest">{label}</label>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt, index) => {
          const value = values ? values[index] : opt
          const isActive = current === value
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setFormData({ ...formData, [field]: value })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                isActive 
                ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-900/20' 
                : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/20'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-orange-600/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl flex items-center gap-3 mb-12 px-4">
        <div className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step >= 1 ? 'bg-orange-500' : 'bg-zinc-800'}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step >= 2 ? 'bg-orange-500' : 'bg-zinc-800'}`} />
      </div>

      <div className="w-full max-w-4xl pb-20">
        {step === 1 ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="px-2">
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">Étape 1 : <span className="text-orange-500">La Séance</span></h1>
              <p className="text-zinc-500 text-sm">Définis les caractéristiques de ton run.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900/30 p-8 rounded-[40px] border border-white/5 backdrop-blur-md">
              <BadgeSelector 
                label="Type de sortie" field="run_type" current={formData.run_type} 
                options={['EF', 'Sortie Longue', 'Seuil', 'Fractionné', 'Run Social']} icon={Trophy} 
              />
              
              <BadgeSelector 
                label="Allure moyenne" field="pace" current={formData.pace} 
                options={['4:00', '4:30', '5:00', '5:30', '6:00', '6:30+']} icon={Gauge} 
              />

              <div className="space-y-4">
                <div className="flex items-center gap-2 ml-1 text-zinc-500">
                  <Ruler size={14}/>
                  <label className="text-[10px] font-black uppercase tracking-widest">Distance (km)</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 15, 20].map(d => (
                    <button key={d} type="button" onClick={() => setFormData({...formData, distance: d})}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${formData.distance == d ? 'bg-orange-600 border-orange-500 text-white' : 'bg-zinc-900 text-zinc-400 border-white/5'}`}>
                      {d} km
                    </button>
                  ))}
                </div>
                <input type="number" value={formData.distance} onChange={e => setFormData({...formData, distance: e.target.value})} 
                  className="w-full p-4 bg-zinc-900/80 rounded-2xl border border-white/10 outline-none focus:border-orange-500 transition-all font-bold text-white shadow-inner" />
              </div>

              <div className="space-y-3">
                <BadgeSelector 
                  label="Durée estimée" 
                  field="duration" 
                  current={formData.duration} 
                  options={['< 45 min', '45 min - 1h', '1h - 1h30', '1h30 - 2h', '> 2h']} 
                  icon={Timer} 
                />
              </div>

              <BadgeSelector 
                label="Profil du parcours" field="run_profile" current={formData.run_profile} 
                options={['Plat', 'Vallonné', 'Côte', 'Montagne']} icon={Mountain} 
              />

              <BadgeSelector 
                label="Revêtement" field="run_soil" current={formData.run_soil} 
                options={['Route', 'Trail', 'Piste', 'Mixte']} icon={MapPin} 
              />

              {['Vallonné', 'Côte', 'Montagne'].includes(formData.run_profile) && (
                <div className="col-span-1 md:col-span-2 space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 ml-1 text-orange-500">
                    <Zap size={14}/>
                    <label className="text-[10px] font-black uppercase tracking-widest">Dénivelé positif (mètres)</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[100, 200, 500, 1000, 1500, 2000].map(elevation => (
                      <button key={elevation} type="button" onClick={() => setFormData({...formData, elevation})}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${formData.elevation == elevation ? 'bg-orange-600 border-orange-500 text-white' : 'bg-zinc-900 text-zinc-400 border-white/5'}`}>
                        +{elevation}m
                      </button>
                    ))}
                  </div>
                  <input type="number" value={formData.elevation} onChange={e => setFormData({...formData, elevation: e.target.value})} 
                    className="w-full p-4 bg-orange-500/10 rounded-2xl border border-orange-500/30 outline-none text-orange-500 font-bold shadow-inner" placeholder="Saisie manuelle..." />
                </div>
              )}
            </div>

            <button onClick={() => setStep(2)} className="w-full py-6 mt-8 bg-white text-black rounded-[30px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
              Suivant : Logistique <ChevronRight size={20} />
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="px-2">
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">Étape 2 : <span className="text-orange-500">Logistique</span></h1>
              <p className="text-zinc-500 text-sm">Où et quand se retrouve-t-on ?</p>
            </div>

            <div className="bg-zinc-900/30 p-8 rounded-[40px] border border-white/5 backdrop-blur-md space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Titre de la sortie</label>
                <input required placeholder="Donne un nom sympa à ton run..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-6 bg-zinc-900/80 rounded-3xl border border-white/10 text-xl font-bold outline-none focus:border-orange-500 shadow-inner" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/80 p-4 rounded-2xl border border-white/10 shadow-inner"><label className="text-[10px] text-zinc-500 uppercase font-black">Date</label><input type="date" value={formData.date_only} onChange={e => setFormData({...formData, date_only: e.target.value})} className="bg-transparent w-full outline-none font-bold [color-scheme:dark]" /></div>
                <div className="bg-zinc-900/80 p-4 rounded-2xl border border-white/10 shadow-inner"><label className="text-[10px] text-zinc-500 uppercase font-black">Heure</label><input type="time" value={formData.time_only} onChange={e => setFormData({...formData, time_only: e.target.value})} className="bg-transparent w-full outline-none font-bold [color-scheme:dark]" /></div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Lieu de rendez-vous</label>
                <SearchBox 
                  accessToken={mapboxToken} 
                  value={formData.place} 
                  onRetrieve={(res) => {
                    const [lng, lat] = res.features[0].geometry.coordinates;
                    setFormData({...formData, place: res.features[0].properties.full_address, lat, lng});
                    setViewport(v => ({...v, longitude: lng, latitude: lat, zoom: 15}));
                  }} 
                  theme={{ 
                    variables: { 
                      colorBackground: '#18181b',
                      colorText: '#ffffff', 
                      fontFamily: 'inherit',
                      border: '1px solid rgba(255,255,255,0.1)'
                    },
                    cssText: `
                      .mapboxsearch-search-input { color: white !important; background-color: transparent !important; }
                      .mapboxsearch-suggestion-title { color: white !important; }
                      .mapboxsearch-suggestion-address { color: #a1a1aa !important; }
                      .mapboxsearch-search-container { background-color: #09090b !important; border-radius: 16px !important; }
                    ` 
                  }} 
                />
                
                <div className="h-[400px] rounded-[30px] overflow-hidden border border-white/10 relative shadow-2xl">
                  <Map {...viewport} onMove={e => setViewport(e.viewState)} onClick={e => updateAddress(e.lngLat.lng, e.lngLat.lat)} mapStyle="mapbox://styles/mapbox/dark-v11" mapboxAccessToken={mapboxToken}>
                    <Marker longitude={formData.lng} latitude={formData.lat} color="#f97316" />
                    <button type="button" onClick={() => navigator.geolocation.getCurrentPosition(p => setViewport(v => ({...v, latitude: p.coords.latitude, longitude: p.coords.longitude, zoom: 15})))} 
                      className="absolute top-4 left-4 bg-black/80 p-3 rounded-xl border border-white/10 hover:bg-orange-600 transition-all z-10">
                      <LocateFixed size={18} />
                    </button>
                  </Map>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <BadgeSelector 
                  label="Niveau requis" field="accessibility" current={formData.accessibility} 
                  options={['Tous niveaux', 'Débutant' , 'Intermédiaire', 'Confirmé']} icon={AlignLeft} 
                />
                
                <BadgeSelector 
                  label="Participants maximum" field="max_attendees" current={formData.max_attendees} 
                  options={['3', '5', '10', '20', '50', 'Illimité']} 
                  values={[3, 5, 10, 20, 50, 0]} 
                  icon={Users} 
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(1)} className="p-6 bg-zinc-900 text-white rounded-[30px] font-black uppercase flex items-center gap-2 hover:bg-zinc-800 transition-all">
                <ChevronLeft size={20}/> Retour
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex-1 py-6 bg-orange-600 text-white rounded-[30px] font-black uppercase tracking-widest shadow-2xl shadow-orange-900/40 flex items-center justify-center gap-2 hover:bg-orange-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Création en cours...' : 'Créer la sortie'} 
                {!loading && <Zap size={18} className="fill-current"/>}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}