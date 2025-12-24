"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SalesChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Last 7 Days Sales</h3>
        <ResponsiveContainer width="100%" height={300}>
        <BarChart
            data={data}
            margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
            <Tooltip
                contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    border: '1px solid #ccc',
                    borderRadius: '0.5rem',
                    backdropFilter: 'blur(5px)'
                }}
             />
             <Legend />
            <Bar dataKey="sales" fill="#16a34a" name="Sales" radius={[4, 4, 0, 0]} />
        </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
