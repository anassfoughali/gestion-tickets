import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { techniciansList, technicianDailyData, mockTickets } from "../data/mockData";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { FiSearch, FiUser } from "react-icons/fi";

const PIE_COLORS = ["#6366f1", "#f59e0b", "#ef4444"];

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

const Techniciens = () => {
  const [selectedTech, setSelectedTech] = useState(techniciansList[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredList = techniciansList.filter((t) =>
    t.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const techTickets = mockTickets.filter((t) => t.Technicien === selectedTech);
  const resolved = techTickets.filter((t) => t.Status === "Résolu").length;
  const open = techTickets.filter((t) => t.Status === "Ouvert").length;
  const inProgress = techTickets.filter((t) => t.Status === "En cours").length;

  const pieData = [
    { name: "Résolus", value: resolved },
    { name: "Ouverts", value: open },
    { name: "En Cours", value: inProgress },
  ].filter((d) => d.value > 0);

  const lineData = technicianDailyData[selectedTech] || [];

  const avgTime =
    lineData.length > 0 && lineData.some((d) => d.resolutionTime > 0)
      ? (lineData.filter((d) => d.resolutionTime > 0).reduce((acc, d) => acc + d.resolutionTime, 0) /
          lineData.filter((d) => d.resolutionTime > 0).length).toFixed(1)
      : "—";

  const handleSelect = (tech) => {
    setSelectedTech(tech);
    setSearchQuery(tech);
    setShowDropdown(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">

          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-gray-800">Performance des Techniciens</h1>
            <p className="text-sm text-gray-500">Analyse individuelle par technicien</p>
          </div>

          {/* Technician Selector */}
          <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
            <p className="mb-3 text-sm font-medium text-gray-700">Sélectionner un technicien</p>
            <div className="relative max-w-sm">
              <FiSearch className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="Rechercher un technicien..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
              />
              {showDropdown && filteredList.length > 0 && (
                <div className="absolute z-10 w-full mt-1 overflow-hidden bg-white border border-gray-100 shadow-xl top-full rounded-xl">
                  {filteredList.map((tech) => (
                    <button
                      key={tech}
                      onMouseDown={() => handleSelect(tech)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-indigo-50 transition text-left
                        ${selectedTech === tech ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-700"}`}
                    >
                      <div className="flex items-center justify-center flex-shrink-0 bg-indigo-100 rounded-full h-7 w-7">
                        <FiUser size={13} className="text-indigo-600" />
                      </div>
                      {tech}
                      {selectedTech === tech && (
                        <span className="ml-auto text-xs text-indigo-500">✓ Sélectionné</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick select buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              {techniciansList.map((tech) => (
                <button
                  key={tech}
                  onClick={() => { setSelectedTech(tech); setSearchQuery(tech); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    selectedTech === tech
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Technician Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border border-indigo-100 bg-indigo-50 rounded-xl">
              <p className="text-xs font-medium text-indigo-600 uppercase">Tickets Résolus</p>
              <p className="mt-1 text-3xl font-bold text-indigo-700">{resolved}</p>
            </div>
            <div className="p-4 border border-red-100 bg-red-50 rounded-xl">
              <p className="text-xs font-medium text-red-600 uppercase">Tickets Ouverts</p>
              <p className="mt-1 text-3xl font-bold text-red-700">{open + inProgress}</p>
            </div>
            <div className="p-4 border border-green-100 bg-green-50 rounded-xl">
              <p className="text-xs font-medium text-green-600 uppercase">Temps Moyen Résolution</p>
              <p className="mt-1 text-3xl font-bold text-green-700">{avgTime}h</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Pie Chart - Ticket Distribution */}
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <h3 className="mb-1 text-base font-semibold text-gray-800">
                Répartition des Tickets — {selectedTech}
              </h3>
              <p className="mb-4 text-xs text-gray-400">Distribution par statut</p>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      labelLine={false}
                      label={renderCustomLabel}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} ticket(s)`, name]} />
                    <Legend
                      wrapperStyle={{ fontSize: 13 }}
                      formatter={(value, entry) => (
                        <span style={{ color: "#374151" }}>
                          {value}: <strong>{entry.payload.value}</strong>
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-sm text-gray-400">
                  Aucun ticket pour ce technicien
                </div>
              )}
            </div>

            {/* Line Chart - Resolution Time per day */}
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <h3 className="mb-1 text-base font-semibold text-gray-800">
                Temps de Résolution par Jour — {selectedTech}
              </h3>
              <p className="mb-4 text-xs text-gray-400">En heures, évolution quotidienne</p>
              {lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={lineData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} unit="h" axisLine={false} tickLine={false} />
                    <Tooltip formatter={(val) => [`${val}h`, "Temps de résolution"]} />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                    <Line
                      type="monotone"
                      dataKey="resolutionTime"
                      name="Temps (h)"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: "#6366f1" }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-sm text-gray-400">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </div>

          {/* Tickets list for selected technician */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h3 className="mb-4 text-base font-semibold text-gray-800">
              Tickets de {selectedTech}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                    <th className="pb-3 font-medium text-left">N° Ticket</th>
                    <th className="pb-3 font-medium text-left">Objet</th>
                    <th className="pb-3 font-medium text-left">Client</th>
                    <th className="pb-3 font-medium text-left">Statut</th>
                    <th className="pb-3 font-medium text-left">Date Création</th>
                    <th className="pb-3 font-medium text-left">Date Clôture</th>
                    <th className="pb-3 font-medium text-left">Durée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {techTickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-sm text-center text-gray-400">
                        Aucun ticket trouvé
                      </td>
                    </tr>
                  ) : (
                    techTickets.map((t) => (
                      <tr key={t.IssueID} className="transition hover:bg-gray-50">
                        <td className="py-3 font-mono text-xs font-semibold text-indigo-600">{t.IssueID}</td>
                        <td className="max-w-xs py-3 text-gray-700">
                          <p className="truncate max-w-[200px]">{t.BriefDescription}</p>
                        </td>
                        <td className="py-3 text-xs text-gray-500">{t.CardName}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            t.Status === "Résolu" ? "bg-green-100 text-green-700" :
                            t.Status === "En cours" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {t.Status}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-400">{t.RequestDate}</td>
                        <td className="py-3 text-xs text-gray-400">{t.USER_DateCloture || "—"}</td>
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

export default Techniciens;