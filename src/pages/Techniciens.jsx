import React, { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import useTechniciens from "../hooks/useTechniciens";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { FiX, FiTrendingUp, FiCheckCircle, FiAlertCircle, FiClock } from "react-icons/fi";
import { technicienService } from "../services/api";

const PIE_COLORS = ["#10b981", "#ef4444", "#f59e0b"];

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 text-sm bg-white border border-gray-200 shadow-lg rounded-xl">
        <p className="mb-2 font-semibold text-gray-700 truncate max-w-[180px]">👤 {label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.fill }}>
            {p.name}: <span className="font-bold">{p.value}{p.name === "Temps Moyen (h)" ? "h" : ""}</span>
          </p>
        ))}
        <p className="mt-2 text-xs font-medium text-indigo-500">🖱️ Cliquez pour voir le détail</p>
      </div>
    );
  }
  return null;
};

//  Modal — reçoit { groupId, name } et appelle getStats(groupId)
const TechnicienModal = ({ tech, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!tech?.groupId) {
      setErrorMsg("ID technicien introuvable.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setDetail(null);

    technicienService.getStats(tech.groupId)
      .then((res) => {
        setDetail(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur modal technicien:", err);
        setErrorMsg(`Impossible de charger les données (${err.response?.status || err.message})`);
        setLoading(false);
      });
  }, [tech]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const pieData = detail ? [
    { name: "Résolus", value: detail.resolvedTickets },
    { name: "Ouverts", value: detail.openTickets },
    { name: "Autres",  value: Math.max(0, detail.totalTickets - detail.resolvedTickets - detail.openTickets) },
  ].filter((d) => d.value > 0) : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg mx-4 overflow-hidden bg-white shadow-2xl rounded-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full">
              <FiTrendingUp size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">{tech.name}</h2>
              <p className="text-xs text-gray-400">Performance individuelle</p>
            </div>
          </div>
          <button onClick={onClose}
            className="flex items-center justify-center w-8 h-8 text-gray-400 transition rounded-full hover:bg-gray-100 hover:text-gray-600">
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/*  Loading */}
          {loading && (
            <div className="flex items-center justify-center h-52">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                <p className="mt-3 text-xs text-gray-400">Chargement...</p>
              </div>
            </div>
          )}

          {/*  Erreur claire avec détail */}
          {!loading && errorMsg && (
            <div className="flex flex-col items-center justify-center gap-3 h-52">
              <div className="flex items-center justify-center rounded-full w-14 h-14 bg-red-50">
                <FiAlertCircle size={28} className="text-red-400" />
              </div>
              <p className="text-sm font-semibold text-red-600">Erreur de chargement</p>
              <p className="max-w-xs text-xs text-center text-gray-400">{errorMsg}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setErrorMsg(null);
                  technicienService.getStats(tech.groupId)
                    .then((res) => { setDetail(res.data); setLoading(false); })
                    .catch((err) => {
                      setErrorMsg(`Impossible de charger les données (${err.response?.status || err.message})`);
                      setLoading(false);
                    });
                }}
                className="px-4 py-2 text-xs font-medium text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                🔄 Réessayer
              </button>
            </div>
          )}

          {/*  Données */}
          {!loading && !errorMsg && detail && (
            <>
              {/* KPI mini cards */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="p-3 text-center border border-indigo-100 bg-indigo-50 rounded-xl">
                  <FiCheckCircle size={16} className="mx-auto mb-1 text-indigo-500" />
                  <p className="text-xl font-bold text-indigo-700">{detail.resolvedTickets}</p>
                  <p className="text-xs text-indigo-500 mt-0.5">Résolus</p>
                </div>
                <div className="p-3 text-center border border-red-100 bg-red-50 rounded-xl">
                  <FiAlertCircle size={16} className="mx-auto mb-1 text-red-500" />
                  <p className="text-xl font-bold text-red-700">{detail.openTickets}</p>
                  <p className="text-xs text-red-500 mt-0.5">Ouverts</p>
                </div>
                <div className="p-3 text-center border border-green-100 bg-green-50 rounded-xl">
                  <FiClock size={16} className="mx-auto mb-1 text-green-500" />
                  <p className="text-xl font-bold text-green-700">
                    {detail.avgResolutionTime > 0 ? `${detail.avgResolutionTime.toFixed(1)}h` : "—"}
                  </p>
                  <p className="text-xs text-green-500 mt-0.5">Tps Moyen</p>
                </div>
              </div>

              {/* Pie Chart */}
              <div>
                <p className="mb-1 text-sm font-semibold text-gray-700">Répartition par statut</p>
                <p className="mb-3 text-xs text-gray-400">Total : {detail.totalTickets} tickets</p>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={90}
                        dataKey="value" labelLine={false} label={renderCustomLabel}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v} ticket(s)`, n]} />
                      <Legend wrapperStyle={{ fontSize: 12 }}
                        formatter={(v, e) => (
                          <span style={{ color: "#374151" }}>{v}: <strong>{e.payload.value}</strong></span>
                        )} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-40 text-sm text-gray-400">
                    Aucun ticket pour ce technicien
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// Page principale
const Techniciens = () => {
  const { techniciens, statsGlobales, loading } = useTechniciens();
  const [activeChart, setActiveChart] = useState("tickets");
  const [popupTech, setPopupTech]     = useState(null);

  //  Clic sur barre ou label du BarChart
  const handleBarClick = (data) => {
    if (!data?.activeLabel) return;
    const found = techniciens.find(
      (t) => t.name.trim().toLowerCase() === data.activeLabel.trim().toLowerCase()
    );
    if (found) setPopupTech(found);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
        <p className="text-gray-500">Chargement des techniciens...</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">

          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-gray-800">Performance des Techniciens</h1>
            <p className="text-sm text-gray-500">
              Cliquez sur un technicien dans le graphique pour voir son détail
            </p>
          </div>

          {/* BarChart global */}
          {statsGlobales.length > 0 && (
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">Vue Globale — Tous les Techniciens</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    🖱️ Cliquez sur une barre ou un nom pour voir le détail
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setActiveChart("tickets")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeChart === "tickets" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    📊 Tickets
                  </button>
                  <button onClick={() => setActiveChart("temps")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeChart === "temps" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    ⏱️ Temps Moyen
                  </button>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={Math.max(280, statsGlobales.length * 50)}>
                <BarChart
                  data={statsGlobales}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
                  onClick={handleBarClick}
                  style={{ cursor: "pointer" }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 10, cursor: "pointer", fill: "#6366f1" }}
                    width={135}
                    tickFormatter={(v) => v.length > 20 ? v.slice(0, 20) + "…" : v}
                    onClick={(data) => {
                      const found = techniciens.find(
                        (t) => t.name.trim().toLowerCase() === data.value.trim().toLowerCase()
                      );
                      if (found) setPopupTech(found);
                    }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  {activeChart === "tickets" ? (
                    <>
                      <Bar dataKey="resolus" name="Résolus" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={20} />
                      <Bar dataKey="ouverts" name="Ouverts" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={20} />
                      <Bar dataKey="total"   name="Total"   fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={20} />
                    </>
                  ) : (
                    <Bar dataKey="avgResolutionTime" name="Temps Moyen (h)" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={20} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Pills */}
          {techniciens.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {techniciens.map((tech) => (
                <button
                  key={tech.groupId}
                  onClick={() => setPopupTech(tech)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 transition bg-white border border-gray-200 rounded-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                >
                  👤 {tech.name}
                </button>
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Modal */}
      {popupTech && (
        <TechnicienModal
          tech={popupTech}
          onClose={() => setPopupTech(null)}
        />
      )}
    </div>
  );
};

export default Techniciens;