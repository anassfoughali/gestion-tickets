import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { dailyTicketsData } from "../../data/mockData";

const TicketsPerDayChart = () => (
  <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700">Tickets par Jour</h3>
        <p className="text-xs text-gray-400">Résolus vs Ouverts (cette semaine)</p>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={dailyTicketsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="resolved" name="Résolus"
          stroke="#6366f1" fill="url(#colorResolved)" strokeWidth={2} />
        <Area type="monotone" dataKey="open" name="Ouverts"
          stroke="#f59e0b" fill="url(#colorOpen)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
export default TicketsPerDayChart;