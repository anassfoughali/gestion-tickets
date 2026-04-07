import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import useTickets from "../hooks/useTickets";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { FiCheckCircle, FiAlertCircle, FiList, FiClock, FiChevronLeft, FiChevronRight,FiLock, } from "react-icons/fi";
import { statusBadge, priorityBadge, isCloture, isResolu, isEnCours, isOuvert } from "../utils/statusHelpers";


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
    resolus: tickets.filter((t) => isResolu(t.status)).length,
    clotures: tickets.filter((t) => isCloture(t.status)).length,
    ouverts: tickets.filter((t) => isOuvert(t.status)).length,
    enCours: tickets.filter((t) => isEnCours(t.status)).length,
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === "resolu") return isResolu(t.status);
    if (filter === "cloture") return isCloture(t.status);
    if (filter === "ouvert") return isOuvert(t.status);
    if (filter === "encours") return isEnCours(t.status);
    return true;
  });

  
  const totalPages = Math.ceil(filteredTickets.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentRows = filteredTickets.slice(startIndex, endIndex);

  
  const handleFilter = (f) => {
    setFilter(f);
    setCurrentPage(1);
  };

  
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end  = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const chartData = parJour.map((d) => {
    console.log("📊 parJour item:", JSON.stringify((d)));
    return {
      date: d.date || d.jour || "N/A",
      resolus: d.resolved || d.resolus || 0,
      clotures: d.clotures || 0,
      ouverts: d.open || d.ouverts || 0,
    };
  });
  

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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 text-white bg-indigo-500 rounded-xl"><FiList size={20} /></div>
              <div><p className="text-xs font-medium text-gray-500 uppercase">Total</p><p className="text-2xl font-bold text-gray-800">{stats.total}</p></div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 text-white bg-green-500 rounded-xl"><FiCheckCircle size={20} /></div>
              <div><p className="text-xs font-medium text-gray-500 uppercase">Résolus</p><p className="text-2xl font-bold text-gray-800">{stats.resolus}</p></div>
            </div>
           
            <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 text-white bg-blue-500 rounded-xl"><FiLock size={20} /></div>
              <div><p className="text-xs font-medium text-gray-500 uppercase">Clôturés</p><p className="text-2xl font-bold text-gray-800">{stats.clotures}</p></div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 text-white bg-red-500 rounded-xl"><FiAlertCircle size={20} /></div>
              <div><p className="text-xs font-medium text-gray-500 uppercase">Ouverts</p><p className="text-2xl font-bold text-gray-800">{stats.ouverts}</p></div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 text-white bg-yellow-500 rounded-xl"><FiClock size={20} /></div>
              <div><p className="text-xs font-medium text-gray-500 uppercase">En Cours</p><p className="text-2xl font-bold text-gray-800">{stats.enCours}</p></div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-gray-800">Tickets par Jour</h3>
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
                   <Bar dataKey="resolus"  name="Résolus"  fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="clotures" name="Clôturés" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="ouverts"  name="Ouverts"  fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="enCours" name="En Cours" fill="#fbbf24" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-sm text-gray-400">Aucune donnée</div>
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
              {/*  Filtres  */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "tous", label: "Tous" },
                  { key: "resolu", label: "🟢 Résolus" },
                  { key: "cloture",label: "🔵 Clôturés" },
                  { key: "ouvert", label: "🔴 Ouverts" },
                  { key: "encours",label: "🟡 En Cours" },
                ].map((f) => (
                  <button key={f.key} onClick={() => handleFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      filter === f.key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

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
                    <tr><td colSpan={10} className="py-8 text-sm text-center text-gray-400">Aucun ticket trouvé</td></tr>
                  ) : (
                    currentRows.map((t, idx) => (
                      <tr key={t.issueID || idx} className="transition hover:bg-gray-50">
                        <td className="py-3 font-mono text-xs font-semibold text-indigo-600">{t.issueID}</td>
                        <td className="py-3 text-gray-700"><p className="truncate max-w-[180px]">{t.briefDescription}</p></td>
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
                        <td className="py-3 text-xs font-medium text-gray-600">{t.duree != null ? `${t.duree}h` : "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Affichage <span className="font-semibold text-gray-600">{startIndex + 1}</span>
                  {" – "}<span className="font-semibold text-gray-600">{Math.min(startIndex + ROWS_PER_PAGE, filteredTickets.length)}</span>
                  {" sur "}<span className="font-semibold text-gray-600">{filteredTickets.length}</span>
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="flex items-center justify-center w-8 h-8 text-gray-500 transition rounded-lg hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30">
                    <FiChevronLeft size={16} />
                  </button>
                  {getPageNumbers().map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                        currentPage === page ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:bg-indigo-50"
                      }`}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-8 h-8 text-gray-500 transition rounded-lg hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30">
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