import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const TicketsPerDayChart = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="flex items-center justify-center h-64 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
      <p className="text-sm text-gray-400">Aucune donnée disponible</p>
    </div>
  );

  // ✅ Normaliser les champs — backend retourne "date" ou "jour"
  const normalized = data.map((d) => ({
    label:    d.date    || d.jour    || "N/A",
    total:    d.total   || 0,
    resolus:  d.resolved || d.resolus || 0,
    ouverts:  d.open    || d.ouverts  || 0,
    enCours:  d.enCours || d.inProgress || 0,
  }));

  console.log("📊 parJour data:", normalized); // ✅ Debug

  return (
    <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
      <h3 className="mb-1 text-sm font-semibold text-gray-700">Tickets par Jour</h3>
      <p className="mb-4 text-xs text-gray-400">7 derniers jours</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={normalized}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorResolus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="total"   name="Total"   stroke="#6366f1" fill="url(#colorTotal)"   strokeWidth={2} />
          <Area type="monotone" dataKey="resolus" name="Résolus" stroke="#10b981" fill="url(#colorResolus)" strokeWidth={2} />
          <Area type="monotone" dataKey="ouverts" name="Ouverts" stroke="#ef4444" fill="none"               strokeWidth={2} strokeDasharray="4 4" />
          <Area type="monotone" dataKey="enCours" name="En cours" stroke="#f59e0b" fill="none"              strokeWidth={2} strokeDasharray="4 4" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketsPerDayChart;