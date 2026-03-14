import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function WeaknessChart({ weakSubtopics }) {
  const data = {
    labels: weakSubtopics?.map((w) => w.subtopic) || [],
    datasets: [
      {
        label: 'Accuracy %',
        data: weakSubtopics?.map((w) => Math.round((w.accuracyRate || 0) * 100)) || [],
        backgroundColor: weakSubtopics?.map((w) =>
          (w.accuracyRate || 0) < 0.4 
            ? 'rgba(239, 68, 68, 0.8)'   // Strong Red
            : (w.accuracyRate || 0) < 0.7 
              ? 'rgba(245, 158, 11, 0.8)' // Amber
              : 'rgba(16, 185, 129, 0.8)' // Emerald
        ) || [],
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 10,
      }
    },
    scales: {
      y: { 
        max: 100, 
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: { font: { weight: 'bold' } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { weight: '600' } }
      }
    },
  };

  return (
    <div className="h-full w-full">
      {weakSubtopics?.length ? (
        <Bar data={data} options={options} />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 italic">
          <span className="text-4xl mb-4">📈</span>
          <p>Complete quizzes to see weakness analysis</p>
        </div>
      )}
    </div>
  );
}
