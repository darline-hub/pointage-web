import { useEffect, useMemo, useRef, useState } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, getPaginationRowModel, flexRender,
} from "@tanstack/react-table";
import {
  Plus, Search, Pencil, Trash2, ArrowUpDown, X, Fingerprint,
  ChevronLeft, ChevronRight, Check, RotateCcw,
} from "lucide-react";

/* ---------- Données simulées (à remplacer par des appels API) ---------- */
const DEPARTEMENTS = ["RH", "Informatique", "Comptabilité", "Production"];

const DONNEES_INITIALES = [
  { id: 1, nom: "Dupont", prenom: "Jean", departement: "RH", poste: "Responsable RH", empreintes: 3 },
  { id: 2, nom: "Ngo", prenom: "Marie", departement: "Informatique", poste: "Développeuse", empreintes: 3 },
  { id: 3, nom: "Essomba", prenom: "Paul", departement: "Comptabilité", poste: "Comptable", empreintes: 3 },
  { id: 4, nom: "Tchoua", prenom: "Sandra", departement: "Production", poste: "Opératrice", empreintes: 2 },
  { id: 5, nom: "Mbarga", prenom: "Alain", departement: "Informatique", poste: "Administrateur réseau", empreintes: 3 },
  { id: 6, nom: "Fotso", prenom: "Carine", departement: "RH", poste: "Assistante RH", empreintes: 3 },
  { id: 7, nom: "Kamga", prenom: "Brice", departement: "Production", poste: "Chef d'équipe", empreintes: 3 },
  { id: 8, nom: "Mvondo", prenom: "Nadine", departement: "Comptabilité", poste: "Aide-comptable", empreintes: 0 },
  { id: 9, nom: "Nkeng", prenom: "Hervé", departement: "Production", poste: "Technicien", empreintes: 3 },
  { id: 10, nom: "Biyong", prenom: "Liliane", departement: "Informatique", poste: "Testeuse", empreintes: 1 },
  { id: 11, nom: "Atangana", prenom: "Patrick", departement: "Comptabilité", poste: "Directeur financier", empreintes: 3 },
  { id: 12, nom: "Ewane", prenom: "Josiane", departement: "RH", poste: "Chargée de recrutement", empreintes: 3 },
];

const NB_CAPTURES = 3;

function statutEmpreinte(n) {
  if (n >= NB_CAPTURES) return { texte: "Enrôlé", style: "bg-gray-800 text-white" };
  if (n > 0) return { texte: "Incomplet", style: "bg-gray-300 text-gray-800" };
  return { texte: "Non enrôlé", style: "border border-gray-400 text-gray-600" };
}

