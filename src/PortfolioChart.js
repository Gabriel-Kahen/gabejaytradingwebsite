import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function PortfolioChart({ data }) {
  // Prepare chart labels (using sell times) and portfolio values
  const chartData = {
    labels: data.map((item) => item.time),
    datasets: [
      {
        label: 'Portfolio Value',
        data: data.map((item) => item.portfolio),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1
      }
    ]
  };

  return (
    <div>
      <h2>Portfolio Value Over Time</h2>
      <Line data={chartData} />
    </div>
  );
}

export default PortfolioChart;