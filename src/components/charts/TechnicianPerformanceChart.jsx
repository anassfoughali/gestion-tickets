import React from 'react';
import {BarChart , Bar , XAxis, YAxis, CartesianGrid, Tooltip, Legend ,ResponsiveContainer} from 'recharts';
import {technicianPerformanceData} from "../../data/mockData";
const TechnicianPerformanceChart = () => (
    <div className='p-5 bg-white border shadow rounded-xl-sm-gray-100'>
        <div className='mb-4'>
            <h3 className='text-sm font-semibold text-gray-700'>Technicians Performance</h3>
            <p className='text-xs text-gray-400'>Tickets résolus vs ouverts par technicien</p> 
        </div>
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={technicianPerformanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="technician" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip  />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="ticketsResolved" name="Résolus" fill="#6366f1" radius={[4, 4, 0, 0]}  />
            <Bar dataKey="ticketsOpen" name="Ouverts" fill="#f59e0b" radius={[4, 4, 0, 0]}  />
            </BarChart>
        </ResponsiveContainer>
    </div>
);
export default TechnicianPerformanceChart;