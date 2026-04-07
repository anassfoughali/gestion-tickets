import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const TechnicianPerformanceChart = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="flex items-center justify-center h-64 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
      <p className="text-sm text-gray-400">Aucune donnée disponible</p>
    </div>
  );

  const normalized = data.map((d) => ({
    name: d.name  || d.technicien || "N/A",
    resolus: d.ticketsResolved || d.resolus || 0,  
    clotures:d.ticketsClotures || d.clotures || 0,  
    ouverts:d.ticketsOpen || d.ouverts || 0,  
  }));

  return (
    <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
      <h3 className="mb-1 text-sm font-semibold text-gray-700">Performance par Technicien</h3>
      <p className="mb-4 text-xs text-gray-400">Résolus 🟢 · Clôturés 🔵 · Ouverts 🔴</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={normalized} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={110} />
          <Tooltip />
          <Legend />
          <Bar dataKey="resolus"name="Résolus" fill="#10b981"radius={[0, 4, 4, 0]} />
          <Bar dataKey="clotures"name="Clôturés"fill="#3b82f6"radius={[0, 4, 4, 0]} />
          <Bar dataKey="ouverts"name="Ouverts" fill="#ef4444"radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TechnicianPerformanceChart;