import { useState } from 'react';
import Pointages from './pages/pointages/pointages.tsx';
import Settings from './pages/settings/settings.tsx';
import { Clock, Settings as SettingsIcon, LayoutDashboard, Users } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'pointages' | 'settings'>('pointages');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <Clock className="text-blue-600" /> TimeTrack Admin
          </h1>
          <p className="text-xs text-gray-400 mt-1">Système de Pointage & RH</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('pointages')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'pointages'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock size={18} />
            Suivi des Pointages
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'settings'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <SettingsIcon size={18} />
            Paramètres
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 text-xs text-gray-400 text-center">
          TimeTrack
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 p-4 md:hidden flex justify-between items-center">
          <span className="font-bold text-blue-600">TimeTrack</span>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('pointages')}
              className={`px-3 py-1.5 text-xs rounded-md font-medium ${
                activeTab === 'pointages' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Pointages
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 text-xs rounded-md font-medium ${
                activeTab === 'settings' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Paramètres
            </button>
          </div>
        </header>

        {activeTab === 'pointages' && <Pointages />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
}