import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { dailyTicketsData, mockTickets, kpiData } from "../data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import { FiCheckCircle, FiAlertCircle, FiList, FiClock } from "react-icons/fi";

const statusBadge = (status) => {
  const map = {
    "Résolu": "bg-green-100 text-green-700",
    "En cours": "bg-yellow-100 text-yellow-700",
    "Ouvert": "bg-red-100 text-red-700",
  };
  return map[status] || "bg-gray-100 text-gray-600";
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
const Tickets = () => {
  const [filter, setFilter] = useState("tous");
  const filteredTickets = mockTickets.filter((t) => {
    if (filter === "résolu") return t.Status === "Résolu";
    if (filter === "ouvert") return t.Status === "Ouvert";
    if (filter === "en cours") return t.Status === "En cours";
    return true;
  });
  const stats = {
    total: mockTickets.length,
    resolved: mockTickets.filter((t) => t.Status === "Résolu").length,
    open: mockTickets.filter((t) => t.Status === "Ouvert").length,
    inProgress: mockTickets.filter((t) => t.Status === "En cours").length,
  };
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-gray-800">Performance des Tickets</h1>
            <p className="text-sm text-gray-500">Suivi quotidien des tickets résolus et ouverts</p>
          </div>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 text-white bg-indigo-500 rounded-xl">
                <FiList size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 text-white bg-green-500 rounded-xl">
                <FiCheckCircle size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Résolus</p>
                <p className="text-2xl font-bold text-gray-800">{stats.resolved}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 text-white bg-red-500 rounded-xl">
                <FiAlertCircle size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Ouverts</p>
                <p className="text-2xl font-bold text-gray-800">{stats.open}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 text-white bg-yellow-500 rounded-xl">
                <FiClock size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">En Cours</p>
                <p className="text-2xl font-bold text-gray-800">{stats.inProgress}</p>
              </div>
            </div>
          </div>
          {/* Bar Chart */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-gray-800">Tickets Résolus vs Ouverts par Jour</h3>
              <p className="mt-1 text-xs text-gray-400">Évolution quotidienne des tickets</p>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={dailyTicketsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 13, paddingTop: 16 }}
                  formatter={(value) => <span className="text-gray-600">{value}</span>}
                />
                <Bar dataKey="resolved" name="Résolus" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={50} />
                <Bar dataKey="open" name="Ouverts" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Tickets Table with Filter */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">Liste des Tickets</h3>
              {/* Filter Tabs */}
              <div className="flex gap-2">
                {["tous", "résolu", "ouvert", "en cours"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${
                      filter === f
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {f === "tous" ? "Tous" : f === "résolu" ? `✅ Résolus` : f === "ouvert" ? `🔴 Ouverts` : `🟡 En Cours`}
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
                  {filteredTickets.map((t) => (
                    <tr key={t.IssueID} className="transition hover:bg-gray-50">
                      <td className="py-3 font-mono text-xs font-semibold text-indigo-600">{t.IssueID}</td>
                      <td className="max-w-xs py-3 text-gray-700">
                        <p className="truncate max-w-[180px]">{t.BriefDescription}</p>
                      </td>
                      <td className="py-3 text-xs text-gray-500">{t.CardName}</td>
                      <td className="py-3 text-xs text-gray-500">{t.Technicien}</td>
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
                      <td className="py-3 text-xs text-gray-400">{t.RequestDate}</td>
                      <td className="py-3 text-xs text-gray-400">{t.USER_DateCloture || "—"}</td>
                      <td className="py-3 text-xs font-medium text-gray-600">
                        {t.resolutionTimeHours ? `${t.resolutionTimeHours}h` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default Tickets;