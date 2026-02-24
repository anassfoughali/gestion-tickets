import React from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import KpiCard from "../components/cards/KpiCard";
import TicketsPerDayChart from "../components/charts/TicketsPerDayChart";
import TechnicianPerformanceChart from "../components/charts/TechnicianPerformanceChart";
import ResolutionTimeChart from "../components/charts/ResolutionTimeChart";
import { kpiData, mockTickets } from "../data/mockData";
import {
  FiList, FiCheckCircle, FiClock, FiAlertCircle, FiTrendingUp, FiShield,
} from "react-icons/fi";

const statusBadge = (status) => {
  const map = {
    "Résolu": "bg-green-100 text-green-700",
    "En cours": "bg-yellow-100 text-yellow-700",
    "Ouvert": "bg-red-100 text-red-700",
  };
  return map[status] || "bg-gray-100 text-gray-600";
};

const priorityBadge = (p) => {
  const map = {
    "Haute": "bg-red-50 text-red-600 border border-red-200",
    "Moyenne": "bg-yellow-50 text-yellow-600 border border-yellow-200",
    "Basse": "bg-green-50 text-green-600 border border-green-200",
  };
  return map[p] || "bg-gray-50 text-gray-500";
};

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Page Title */}
          <div>
            <h1 className="text-xl font-bold text-gray-800">Tableau de Bord</h1>
            <p className="text-sm text-gray-500">Vue globale des performances – Février 2026</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <KpiCard title="Total Tickets" value={kpiData.totalTickets}
              subtitle="Ce mois" icon={<FiList />} color="indigo" />
            <KpiCard title="Ouverts" value={kpiData.openTickets}
              subtitle="En attente" icon={<FiAlertCircle />} color="red" />
            <KpiCard title="Résolus" value={kpiData.resolvedTickets}
              subtitle="Clôturés" icon={<FiCheckCircle />} color="green" />
            <KpiCard title="En Cours" value={kpiData.inProgressTickets}
              subtitle="En traitement" icon={<FiClock />} color="yellow" />
            <KpiCard title="Temps Moyen" value={kpiData.avgResolutionTime}
              subtitle="Résolution" icon={<FiTrendingUp />} color="blue" />
            <KpiCard title="SLA" value={kpiData.slaCompliance}
              subtitle="Conformité" icon={<FiShield />} color="teal" />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TicketsPerDayChart />
            <TechnicianPerformanceChart />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <ResolutionTimeChart />
            </div>

            {/* Tickets Status Summary */}
            <div className="p-5 bg-white border border-gray-100 shadow-sm lg:col-span-2 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Tickets Récents</h3>
                  <p className="text-xs text-gray-400">Derniers tickets enregistrés</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b">
                      <th className="pb-3 font-medium text-left">N° Ticket</th>
                      <th className="pb-3 font-medium text-left">Objet</th>
                      <th className="pb-3 font-medium text-left">Technicien</th>
                      <th className="pb-3 font-medium text-left">Priorité</th>
                      <th className="pb-3 font-medium text-left">Statut</th>
                      <th className="pb-3 font-medium text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {mockTickets.slice(0, 6).map((t) => (
                      <tr key={t.IssueID} className="transition hover:bg-gray-50">
                        <td className="py-3 font-mono text-xs font-semibold text-indigo-600">{t.IssueID}</td>
                        <td className="max-w-xs py-3 text-gray-700 truncate">{t.BriefDescription}</td>
                        <td className="py-3 text-xs text-gray-500">{t.Technicien}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge(t.Priority)}`}>
                            {t.Priority}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(t.Status)}`}>
                            {t.Status}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-400">{t.RequestDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
