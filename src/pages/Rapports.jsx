import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { rapportsService } from "../services/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  FiDownload, FiFilter, FiFileText,
  FiChevronLeft, FiChevronRight, FiRefreshCw,
} from "react-icons/fi";
import { statusBadge, priorityBadge, isCloture, isResolu, isEnCours, isOuvert } from "../utils/statusHelpers";

const ROWS_PER_PAGE = 15;

const Rapports = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");
  const [filterTech, setFilterTech] = useState("tous");

  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    rapportsService.getAll()
      .then((res) => { setTickets(res.data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterStatus, filterTech]);

  const techList = useMemo(
    () => [...new Set(tickets.map((t) => t.technicien).filter(Boolean))].sort(),
    [tickets]
  );

  //  Filtre 
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus =
        filterStatus === "tous" ||
        (filterStatus === "resolu" && isResolu(t.status)) ||
        (filterStatus === "cloture" && isCloture(t.status)) || 
        (filterStatus === "encours" && isEnCours(t.status));

      const matchTech = filterTech === "tous" || t.technicien === filterTech;

      const q = searchQuery.toLowerCase();
      const matchSearch =
        q === "" ||
        (t.issueID || "").toLowerCase().includes(q) ||
        (t.briefDescription || "").toLowerCase().includes(q) ||
        (t.cardName || "").toLowerCase().includes(q) ||
        (t.technicien || "").toLowerCase().includes(q);

      return matchStatus && matchTech && matchSearch;
    });
  }, [tickets, filterStatus, filterTech, searchQuery]);

  const kpis = useMemo(() => ({
    total: filteredTickets.length,
    resolus: filteredTickets.filter((t) => isResolu(t.status)).length,
    clotures: filteredTickets.filter((t) => isCloture(t.status)).length, 
    ouverts: filteredTickets.filter((t) => isOuvert(t.status)).length,
    enCours: filteredTickets.filter((t) => isEnCours(t.status)).length,
  }), [filteredTickets]);

  const totalPages = Math.ceil(filteredTickets.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const currentRows = filteredTickets.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const exportToExcel = () => {
    const data = filteredTickets.map((t) => ({
      "N° Ticket":t.issueID || "",
      "Objet": t.briefDescription || "",
      "Client": t.cardName || "",
      "Technicien": t.technicien|| "",
      "Type":  t.issueType  || "",
      "Statut":  t.status|| "",
      "Priorité":  t.priority|| "",
      "Projet": t.nomProjet|| "",
      "SLA": t.sla || "",
      "Produit":t.productName || "",
      "Date Création":  t.requestDate  || "",
      "Date Clôture":   t.dateCloture || "",
      "Durée Résolution (h)": t.duree != null ? t.duree : "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [
      { wch: 12 }, { wch: 35 }, { wch: 22 }, { wch: 22 },
      { wch: 14 }, { wch: 18 }, { wch: 12 }, { wch: 22 },
      { wch: 15 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 22 },
    ];

    const avgDuree = (() => {
      const withDuree = filteredTickets.filter((t) => t.duree != null);
      if (!withDuree.length) return "N/A";
      const avg = withDuree.reduce((acc, t) => acc + t.duree, 0) / withDuree.length;
      return avg.toFixed(1) + "h";
    })();

    const summary = [
      { "Indicateur": "Total Tickets",  "Valeur": kpis.total    },
      { "Indicateur": "Tickets Résolus", "Valeur": kpis.resolus  },
      { "Indicateur": "Tickets Clôturés", "Valeur": kpis.clotures }, 
      { "Indicateur": "Tickets Ouverts",  "Valeur": kpis.ouverts  },
      { "Indicateur": "Tickets En Cours",  "Valeur": kpis.enCours  },
      { "Indicateur": "Temps Moyen Résolution (h)", "Valeur": avgDuree  },
    ];

    const wsSummary = XLSX.utils.json_to_sheet(summary);
    wsSummary["!cols"] = [{ wch: 32 }, { wch: 15 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rapport Tickets");
    XLSX.utils.book_append_sheet(wb, wsSummary, "Résumé");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const today = new Date().toISOString().slice(0, 10);
    saveAs(blob, `rapport_tickets_${today}.xlsx`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Rapports</h1>
              <p className="text-sm text-gray-500">Génération et export des rapports — données SAP HANA</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition shadow-sm">
                <FiRefreshCw size={15} /> Actualiser
              </button>
              <button onClick={exportToExcel} disabled={filteredTickets.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition shadow-sm">
                <FiDownload size={16} /> Télécharger Excel
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center h-40 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                <p className="mt-3 text-sm text-gray-400">Chargement des tickets...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-xl">
              <p className="text-sm text-red-600">❌ Erreur : {error}</p>
              <button onClick={fetchData} className="text-xs text-red-500 underline hover:text-red-700">Réessayer</button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/*  KPI Cards  */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {[
                  { label: "Total filtrés", value: kpis.total, color: "bg-indigo-500" },
                  { label: "Résolus", value: kpis.resolus, color: "bg-green-500"  },
                  { label: "Clôturés", value: kpis.clotures, color: "bg-blue-500"  },
                  { label: "Ouverts",value: kpis.ouverts, color: "bg-red-500" },
                  { label: "En Cours", value: kpis.enCours, color: "bg-yellow-500" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
                    <div className={`${s.color} h-10 w-10 rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                      <FiFileText size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">{s.label}</p>
                      <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <FiFilter size={16} className="text-gray-500" />
                  <p className="text-sm font-semibold text-gray-700">Filtres</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 Rechercher (ticket, objet, client, technicien...)"
                    className="flex-1 min-w-[240px] px-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
                  />
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 text-sm text-gray-700 transition bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white">
                    <option value="tous">Tous les statuts</option>
                    <option value="resolu">🟢 Résolus</option>
                    <option value="cloture">🔵 Clôturés</option>
                    <option value="ouvert">🔴 Ouverts</option>
                    <option value="encours">🟡 En Cours</option>
                  </select>
                  <select value={filterTech} onChange={(e) => setFilterTech(e.target.value)}
                    className="px-4 py-2 text-sm text-gray-700 transition bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white">
                    <option value="tous">Tous les techniciens</option>
                    {techList.map((tech) => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => { setFilterStatus("tous"); setFilterTech("tous"); setSearchQuery(""); }}
                    className="px-4 py-2 text-sm text-gray-600 transition bg-gray-200 rounded-lg hover:bg-gray-300">
                    Réinitialiser
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-800">
                    Rapport des Tickets
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      ({filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""})
                    </span>
                  </h3>
                  <button onClick={exportToExcel} disabled={filteredTickets.length === 0}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-green-600 transition border border-green-500 rounded-lg hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    <FiDownload size={14} /> Export Excel
                  </button>
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
                        <th className="pb-3 font-medium text-left">Produit</th>
                        <th className="pb-3 font-medium text-left">Date Création</th>
                        <th className="pb-3 font-medium text-left">Date Clôture</th>
                        <th className="pb-3 font-medium text-left">Durée (h)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {currentRows.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-10 text-sm text-center text-gray-400">
                            Aucun ticket ne correspond aux filtres sélectionnés
                          </td>
                        </tr>
                      ) : (
                        currentRows.map((t, idx) => (
                          <tr key={t.issueID || idx} className="transition hover:bg-gray-50">
                            <td className="py-3 font-mono text-xs font-semibold text-indigo-600">{t.issueID}</td>
                            <td className="py-3 text-gray-700">
                              <p className="truncate max-w-[160px]" title={t.briefDescription}>{t.briefDescription}</p>
                            </td>
                            <td className="py-3 text-xs text-gray-500">{t.cardName || "—"}</td>
                            <td className="py-3 text-xs text-gray-500 whitespace-nowrap">{t.technicien || "—"}</td>
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
                            <td className="py-3 text-xs text-gray-500">{t.productName || "—"}</td>
                            <td className="py-3 text-xs text-gray-400 whitespace-nowrap">{t.requestDate || "—"}</td>
                            <td className="py-3 text-xs text-gray-400 whitespace-nowrap">{t.dateCloture || "—"}</td>
                            <td className="py-3 text-xs font-medium text-gray-600">
                              {t.duree != null ? `${t.duree}h` : "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Affichage{" "}
                      <span className="font-semibold text-gray-600">{startIndex + 1}</span>
                      {" – "}
                      <span className="font-semibold text-gray-600">{Math.min(startIndex + ROWS_PER_PAGE, filteredTickets.length)}</span>
                      {" sur "}
                      <span className="font-semibold text-gray-600">{filteredTickets.length}</span>
                    </p>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                        className="flex items-center justify-center w-8 h-8 text-gray-500 transition rounded-lg hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed">
                        <FiChevronLeft size={16} />
                      </button>
                      {getPageNumbers().map((page) => (
                        <button key={page} onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                            currentPage === page ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                          }`}>
                          {page}
                        </button>
                      ))}
                      <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                        className="flex items-center justify-center w-8 h-8 text-gray-500 transition rounded-lg hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed">
                        <FiChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
};

export default Rapports;