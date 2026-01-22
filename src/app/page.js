export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <h1 className="text-4xl font-bold text-blue-600">
        RunTogether Lyon 🏃‍♂️
      </h1>
      <p className="mt-4 text-lg text-gray-700">
        Le futur de la course à pied collaborative.
      </p>
      <button className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition">
        Voir les prochaines sorties
      </button>
    </div>
  );
}