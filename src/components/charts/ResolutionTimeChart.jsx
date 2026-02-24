import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { technicianPerformanceData } from "../../data/mockData";

const COLORS = ["#6366f1", "#10b981", "#f59e0b"];
const ResolutionTimeChart = () => (
  <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-700">Temps Moyen de Résolution</h3>
      <p className="text-xs text-gray-400">En heures, par technicien</p>
    </div>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={technicianPerformanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 11 }} unit="h" />
        <Tooltip formatter={(val) => [`${val}h`, "Temps moyen"]} />
        <Bar dataKey="avgResolutionTime" name="Temps moyen (h)" radius={[4, 4, 0, 0]}>
          {technicianPerformanceData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);
export default ResolutionTimeChart;