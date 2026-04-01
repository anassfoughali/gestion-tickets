import React from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import KpiCard from "../components/cards/KpiCard";
import TicketsPerDayChart from "../components/charts/TicketsPerDayChart";
import TechnicianPerformanceChart from "../components/charts/TechnicianPerformanceChart";
import ResolutionTimeChart from "../components/charts/ResolutionTimeChart";
import useDashboard from "../hooks/useDashboard";
import {
  FiList, FiCheckCircle, FiClock, FiAlertCircle, FiTrendingUp, FiShield, FiRefreshCw,
} from "react-icons/fi";

const statusBadge = (status) => {
  if (!status) return "bg-gray-100 text-gray-600";
  const s = status.toLowerCase();
  if (s.includes("resolu") || s.includes("clot")) return "bg-green-100 text-green-700";
  if (s.includes("cours") || s.includes("progress")) return "bg-yellow-100 text-yellow-700";
  if (s.includes("ouvert") || s.includes("open")) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
};

//  Couleurs priorité : Critique=rouge, Majeure=orange, Mineure=vert
//  Mapping exact avec les vraies valeurs SAP HANA
const priorityBadge = (p) => {
  if (!p) return "bg-gray-50 text-gray-500";
  const pr = p.toLowerCase().trim();

  if (pr === "critique") return "bg-red-100 text-red-700 border border-red-200";
  if (pr === "majeur")   return "bg-orange-100 text-orange-700 border border-orange-200";
  if (pr === "mineur")   return "bg-green-100 text-green-700 border border-green-200";

  return "bg-gray-50 text-gray-500 border border-gray-200";
};

//  Helper — s'assure que c'est toujours un tableau
const toArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [];
};

//  Helper — s'assure que c'est toujours une string
const toStr = (val) => {
  if (val === null || val === undefined) return 'N/A';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

const Dashboard = () => {
  const { stats, loading, error, lastUpdated } = useDashboard();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        <p className="text-gray-500">Chargement des données...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-6 text-center bg-white shadow rounded-xl">
        <p className="font-semibold text-red-500">❌ Erreur de connexion</p>
        <p className="mt-1 text-sm text-gray-400">{error}</p>
        <p className="mt-2 text-xs text-gray-400">Vérifiez que Spring Boot tourne sur le port 8082</p>
      </div>
    </div>
  );

  //  Extraction sécurisée
  const kpi             = stats?.kpi             || {};
  const parJour         = toArray(stats?.parJour);
  const parTechnicien   = toArray(stats?.parTechnicien);
  const ticketsRecents  = toArray(stats?.ticketsRecents);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">

          {/* Title + Last Updated */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Tableau de Bord</h1>
              <p className="text-sm text-gray-500">Vue globale des performances en temps réel</p>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 bg-white border rounded-lg shadow-sm">
                <FiRefreshCw className="text-green-500 animate-pulse" />
                <span>Mis à jour : {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <KpiCard title="Total Tickets" value={kpi.totalTickets}      subtitle="Total"         icon={<FiList />}        color="indigo" />
            <KpiCard title="Ouverts"       value={kpi.openTickets}       subtitle="En attente"    icon={<FiAlertCircle />} color="red"    />
            <KpiCard title="Résolus"       value={kpi.resolvedTickets}   subtitle="Clôturés"      icon={<FiCheckCircle />} color="green"  />
            <KpiCard title="En Cours"      value={kpi.inProgressTickets} subtitle="En traitement" icon={<FiClock />}       color="yellow" />
            <KpiCard title="Temps Moyen"   value={kpi.avgResolutionTime} subtitle="Résolution"    icon={<FiTrendingUp />}  color="blue"   />
            <KpiCard title="SLA"           value={kpi.slaCompliance}     subtitle="Conformité"    icon={<FiShield />}      color="teal"   />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TicketsPerDayChart data={parJour} />
            <TechnicianPerformanceChart data={parTechnicien} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <ResolutionTimeChart data={parTechnicien} />
            </div>

            {/* Tickets Récents */}
            <div className="p-5 bg-white border border-gray-100 shadow-sm lg:col-span-2 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Tickets Récents</h3>
                  <p className="text-xs text-gray-400">Derniers tickets enregistrés</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-green-500">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Temps réel
                </span>
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
                    {ticketsRecents.map((t, idx) => (
                      //  idx comme fallback si issueID est undefined
                      <tr key={t.issueID || idx} className="transition hover:bg-gray-50">
                        <td className="py-3 font-mono text-xs font-semibold text-indigo-600">{toStr(t.issueID)}</td>
                        <td className="max-w-xs py-3 text-gray-700 truncate">{toStr(t.briefDescription)}</td>
                        <td className="py-3 text-xs text-gray-500">{toStr(t.technicien)}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge(t.priority)}`}>
                            {toStr(t.priority)}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(t.status)}`}>
                            {toStr(t.status)}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-400">{toStr(t.requestDate)}</td>
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