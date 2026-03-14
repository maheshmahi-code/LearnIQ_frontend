import React from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

export function CircularProgressChart({ score, title }) {
  const data = {
    datasets: [{
      data: [score || 0, 100 - (score || 0)],
      backgroundColor: [
        score >= 80 ? '#10B981' : score >= 60 ? '#3B82F6' : '#F59E0B',
        '#E5E7EB'
      ],
      borderWidth: 0,
      circumference: 270,
      rotation: 225,
      cutout: '85%',
    }],
  };

  const options = {
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-3xl font-bold dark:text-white">{score}%</span>
        {title && <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{title}</span>}
      </div>
    </div>
  );
}

export function ScoreDistributionChart({ distribution }) {
  const data = {
    labels: ['Excellent', 'Good', 'Average', 'Poor'],
    datasets: [{
      data: [distribution.excellent, distribution.good, distribution.average, distribution.poor],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
      hoverOffset: 10,
      borderWidth: 2,
      borderColor: '#ffffff',
    }],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { weight: '600' }
        }
      }
    },
    cutout: '60%',
    responsive: true,
    maintainAspectRatio: false,
  };

  return <Doughnut data={data} options={options} />;
}

export function BarChart({ labels, data: d }) {
  const data = {
    labels,
    datasets: [{
      label: 'Score',
      data: d,
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: '#3B82F6',
      borderWidth: 2,
      borderRadius: 8,
      hoverBackgroundColor: '#3B82F6',
    }]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 100, grid: { display: false } },
      x: { grid: { display: false } }
    },
    plugins: { legend: { display: false } }
  };

  return <Bar data={data} options={options} />;
}

export function PerformanceLineChart({ labels, data: d }) {
  const data = {
    labels,
    datasets: [{
      label: 'Performance',
      data: d,
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 2,
    }]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
    plugins: { legend: { display: false } }
  };

  return <Line data={data} options={options} />;
}
