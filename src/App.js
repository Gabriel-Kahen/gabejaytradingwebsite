import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import PortfolioChart from './PortfolioChart';
import Sidebar from './Sidebar';
import './index.css';

// Helper function to format dates as M/D/YYYY, hh:mm AM/PM in EST.
function formatDate(dateString) {
  const date = new Date(dateString);
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
  const [selectedTradeTime, setSelectedTradeTime] = useState(null); 

  const CSV_URL = 'https://storage.googleapis.com/gabe-jay-stock/data/trade_log.csv';

  const processTrades = useCallback((data) => {
    let portfolio = 1000000;
    const history = [];
  
    history.push({ time: 'Start', portfolio });
  
    const processedTrades = data.map((row) => {
      const ticker = row.Stock;
      const rawBuyTime = row['Entry Time'];
      const rawSellTime = row['Exit Time'];
      const buyTime = formatDate(rawBuyTime);
      const sellTime = formatDate(rawSellTime);
      const buyPrice = parseFloat(row['Buy Price']);
      const sellPrice = parseFloat(row['Sell Price']);
      const investmentAmount = portfolio / 3;
      const shares = Math.floor(investmentAmount / buyPrice);
      const cost = shares * buyPrice;
      const proceeds = shares * sellPrice;
      const profit = proceeds - cost;
      const percentProfit = (profit / cost) * 100;
  
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
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const csvUrl = `${CSV_URL}?t=${Date.now()}`;
      const response = await fetch(csvUrl, { cache: "no-store" });      const csvData = await response.text();
      console.log(csvData)
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

  const handleTradeSelect = (time) => {
    setSelectedTradeTime(time);
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <PortfolioChart data={portfolioHistory} onTradeSelect={handleTradeSelect} />
      </div>
      <div className="sidebar">
        <Sidebar trades={trades} selectedTradeTime={selectedTradeTime} />
      </div>
    </div>
  );
}

export default App;