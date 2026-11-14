import React, { useState } from 'react';
import { Clock, ShieldAlert, Save, CalendarDays, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    heureArrivee: '08:00',
    toleranceRetard: '10', 
    heureDepart: '17:00',
    pauseDebut: '12:30',
    pauseFin: '13:30',
    joursTravail: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Paramètres sauvegardés :', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000); 
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres du Système</h1>
        <p className="text-sm text-gray-500">Configurez les horaires officiels et les règles de pointage de l'entreprise.</p>
      </div>
      {saved && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 size={20} className="text-emerald-600" />
          <span>Paramètres enregistrés avec succès ! Les modifications seront appliquées aux prochains pointages.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Horaires Officiels de Travail</h2>
              <p className="text-xs text-gray-500">Définit la base de calcul pour identifier les retards ou départs anticipés.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure limite d'arrivée</label>
              <input
                type="time"
                name="heureArrivee"
                value={settings.heureArrivee}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tolérance de retard (en minutes)</label>
              <input
                type="number"
                name="toleranceRetard"
                value={settings.toleranceRetard}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-xs text-gray-400 mt-1 block">Passé ce délai, le statut bascule automatiquement en "En retard".</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure officielle de départ</label>
              <input
                type="time"
                name="heureDepart"
                value={settings.heureDepart}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Gestion des Pauses</h2>
              <p className="text-xs text-gray-500">Définissez la plage horaire de la pause déjeuner.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Début de la pause</label>
              <input
                type="time"
                name="pauseDebut"
                value={settings.pauseDebut}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fin de la pause</label>
              <input
                type="time"
                name="pauseFin"
                value={settings.pauseFin}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <CalendarDays size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Jours Ouvrés de l'Entreprise</h2>
              <p className="text-xs text-gray-500">Jours pris en compte pour le calcul des présences et absences.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(jour => {
              const isActive = settings.joursTravail.includes(jour);
              return (
                <button
                  type="button"
                  key={jour}
                  onClick={() => {
                    const updated = isActive
                      ? settings.joursTravail.includes(jour)
                        ? settings.joursTravail.filter(j => j !== jour)
                        : settings.joursTravail
                      : [...settings.joursTravail, jour];
                    setSettings({ ...settings, joursTravail: updated });
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {jour}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition"
          >
            <Save size={18} />
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}