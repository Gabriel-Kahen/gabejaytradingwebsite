import React, { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);

  // Check screen orientation (or you can use a width threshold)
  useEffect(() => {
    const checkOrientation = () => {
      // Here we use portrait orientation as a proxy for mobile.
      setIsMobile(window.matchMedia('(orientation: portrait)').matches);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

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
        // Adjust the dot size based on screen orientation
        pointRadius: isMobile ? 3 : 5,
        pointHoverRadius: isMobile ? 4 : 7,
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