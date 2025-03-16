
import React from 'react';
import { ConsumptionData } from '@/types';
import { PieChart as RechartsSimplePieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Colors for chart segments
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57', '#83a6ed', '#8dd1e1', '#a4e2c6', '#d6e685', '#fddaec', '#f28cb1', '#a78dc1'];

interface ResultsChartProps {
  data: ConsumptionData[];
  chartType: 'pie' | 'bar';
}

const ResultsChart: React.FC<ResultsChartProps> = ({ data, chartType }) => {
  if (chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsSimplePieChart>
          <Pie
            data={data}
            dataKey="kwh"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} kWh`, 'Consumption']} />
          <Legend />
        </RechartsSimplePieChart>
      </ResponsiveContainer>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} kWh`, 'Consumption']} />
        <Legend />
        <Bar dataKey="kwh" name="Consumption (kWh)" fill="#0088FE" />
        <Bar dataKey="cost" name="Cost (€)" fill="#00C49F" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ResultsChart;
