import { useMemo, useState } from "react";
import {
  Users, Clock, UserX, Plane, RefreshCw, Download, Search,
  ArrowUpDown, Check, X,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

/* ---------- Données simulées (à remplacer par des appels API) ---------- */
const DEPARTEMENTS = ["RH", "Informatique", "Comptabilité", "Production"];

const NOMS = [
  "Jean Dupont", "Marie Ngo", "Paul Essomba", "Sandra Tchoua", "Alain Mbarga",
  "Carine Fotso", "Brice Kamga", "Nadine Mvondo", "Hervé Nkeng", "Liliane Biyong",
  "Patrick Atangana", "Josiane Ewane", "Serge Onana", "Estelle Manga", "Rodrigue Tabi",
  "Flore Mbida", "Yannick Ndzana", "Ariane Kotto", "Désiré Fouda", "Mireille Eyenga",
  "Cédric Ngassa", "Ornella Meka", "Boris Nyobe", "Gisèle Ayissi",
];

const EMPLOYES = NOMS.map((nom, i) => ({
  id: i + 1,
  nom,
  departement: DEPARTEMENTS[i % DEPARTEMENTS.length],
}));

const STATUTS = {
  present: "À l'heure",
  retard: "En retard",
  absent: "Absent",
  conge: "En congé",
};

const COULEURS = {
  present: "#374151",
  retard: "#6b7280",
  absent: "#d1d5db",
  conge: "#9ca3af",
};

const BADGES = {
  present: "bg-gray-100 text-gray-700",
  retard: "bg-gray-800 text-white",
  absent: "bg-gray-300 text-gray-800",
  conge: "border border-gray-400 text-gray-600",
};

// Générateur pseudo-aléatoire stable : les mêmes valeurs à chaque rendu
const seeded = (n) => {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

function statutDuJour(id, jour) {
  const r = seeded(jour * 100 + id);
  if (r < 0.72) return "present";
  if (r < 0.88) return "retard";
  if (r < 0.95) return "absent";
  return "conge";
}

function heureArrivee(id, jour, statut) {
  if (statut === "absent" || statut === "conge") return "—";
  const base = statut === "present" ? 7 * 60 + 20 : 8 * 60 + 5;
  const ampleur = statut === "present" ? 40 : 55;
  const m = base + Math.floor(seeded(id * 7 + jour) * ampleur);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

function libelleJour(joursEnArriere) {
  const d = new Date();
  d.setDate(d.getDate() - joursEnArriere);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

const CONGES_INITIAUX = [
  { id: 1, nom: "Carine Fotso", departement: "Informatique", du: "24/11", au: "28/11", etat: "attente" },
  { id: 2, nom: "Hervé Nkeng", departement: "Production", du: "01/12", au: "05/12", etat: "attente" },
  { id: 3, nom: "Estelle Manga", departement: "RH", du: "21/11", au: "22/11", etat: "attente" },
];

/* ---------- Composant ---------- */
export default function Dashboard() {
  const [departement, setDepartement] = useState("Tous");
  const [periode, setPeriode] = useState(7);
  const [filtreStatut, setFiltreStatut] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [tri, setTri] = useState({ cle: "nom", sens: "asc" });
  const [conges, setConges] = useState(CONGES_INITIAUX);
  const [derniereMaj, setDerniereMaj] = useState(new Date());

  const aujourdhui = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // Employés concernés par le filtre de département
  const employes = useMemo(
    () => EMPLOYES.filter((e) => departement === "Tous" || e.departement === departement),
    [departement]
  );

  // Pointages du jour
  const pointagesDuJour = useMemo(
    () =>
      employes.map((e) => {
        const statut = statutDuJour(e.id, 0);
        return { ...e, statut, heure: heureArrivee(e.id, 0, statut) };
      }),
    [employes]
  );

  const compte = useMemo(() => {
    const c = { present: 0, retard: 0, absent: 0, conge: 0 };
    pointagesDuJour.forEach((p) => (c[p.statut] += 1));
    return c;
  }, [pointagesDuJour]);

  const total = pointagesDuJour.length;
  const effectifAttendu = total - compte.conge;
  const tauxPresence = effectifAttendu
    ? Math.round(((compte.present + compte.retard) / effectifAttendu) * 100)
    : 0;

  // Données du graphique selon la période choisie
  const historique = useMemo(() => {
    const lignes = [];
    for (let j = periode - 1; j >= 0; j--) {
      const c = { present: 0, retard: 0, absent: 0, conge: 0 };
      employes.forEach((e) => (c[statutDuJour(e.id, j)] += 1));
      lignes.push({ jour: libelleJour(j), ...c });
    }
    return lignes;
  }, [employes, periode]);

  const repartition = Object.keys(STATUTS).map((cle) => ({
    cle, name: STATUTS[cle], value: compte[cle],
  }));

  // Tableau : filtre, recherche, tri
  const lignes = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    const filtrees = pointagesDuJour.filter(
      (p) =>
        (!filtreStatut || p.statut === filtreStatut) &&
        (!q || p.nom.toLowerCase().includes(q) || p.departement.toLowerCase().includes(q))
    );
    return [...filtrees].sort((a, b) => {
      const va = tri.cle === "statut" ? STATUTS[a.statut] : a[tri.cle];
      const vb = tri.cle === "statut" ? STATUTS[b.statut] : b[tri.cle];
      const r = String(va).localeCompare(String(vb), "fr");
      return tri.sens === "asc" ? r : -r;
    });
  }, [pointagesDuJour, filtreStatut, recherche, tri]);

  const changerTri = (cle) =>
    setTri((t) =>
      t.cle === cle ? { cle, sens: t.sens === "asc" ? "desc" : "asc" } : { cle, sens: "asc" }
    );

  const exporterCSV = () => {
    const entete = ["Nom", "Département", "Heure d'arrivée", "Statut"];
    const corps = lignes.map((l) => [l.nom, l.departement, l.heure, STATUTS[l.statut]]);
    const csv = [entete, ...corps].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pointages-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const decider = (id, etat) =>
    setConges((liste) => liste.map((c) => (c.id === id ? { ...c, etat } : c)));

  const cartes = [
    { cle: "present", label: "Présents", icon: Users },
    { cle: "retard", label: "Retards", icon: Clock },
    { cle: "absent", label: "Absents", icon: UserX },
    { cle: "conge", label: "En congé", icon: Plane },
  ];

  const enAttente = conges.filter((c) => c.etat === "attente").length;

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-800">
      {/* En-tête et contrôles */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tableau de bord</h1>
          <p className="text-sm capitalize text-gray-500">{aujourdhui}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={departement}
            onChange={(e) => setDepartement(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
          >
            <option value="Tous">Tous les départements</option>
            {DEPARTEMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <button
            onClick={() => setDerniereMaj(new Date())}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Actualiser
          </button>
          <span className="text-xs text-gray-500">
            Mis à jour à {derniereMaj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </header>

      {/* Cartes cliquables */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cartes.map(({ cle, label, icon: Icon }) => {
          const actif = filtreStatut === cle;
          return (
            <button
              key={cle}
              onClick={() => setFiltreStatut(actif ? null : cle)}
              className={`flex items-center gap-4 rounded-xl border bg-white p-5 text-left transition hover:border-gray-400 ${
                actif ? "border-gray-800 ring-1 ring-gray-800" : "border-gray-200"
              }`}
            >
              <div className="rounded-lg bg-gray-100 p-3 text-gray-700">
                <Icon size={22} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-semibold">{compte[cle]}</p>
                <p className="text-xs text-gray-400">
                  {total ? Math.round((compte[cle] / total) * 100) : 0} % de l'effectif
                </p>
              </div>
            </button>
          );
        })}

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Taux de présence</p>
          <p className="text-3xl font-semibold">{tauxPresence} %</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-gray-700" style={{ width: `${tauxPresence}%` }} />
          </div>
          <p className="mt-2 text-xs text-gray-400">hors personnes en congé</p>
        </div>
      </section>

      {/* Graphiques */}
      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Évolution des présences</h2>
            <div className="flex overflow-hidden rounded-lg border border-gray-300 text-sm">
              {[7, 14, 30].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriode(p)}
                  className={`px-3 py-1.5 ${
                    periode === p ? "bg-gray-800 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p} j
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historique}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="jour" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                {Object.keys(STATUTS).map((cle) => (
                  <Bar key={cle} dataKey={cle} name={STATUTS[cle]} stackId="a" fill={COULEURS[cle]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-semibold">Répartition du jour</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={repartition} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                  {repartition.map((e) => (
                    <Cell key={e.cle} fill={COULEURS[e.cle]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Tableau + congés */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">
              Pointages du jour
              <span className="ml-2 text-sm font-normal text-gray-500">({lignes.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher…"
                  className="w-52 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-500"
                />
              </div>
              <button
                onClick={exporterCSV}
                className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-700"
              >
                <Download size={16} />
                Exporter
              </button>
            </div>
          </div>

          {filtreStatut && (
            <button
              onClick={() => setFiltreStatut(null)}
              className="mb-3 inline-flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-700"
            >
              Filtre : {STATUTS[filtreStatut]} <X size={12} />
            </button>
          )}

          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white text-left text-gray-500">
                <tr className="border-b border-gray-200">
                  {[
                    ["nom", "Employé"],
                    ["departement", "Département"],
                    ["heure", "Arrivée"],
                    ["statut", "Statut"],
                  ].map(([cle, titre]) => (
                    <th key={cle} className="py-2 pr-4 font-medium">
                      <button onClick={() => changerTri(cle)} className="flex items-center gap-1 hover:text-gray-800">
                        {titre}
                        <ArrowUpDown size={13} className={tri.cle === cle ? "text-gray-800" : "text-gray-300"} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lignes.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="py-2.5 pr-4 font-medium">{p.nom}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{p.departement}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{p.heure}</td>
                    <td className="py-2.5">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${BADGES[p.statut]}`}>
                        {STATUTS[p.statut]}
                      </span>
                    </td>
                  </tr>
                ))}
                {lignes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      Aucun résultat
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-semibold">
            Demandes de congé
            <span className="ml-2 rounded-full bg-gray-800 px-2 py-0.5 text-xs font-normal text-white">
              {enAttente}
            </span>
          </h2>
          <ul className="space-y-3">
            {conges
              .filter((c) => departement === "Tous" || c.departement === departement)
              .map((c) => (
                <li key={c.id} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{c.nom}</p>
                      <p className="text-xs text-gray-500">
                        {c.departement} · du {c.du} au {c.au}
                      </p>
                    </div>
                    {c.etat === "attente" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => decider(c.id, "approuve")}
                          title="Approuver"
                          className="rounded-lg border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-800 hover:text-white"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => decider(c.id, "refuse")}
                          title="Refuser"
                          className="rounded-lg border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-200"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                        {c.etat === "approuve" ? "Approuvé" : "Refusé"}
                      </span>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </div>
  );
}