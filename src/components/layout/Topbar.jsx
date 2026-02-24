import React , { useState} from "react";
import {FiSearch , FiBell , FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { mockTickets } from "../../data/mockData";


const Topbar = () => {
    const { user } = useAuth();
    const [query , setQuery] = useState("");
    const [results , setResults] = useState([]);
    const [showResults , setShowResults] = useState(false);

    const handleSearch = (e) => {
        const val = e.target.value;
        setQuery(val);
        if (val.lenght > 1){
            const filtered = mockTickets.filter(
                (t) => 
                    t.IssueID.toLowerCase().includes(val.toLowerCase()) ||
                    t.BriefDescription.toLowerCase().includes(val.toLowerCase()) ||
                    t.CardName.toLowerCase().includes(val.toLowerCase()) ||
                    t.Technicien.toLowerCase().includes(val.toLowerCase()) ||
                    t.Status.toLowerCase().includes(val.toLowerCase())
            );
            setResults(filtered);
            setShowResults(true);
        } else {
            setResults([]);
            setShowResults(false);
        }
    };
    const statusColor = (status) => {
        if (status === "Résolu") return "bg-green-100 text-green-700";
        if (status === "En cours") return "bg-yellow-100 text-yellow-700";
        return "bg-red-100 text-red-700";
    };

    return (
        <header className="relative z-50 flex items-center h-16 gap-4 px-6 bg-white border-b border-gray-200">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xl">
                <FiSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={20} />
                <input 
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    onBlur={() => setTimeout (() => setShowResults(false) , 200)}
                    onFocus={() => query.length > 1 && setShowResults (true)}
                    placeholder="Rechercher un ticket , technicien , client... "
                    className="w-full py-2 pl-10 pr-4 text-sm transition bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white"                
                />
                {/* Search Results Dropdown */}
                {showResults && (
                    <div className="absolute w-full mt-1 overflow-y-auto bg-white border border-gray-100 shadow-xl top-full rounded-xl max-h72">
                        {results.lenght === 0 ? (
                            <p className="py-4 text-sm text-center text-gray-400">Aucun résultat trouvé</p>
                        ) : (
                            results.map((t) => (
                                <div key={t.IssueID}
                                className="flex items-center justify-between px-4 py-3 border-b cursor-pointer hover:bg-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{t.IssueID}</p>
                                        <p className="max-w-xs text-xs text-gray-500 truncate">{t.BriefDescription}</p>
                                        <p className="text-xs text-gray-400">{t.CardName} . {t.Technicien}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(t.Status)}`}>{t.Status}</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
                    </div>
            
            {/* Right Side */}
            <div className="flex items-center gap-4 ml-auto" >
                <button className="relative text-gray-500 transition hover:text-indigo-600">
                    <FiBell size={20}/>
                    <span className="absolute flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">3</span>

                </button>
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full">
                        <FiUser size={16} className="text-white"/>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.username}</span>
                </div>
            </div>
                
        </header>
    );
};
export default Topbar;