/* ---------- Formulaire (modale) avec enrôlement biométrique ---------- */
function FormulaireEmploye({ employe, onSauver, onFermer }) {
  const edition = Boolean(employe);
  const [champs, setChamps] = useState({
    nom: employe?.nom ?? "",
    prenom: employe?.prenom ?? "",
    departement: employe?.departement ?? DEPARTEMENTS[0],
    poste: employe?.poste ?? "",
  });
  const [captures, setCaptures] = useState(employe?.empreintes ?? 0);
  const [scan, setScan] = useState(false);
  const [erreurs, setErreurs] = useState({});
  const minuteur = useRef(null);

  // Nettoyage du minuteur si la modale est fermée pendant un scan
  useEffect(() => () => clearTimeout(minuteur.current), []);

  const modifier = (cle, valeur) => setChamps((c) => ({ ...c, [cle]: valeur }));

  const capturer = () => {
    if (scan || captures >= NB_CAPTURES) return;
    setScan(true);
    minuteur.current = setTimeout(() => {
      setCaptures((c) => c + 1);
      setScan(false);
    }, 1500);
  };

  const recommencer = () => {
    clearTimeout(minuteur.current);
    setScan(false);
    setCaptures(0);
  };

  const valider = (e) => {
    e.preventDefault();
    const err = {};
    if (!champs.nom.trim()) err.nom = "Le nom est obligatoire";
    if (!champs.prenom.trim()) err.prenom = "Le prénom est obligatoire";
    if (!champs.poste.trim()) err.poste = "Le poste est obligatoire";
    setErreurs(err);
    if (Object.keys(err).length) return;
    onSauver({
      ...champs,
      nom: champs.nom.trim(),
      prenom: champs.prenom.trim(),
      poste: champs.poste.trim(),
      empreintes: captures,
    });
  };

  const classeChamp = (cle) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-600 ${
      erreurs[cle] ? "border-gray-800" : "border-gray-300"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
      <form
        onSubmit={valider}
        className="max-h-[92vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {edition ? "Modifier l'employé" : "Nouvel employé"}
          </h2>
          <button type="button" onClick={onFermer} className="rounded p-1 text-gray-500 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Nom</label>
            <input value={champs.nom} onChange={(e) => modifier("nom", e.target.value)} className={classeChamp("nom")} />
            {erreurs.nom && <p className="mt-1 text-xs text-gray-800">{erreurs.nom}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Prénom</label>
            <input value={champs.prenom} onChange={(e) => modifier("prenom", e.target.value)} className={classeChamp("prenom")} />
            {erreurs.prenom && <p className="mt-1 text-xs text-gray-800">{erreurs.prenom}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Département</label>
            <select
              value={champs.departement}
              onChange={(e) => modifier("departement", e.target.value)}
              className={classeChamp("departement")}
            >
              {DEPARTEMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Poste</label>
            <input value={champs.poste} onChange={(e) => modifier("poste", e.target.value)} className={classeChamp("poste")} />
            {erreurs.poste && <p className="mt-1 text-xs text-gray-800">{erreurs.poste}</p>}
          </div>
        </div>

        {/* Enrôlement biométrique simulé */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Enrôlement de l'empreinte</h3>
            <span className="text-xs text-gray-500">{captures} / {NB_CAPTURES} captures</span>
          </div>

          <div className="mb-4 flex justify-center gap-4">
            {Array.from({ length: NB_CAPTURES }, (_, i) => {
              const faite = i < captures;
              const enCours = scan && i === captures;
              return (
                <div
                  key={i}
                  className={`relative flex h-20 w-20 items-center justify-center rounded-full border-2 transition ${
                    faite
                      ? "border-gray-800 bg-gray-800 text-white"
                      : enCours
                      ? "animate-pulse border-gray-500 bg-gray-200 text-gray-700"
                      : "border-dashed border-gray-300 bg-white text-gray-300"
                  }`}
                >
                  {faite ? <Check size={30} /> : <Fingerprint size={34} />}
                  <span className="absolute -bottom-5 text-xs text-gray-500">Capture {i + 1}</span>
                </div>
              );
            })}
          </div>

          <p className="mt-8 mb-3 text-center text-sm text-gray-600">
            {captures >= NB_CAPTURES
              ? "Enrôlement terminé : les 3 captures sont validées."
              : scan
              ? "Lecture en cours… ne bougez pas le doigt."
              : "Posez le doigt sur le lecteur puis lancez la capture."}
          </p>

          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={capturer}
              disabled={scan || captures >= NB_CAPTURES}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Fingerprint size={16} />
              {captures === 0 ? "Lancer la capture" : "Capture suivante"}
            </button>
            <button
              type="button"
              onClick={recommencer}
              disabled={captures === 0 && !scan}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-40"
            >
              <RotateCcw size={16} />
              Recommencer
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onFermer} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
            Annuler
          </button>
          <button type="submit" className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700">
            {edition ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Page ---------- */
export default function Employes() {
  const [donnees, setDonnees] = useState(DONNEES_INITIALES);
  const [recherche, setRecherche] = useState("");
  const [filtreDept, setFiltreDept] = useState("Tous");
  const [tri, setTri] = useState([]);
  const [modale, setModale] = useState(null); // null | { employe }
  const [aSupprimer, setASupprimer] = useState(null);

  const donneesFiltrees = useMemo(
    () => donnees.filter((e) => filtreDept === "Tous" || e.departement === filtreDept),
    [donnees, filtreDept]
  );

  const colonnes = useMemo(
    () => [
      { accessorKey: "nom", header: "Nom", cell: (i) => <span className="font-medium">{i.getValue()}</span> },
      { accessorKey: "prenom", header: "Prénom" },
      { accessorKey: "departement", header: "Département" },
      { accessorKey: "poste", header: "Poste" },
      {
        accessorKey: "empreintes",
        header: "Empreinte",
        cell: (i) => {
          const s = statutEmpreinte(i.getValue());
          return (
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${s.style}`}>
              <Fingerprint size={12} />
              {s.texte}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: (i) => (
          <div className="flex justify-end gap-1">
            <button
              title="Modifier"
              onClick={() => setModale({ employe: i.row.original })}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            >
              <Pencil size={16} />
            </button>
            <button
              title="Supprimer"
              onClick={() => setASupprimer(i.row.original)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: donneesFiltrees,
    columns: colonnes,
    state: { sorting: tri, globalFilter: recherche },
    onSortingChange: setTri,
    onGlobalFilterChange: setRecherche,
    globalFilterFn: (row, _id, valeur) => {
      const q = String(valeur).trim().toLowerCase();
      if (!q) return true;
      const { nom, prenom, departement, poste } = row.original;
      return [nom, prenom, departement, poste].some((v) => v.toLowerCase().includes(q));
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  const sauver = (valeurs) => {
    if (modale?.employe) {
      setDonnees((l) => l.map((e) => (e.id === modale.employe.id ? { ...e, ...valeurs } : e)));
    } else {
      const id = Math.max(0, ...donnees.map((e) => e.id)) + 1;
      setDonnees((l) => [{ id, ...valeurs }, ...l]);
    }
    setModale(null);
  };

  const supprimer = () => {
    setDonnees((l) => l.filter((e) => e.id !== aSupprimer.id));
    setASupprimer(null);
  };

  const nbEnroles = donnees.filter((e) => e.empreintes >= NB_CAPTURES).length;
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalLignes = table.getFilteredRowModel().rows.length;
  const debut = totalLignes ? pageIndex * pageSize + 1 : 0;
  const fin = Math.min((pageIndex + 1) * pageSize, totalLignes);

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-800">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Employés</h1>
          <p className="text-sm text-gray-500">
            {donnees.length} employés · {nbEnroles} avec empreinte enrôlée
          </p>
        </div>
        <button
          onClick={() => setModale({ employe: null })}
          className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          <Plus size={16} />
          Ajouter un employé
        </button>
      </header>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        {/* Barre d'outils */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un employé…"
              className="w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-500"
            />
          </div>
          <select
            value={filtreDept}
            onChange={(e) => { setFiltreDept(e.target.value); table.setPageIndex(0); }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
          >
            <option value="Tous">Tous les départements</option>
            {DEPARTEMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              {table.getHeaderGroups().map((groupe) => (
                <tr key={groupe.id} className="border-b border-gray-200">
                  {groupe.headers.map((h) => (
                    <th key={h.id} className="py-2 pr-4 font-medium">
                      {h.column.getCanSort() ? (
                        <button
                          onClick={h.column.getToggleSortingHandler()}
                          className="flex items-center gap-1 hover:text-gray-800"
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          <ArrowUpDown size={13} className={h.column.getIsSorted() ? "text-gray-800" : "text-gray-300"} />
                        </button>
                      ) : (
                        flexRender(h.column.columnDef.header, h.getContext())
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((ligne) => (
                <tr key={ligne.id} className="border-b border-gray-100 hover:bg-gray-50">
                  {ligne.getVisibleCells().map((cellule) => (
                    <td key={cellule.id} className="py-3 pr-4">
                      {flexRender(cellule.column.columnDef.cell, cellule.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={colonnes.length} className="py-10 text-center text-gray-400">
                    Aucun employé trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>Lignes par page</span>
            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1"
            >
              {[5, 8, 10, 20].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span>{debut}–{fin} sur {totalLignes}</span>
            <div className="flex gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded-lg border border-gray-300 p-1.5 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="rounded-lg border border-gray-300 p-1.5 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modale d'ajout / modification */}
      {modale && (
        <FormulaireEmploye
          key={modale.employe?.id ?? "nouveau"}
          employe={modale.employe}
          onSauver={sauver}
          onFermer={() => setModale(null)}
        />
      )}

      {/* Confirmation de suppression */}
      {aSupprimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold">Supprimer cet employé ?</h2>
            <p className="mb-5 text-sm text-gray-600">
              {aSupprimer.prenom} {aSupprimer.nom} et son empreinte seront supprimés. Cette action est définitive.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setASupprimer(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={supprimer} className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}