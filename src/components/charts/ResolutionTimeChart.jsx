import React, { useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,  Sector,
} from "recharts";

const COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#14b8a6",
];


const renderActiveShape = (props) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, value,
  } = props;

  return (
    <g>
      {/*  Nom du technicien au centre au hover */}
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#1f2937" fontSize={11} fontWeight="600">
        {payload.name.length > 14 ? payload.name.slice(0, 14) + "…" : payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7280" fontSize={12} fontWeight="700">
        {value}h
      </text>
      {/* Slice agrandie */}
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      {/* Anneau extérieur */}
      <Sector
        cx={cx} cy={cy}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 15}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const ResolutionTimeChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!data || data.length === 0) return (
    <div className="flex items-center justify-center h-64 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
      <p className="text-sm text-gray-400">Aucune donnée disponible</p>
    </div>
  );

  //  TOP 5 seulement — évite le surcharge visuelle
  const chartData = data
    .map((t) => ({
      name: t.name || t.technicien || "N/A",
      value: Math.round(t.avgResolutionTime || t.avgResolution || 0),
    }))
    .filter((t) => t.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
      <h3 className="mb-1 text-sm font-semibold text-gray-700">Temps Moyen Résolution</h3>
      <p className="mb-1 text-xs text-gray-400">Top 5 techniciens (heures)</p>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/*  Légende custom en bas — propre et lisible */}
      <div className="flex flex-wrap justify-center mt-2 gap-x-3 gap-y-1">
        {chartData.map((entry, index) => (
          <div
            key={index}
            className="flex items-center gap-1 cursor-pointer"
            onMouseEnter={() => setActiveIndex(index)}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs text-gray-500 truncate max-w-[80px]">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResolutionTimeChart;