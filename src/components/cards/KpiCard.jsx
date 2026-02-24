import React from "react";

const KpiCard = ({ title , value , icon , color , subtitle }) => {
    const colorMap ={
        blue: "bg-blue-500",
        green: "bg-green-500",
        red: "bg-red-500",
        yellow: "bg-yellow-500",
        teal: "bg-teal-500",
        indigo: "bg-indigo-500",
    };
    return (
        <div className="flex items-center gap-4 p-5 transition bg-white border border-gray-100 shadow rounded-xl-sm hover:shadow-md">
            <div className={`${colorMap[color] || "bg-indigo-500"} h-12 w-12 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0`}>
                {icon}
            </div>
            <div>
               <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">{title}</p> 
               <p className="text-2xl font-bold text-gray-800">{value}</p>
               {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
            </div>
        </div>
    );

};
export default KpiCard;