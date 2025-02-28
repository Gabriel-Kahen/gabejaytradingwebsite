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

function PortfolioChart({ data, onTradeSelect, highlightedTrade }) {
  const aggregatedData = {};
  data.forEach((item) => {
    aggregatedData[item.time] = item.portfolio;
  });

  const uniqueTimes = Object.keys(aggregatedData).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const portfolioValues = uniqueTimes.map((time) => aggregatedData[time]);

  const defaultColor = 'rgb(52, 203, 42)';
  const highlightColor = 'yellow';
  const pointBackgroundColors = uniqueTimes.map((time) =>
    time === highlightedTrade ? highlightColor : defaultColor
  );

  const chartData = {
    labels: uniqueTimes,
    datasets: [
      {
        label: 'Portfolio Value',
        data: portfolioValues,
        fill: false,
        borderColor: defaultColor,
        tension: 0.1,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: pointBackgroundColors,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const selectedTime = uniqueTimes[index];
        if (onTradeSelect) {
          onTradeSelect(selectedTime);
        }
      }
    },
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          fontSize: '40px',
          fontWeight: '900',
          marginBottom: '10px',
        }}
      >
        Portfolio Performance
      </h2>
      <div style={{ flexGrow: 1 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default PortfolioChart;