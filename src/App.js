import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import PortfolioChart from './PortfolioChart';
import Sidebar from './Sidebar';
import './index.css'

// Helper function to format dates as M/D/YYYY, hh:mm AM/PM in EST.
function formatDate(dateString) {
  const date = new Date(dateString);
  // Manually subtract 5 hours (adjust if needed for daylight saving)
  date.setHours(date.getHours() - 5);
  const options = {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  };
  return date.toLocaleString('en-US', options);
}

function App() {
  const [trades, setTrades] = useState([]);
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [selectedTradeTime, setSelectedTradeTime] = useState(null); // ✅ NEW: Store selected trade time

  const CSV_URL = 'https://storage.googleapis.com/gabe-jay-stock/data/trade_log.csv';

  const processTrades = useCallback((data) => {
    let portfolio = 1000000; // starting with $1,000,000
    const history = [];

    // Insert an initial data point for the chart:
    history.push({ time: 'Start', portfolio });

    const processedTrades = data.map((row) => {
      // Use the helper function to format dates
      const ticker = row.Stock;
      const rawBuyTime = row['Entry Time'];
      const rawSellTime = row['Exit Time'];
      const buyTime = formatDate(rawBuyTime);
      const sellTime = formatDate(rawSellTime);
      const buyPrice = parseFloat(row['Buy Price']);
      const sellPrice = parseFloat(row['Sell Price']);

      // Determine the number of shares purchased with $300K
      const shares = Math.floor(300000 / buyPrice);
      const cost = shares * buyPrice;
      const proceeds = shares * sellPrice;
      const profit = proceeds - cost;
      const percentProfit = (profit / cost) * 100;

      // Update the portfolio value after each trade
      portfolio += profit;
      history.push({ time: sellTime, portfolio });

      return {
        ticker,
        buyTime,
        buyPrice,
        sellTime,
        sellPrice,
        shares,
        cost,
        proceeds,
        profit,
        percentProfit
      };
    });

    setTrades(processedTrades);
    setPortfolioHistory(history);
  }, [setTrades, setPortfolioHistory]);

  const fetchData = useCallback(async () => {
    try {
      // Append a timestamp to prevent caching.
      const csvUrl = `${CSV_URL}?t=${Date.now()}`;
      const response = await fetch(csvUrl);
      const csvData = await response.text();
  
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processTrades(results.data);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        }
      });
    } catch (error) {
      console.error('Error fetching CSV data:', error);
    }
  }, [CSV_URL, processTrades]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ✅ NEW: Function to handle trade selection from PortfolioChart.js
  const handleTradeSelect = (time) => {
    setSelectedTradeTime(time);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Centering the chart only vertically */}
      <div style={{ flex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px' }}>
        <PortfolioChart data={portfolioHistory} onTradeSelect={handleTradeSelect} /> {/* ✅ Pass callback to chart */}
      </div>
  
      {/* Sidebar */}
      <div style={{ flex: 1, padding: '20px', borderLeft: '1px solid #ddd', overflowY: 'auto' }}>
        <Sidebar trades={trades} selectedTradeTime={selectedTradeTime} /> {/* ✅ Pass selected trade to sidebar */}
      </div>
    </div>
  );
}

export default App;