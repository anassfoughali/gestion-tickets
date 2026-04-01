import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import useTickets from "../hooks/useTickets";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { FiCheckCircle, FiAlertCircle, FiList, FiClock, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const statusBadge = (status) => {
  if (!status) return "bg-gray-100 text-gray-600";
  const s = status.toLowerCase().trim();
  if (s.includes("clot") || s.includes("ferm") || s.includes("sans solution")) return "bg-green-100 text-green-700";
  if (s.includes("cours") || s.includes("affect")) return "bg-yellow-100 text-yellow-700";
  if (s.includes("ouvert") || s.includes("nouveau")) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
};

const priorityBadge = (p) => {
  if (!p) return "bg-gray-50 text-gray-500";
  const pr = p.toLowerCase().trim();
  if (pr === "critique") return "bg-red-100 text-red-700 border border-red-200";
  if (pr === "majeur")   return "bg-orange-100 text-orange-700 border border-orange-200";
  if (pr === "mineur")   return "bg-green-100 text-green-700 border border-green-200";
  return "bg-gray-50 text-gray-500";
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 text-sm bg-white border border-gray-200 shadow-lg rounded-xl">
        <p className="mb-2 font-semibold text-gray-700">📅 {label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.fill }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ROWS_PER_PAGE = 10;

const Tickets = () => {
  const { tickets, parJour, loading, error } = useTickets();
  const [filter, setFilter]     = useState("tous");
  const [currentPage, setCurrentPage] = useState(1);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        <p className="text-gray-500">Chargement des tickets...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-6 text-center bg-white shadow rounded-xl">
        <p className="font-semibold text-red-500">❌ Erreur</p>
        <p className="mt-1 text-sm text-gray-400">{error}</p>
      </div>
    </div>
  );

  const stats = {
    total:      tickets.length,
    resolved:   tickets.filter((t) => { const s = (t.status || "").toLowerCase(); return s.includes("clot") || s.includes("ferm") || s.includes("sans solution"); }).length,
    open:       tickets.filter((t) => { const s = (t.status || "").toLowerCase(); return s.includes("ouvert") || s.includes("nouveau"); }).length,
    inProgress: tickets.filter((t) => { const s = (t.status || "").toLowerCase(); return s.includes("cours") || s.includes("affect"); }).length,
  };

  const filteredTickets = tickets.filter((t) => {
    const s = (t.status || "").toLowerCase();
    if (filter === "resolu")    return s.includes("clot") || s.includes("ferm") || s.includes("sans solution");
    if (filter === "ouvert")    return s.includes("ouvert") || s.includes("nouveau");
    if (filter === "en cours")  return s.includes("cours") || s.includes("affect");
    return true;
  });

  //  Pagination
  const totalPages   = Math.ceil(filteredTickets.length / ROWS_PER_PAGE);
  const startIndex   = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex     = startIndex + ROWS_PER_PAGE;
  const currentRows  = filteredTickets.slice(startIndex, endIndex);

  //  Reset page quand filtre change
  const handleFilter = (f) => {
    setFilter(f);
    setCurrentPage(1);
  };

  //  Pages à afficher (max 5 boutons)
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end   = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const chartData = parJour.map((d) => ({
    date:     d.date    || d.jour    || "N/A",
    resolved: d.resolved || d.resolus || 0,
    open:     d.open    || d.ouverts  || 0,
  }));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">

          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-gray-800">Performance des Tickets</h1>
            <p className="text-sm text-gray-500">Suivi des tickets — données temps réel SAP HANA</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 text-white bg-indigo-500 rounded-xl"><FiList size={20} /></div>
              <div><p className="text-xs font-medium text-gray-500 uppercase">Total</p><p className="text-2xl font-bold text-gray-800">{stats.total}</p></div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 text-white bg-green-500 rounded-xl"><FiCheckCircle size={20} /></div>
              <div><p className="text-xs font-medium text-gray-500 uppercase">Résolus</p><p className="text-2xl font-bold text-gray-800">{stats.resolved}</p></div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 text-white bg-red-500 rounded-xl"><FiAlertCircle size={20} /></div>
              <div><p className="text-xs font-medium text-gray-500 uppercase">Ouverts</p><p className="text-2xl font-bold text-gray-800">{stats.open}</p></div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 text-white bg-yellow-500 rounded-xl"><FiClock size={20} /></div>
              <div><p className="text-xs font-medium text-gray-500 uppercase">En Cours</p><p className="text-2xl font-bold text-gray-800">{stats.inProgress}</p></div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-gray-800">Tickets Résolus vs Ouverts par Jour</h3>
              <p className="mt-1 text-xs text-gray-400">30 derniers jours</p>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 13, paddingTop: 16 }} />
                  <Bar dataKey="resolved" name="Résolus" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="open"     name="Ouverts" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-sm text-gray-400">
                Aucune donnée sur les 30 derniers jours
              </div>
            )}
          </div>

          {/* Tickets Table */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">
                Liste des Tickets
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({filteredTickets.length} ticket{filteredTickets.length > 1 ? "s" : ""})
                </span>
              </h3>
              {/* Filter Tabs */}
              <div className="flex gap-2">
                {[
                  { key: "tous",     label: "Tous" },
                  { key: "resolu",   label: "✅ Résolus" },
                  { key: "ouvert",   label: "🔴 Ouverts" },
                  { key: "en cours", label: "🟡 En Cours" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => handleFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      filter === f.key
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                    <th className="pb-3 font-medium text-left">N° Ticket</th>
                    <th className="pb-3 font-medium text-left">Objet</th>
                    <th className="pb-3 font-medium text-left">Client</th>
                    <th className="pb-3 font-medium text-left">Technicien</th>
                    <th className="pb-3 font-medium text-left">Type</th>
                    <th className="pb-3 font-medium text-left">Priorité</th>
                    <th className="pb-3 font-medium text-left">Statut</th>
                    <th className="pb-3 font-medium text-left">Date Création</th>
                    <th className="pb-3 font-medium text-left">Date Clôture</th>
                    <th className="pb-3 font-medium text-left">Durée (h)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-sm text-center text-gray-400">
                        Aucun ticket trouvé
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((t, idx) => (
                      <tr key={t.issueID || idx} className="transition hover:bg-gray-50">
                        <td className="py-3 font-mono text-xs font-semibold text-indigo-600">{t.issueID}</td>
                        <td className="max-w-xs py-3 text-gray-700">
                          <p className="truncate max-w-[180px]">{t.briefDescription}</p>
                        </td>
                        <td className="py-3 text-xs text-gray-500">{t.cardName || "—"}</td>
                        <td className="py-3 text-xs text-gray-500">{t.technicien || "—"}</td>
                        <td className="py-3 text-xs text-gray-500">{t.issueType || "—"}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge(t.priority)}`}>
                            {t.priority || "N/A"}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(t.status)}`}>
                            {t.status || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-400">{t.requestDate || "—"}</td>
                        <td className="py-3 text-xs text-gray-400">{t.dateCloture || "—"}</td>
                        <td className="py-3 text-xs font-medium text-gray-600">
                          {t.duree != null ? `${t.duree}h` : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/*  Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">

                {/* Info */}
                <p className="text-xs text-gray-400">
                  Affichage{" "}
                  <span className="font-semibold text-gray-600">{startIndex + 1}</span>
                  {" "}–{" "}
                  <span className="font-semibold text-gray-600">{Math.min(endIndex, filteredTickets.length)}</span>
                  {" "}sur{" "}
                  <span className="font-semibold text-gray-600">{filteredTickets.length}</span>
                </p>

                {/* Boutons */}
                <div className="flex items-center gap-1">

                  {/* Précédent */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-8 h-8 text-gray-500 transition rounded-lg hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft size={16} />
                  </button>

                  {/* Numéros de pages */}
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                        currentPage === page
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Suivant */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-8 h-8 text-gray-500 transition rounded-lg hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight size={16} />
                  </button>

                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default Tickets;