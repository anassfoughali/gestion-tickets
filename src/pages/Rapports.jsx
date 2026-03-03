import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { mockTickets } from "../data/mockData";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FiDownload, FiFilter, FiFileText } from "react-icons/fi";

const statusBadge = (status) => {
  const map = {
    "Résolu": "bg-green-100 text-green-700",
    "En cours": "bg-yellow-100 text-yellow-700",
    "Ouvert": "bg-red-100 text-red-700",
  };
  return map[status] || "bg-gray-100 text-gray-600";
};

const Rapports = () => {
  const [filterStatus, setFilterStatus] = useState("tous");
  const [filterTech, setFilterTech] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");

  const techList = [...new Set(mockTickets.map((t) => t.Technicien))];

  const filteredTickets = mockTickets.filter((t) => {
    const matchStatus = filterStatus === "tous" || t.Status === filterStatus;
    const matchTech = filterTech === "tous" || t.Technicien === filterTech;
    const matchSearch =
      searchQuery === "" ||
      t.IssueID.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.BriefDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.CardName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchTech && matchSearch;
  });

  const exportToExcel = () => {
    const data = filteredTickets.map((t) => ({
      "N° Ticket": t.IssueID,
      "Objet": t.BriefDescription,
      "Client": t.CardName,
      "Technicien": t.Technicien,
      "Type": t.IssueType,
      "Statut": t.Status,
      "Priorité": t.Priority,
      "Projet": t.NomProjet,
      "SLA": t.SLA,
      "Produit": t.ProductName,
      "Date Création": t.RequestDate,
      "Date Réception Email": t.USER_DateReceptionEmail,
      "Date Clôture": t.USER_DateCloture || "",
      "Heure Clôture": t.USER_HeureCloture || "",
      "Durée Résolution (h)": t.resolutionTimeHours ?? "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    // Column widths
    ws["!cols"] = [
      { wch: 10 }, { wch: 35 }, { wch: 20 }, { wch: 20 },
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 20 },
      { wch: 15 }, { wch: 20 }, { wch: 14 }, { wch: 20 },
      { wch: 14 }, { wch: 13 }, { wch: 22 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rapport Tickets");

    // Add summary sheet
    const summary = [
      { "Indicateur": "Total Tickets", "Valeur": filteredTickets.length },
      { "Indicateur": "Tickets Résolus", "Valeur": filteredTickets.filter((t) => t.Status === "Résolu").length },
      { "Indicateur": "Tickets Ouverts", "Valeur": filteredTickets.filter((t) => t.Status === "Ouvert").length },
      { "Indicateur": "Tickets En Cours", "Valeur": filteredTickets.filter((t) => t.Status === "En cours").length },
      {
        "Indicateur": "Temps Moyen Résolution (h)",
        "Valeur": (() => {
          const resolved = filteredTickets.filter((t) => t.resolutionTimeHours);
          if (resolved.length === 0) return "N/A";
          const avg = resolved.reduce((acc, t) => acc + t.resolutionTimeHours, 0) / resolved.length;
          return avg.toFixed(1) + "h";
        })(),
      },
    ];

    const wsSummary = XLSX.utils.json_to_sheet(summary);
    wsSummary["!cols"] = [{ wch: 30 }, { wch: 15 }];
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
              <p className="text-sm text-gray-500">
                Génération et export des rapports de tickets
              </p>
            </div>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700
                text-white text-sm font-semibold rounded-xl transition shadow-sm"
            >
              <FiDownload size={16} />
              Télécharger Excel
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Total filtrés", value: filteredTickets.length, color: "bg-indigo-500" },
              { label: "Résolus", value: filteredTickets.filter((t) => t.Status === "Résolu").length, color: "bg-green-500" },
              { label: "Ouverts", value: filteredTickets.filter((t) => t.Status === "Ouvert").length, color: "bg-red-500" },
              { label: "En Cours", value: filteredTickets.filter((t) => t.Status === "En cours").length, color: "bg-yellow-500" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
                <div className={`${s.color} h-10 w-10 rounded-xl flex items-center justify-center text-white`}>
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
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Rechercher (ticket, objet, client...)"
                className="flex-1 min-w-[220px] px-4 py-2 bg-gray-100 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
              />
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 text-sm text-gray-700 transition bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white"
              >
                <option value="tous">Tous les statuts</option>
                <option value="Résolu">Résolus</option>
                <option value="Ouvert">Ouverts</option>
                <option value="En cours">En Cours</option>
              </select>
              {/* Technician Filter */}
              <select
                value={filterTech}
                onChange={(e) => setFilterTech(e.target.value)}
                className="px-4 py-2 text-sm text-gray-700 transition bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white"
              >
                <option value="tous">Tous les techniciens</option>
                {techList.map((tech) => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>
              {/* Reset */}
              <button
                onClick={() => { setFilterStatus("tous"); setFilterTech("tous"); setSearchQuery(""); }}
                className="px-4 py-2 text-sm text-gray-600 transition bg-gray-200 rounded-lg hover:bg-gray-300"
              >
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
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-green-600 transition border border-green-500 rounded-lg hover:bg-green-50"
              >
                <FiDownload size={14} />
                Export Excel
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
                    <th className="pb-3 font-medium text-left">SLA</th>
                    <th className="pb-3 font-medium text-left">Produit</th>
                    <th className="pb-3 font-medium text-left">Date Création</th>
                    <th className="pb-3 font-medium text-left">Date Clôture</th>
                    <th className="pb-3 font-medium text-left">Durée (h)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-10 text-sm text-center text-gray-400">
                        Aucun ticket ne correspond aux filtres sélectionnés
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((t) => (
                      <tr key={t.IssueID} className="transition hover:bg-gray-50">
                        <td className="py-3 font-mono text-xs font-semibold text-indigo-600">{t.IssueID}</td>
                        <td className="py-3 text-gray-700">
                          <p className="truncate max-w-[160px]" title={t.BriefDescription}>{t.BriefDescription}</p>
                        </td>
                        <td className="py-3 text-xs text-gray-500">{t.CardName}</td>
                        <td className="py-3 text-xs text-gray-500 whitespace-nowrap">{t.Technicien}</td>
                        <td className="py-3 text-xs text-gray-500">{t.IssueType}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            t.Priority === "Haute" ? "bg-red-50 text-red-600 border border-red-200" :
                            t.Priority === "Moyenne" ? "bg-yellow-50 text-yellow-600 border border-yellow-200" :
                            "bg-green-50 text-green-600 border border-green-200"
                          }`}>
                            {t.Priority}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(t.Status)}`}>
                            {t.Status}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-500">{t.SLA}</td>
                        <td className="py-3 text-xs text-gray-500">{t.ProductName}</td>
                        <td className="py-3 text-xs text-gray-400 whitespace-nowrap">{t.RequestDate}</td>
                        <td className="py-3 text-xs text-gray-400 whitespace-nowrap">{t.USER_DateCloture || "—"}</td>
                        <td className="py-3 text-xs font-medium text-gray-600">
                          {t.resolutionTimeHours ? `${t.resolutionTimeHours}h` : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Rapports;