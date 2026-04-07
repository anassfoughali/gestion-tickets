export const isCloture = (status) => {
    if (!status) return false;
    const s = status.toLowerCase().trim();
    return s.includes("clôturé") || s.includes("cloturé") || s.includes("ferm") ;
};

export const isResolu = (status) => {
    if (!status) return false;
    const s = status.toLowerCase().trim();
    return s.includes("résolu") || s.includes("resolu") ;
};

export const isEnCours = (status) => {
    if (!status) return false;
    const s = status.toLowerCase().trim();
    return s.includes("cours") || s.includes("affect") || s.includes("attente") || s.includes("escalad");
};

export const isOuvert = (status) => {
    if (!status) return false;
    const s = status.toLowerCase().trim();
    return s.includes("ouvert") || s.includes("nouveau");
};

export const statusBadge = (status ) => {
    if (!status) return "bg-gray-100 text-gray-600";
    if (isCloture(status)) return "bg-blue-100 text-blue-700";
    if (isResolu(status)) return "bg-green-100 text-green-700";
    if (isEnCours(status)) return "bg-yellow-100 text-yellow-700";
    if (isOuvert(status)) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
};

export const priorityBadge = (p) => {
    if (!p) return "bg-gray-50 text-gray-500 border border-gray-200";
    const pr= p.toLowerCase().trim();
    if (pr === "critique") return "bg-red-100 text-red-700 border border-red-200";
    if (pr === "majeur") return "bg-orange-100 text-orange-700 border border-orange-200";
    if (pr === "mineur") return "bg-green-100 text-green-700 border border-green-200";
    return "bg-gray-50 text-gray-500 border border-gray-200";
}