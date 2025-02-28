import React, { useState, useEffect, useRef, useMemo } from 'react';

function Sidebar({ trades, selectedTradeTime }) {
  // Memoize sorted trades so they don't change on every render
  const sortedTrades = useMemo(
    () => [...trades].sort((a, b) => new Date(b.sellTime) - new Date(a.sellTime)),
    [trades]
  );

  // Group trades by date and memoize
  const tradesByDate = useMemo(() => {
    return sortedTrades.reduce((acc, trade) => {
      const dateKey = new Date(trade.sellTime).toLocaleDateString('en-US');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(trade);
      return acc;
    }, {});
  }, [sortedTrades]);

  // Memoize tradeDates so they only change when tradesByDate changes
  const tradeDates = useMemo(() => Object.keys(tradesByDate), [tradesByDate]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [highlightedTrade, setHighlightedTrade] = useState(null);
  const tradeRefs = useRef({});

  // When the user navigates manually, we want to ignore the chart selection.
  const [ignoreChartSelection, setIgnoreChartSelection] = useState(false);
  // Track the last processed selectedTradeTime so we can detect a new selection.
  const lastSelectedTradeRef = useRef(null);

  // If the parent's selectedTradeTime changes (i.e. a new selection), reset ignore flag.
  useEffect(() => {
    if (selectedTradeTime !== lastSelectedTradeRef.current) {
      setIgnoreChartSelection(false);
      lastSelectedTradeRef.current = selectedTradeTime;
    }
  }, [selectedTradeTime]);

  // Update index when clicking a chart point, unless we're ignoring chart selection
  useEffect(() => {
    if (selectedTradeTime && !ignoreChartSelection) {
      const selectedDate = tradeDates.find(date =>
        tradesByDate[date].some(trade => trade.sellTime === selectedTradeTime)
      );

      if (selectedDate) {
        const newIndex = tradeDates.indexOf(selectedDate);
        setCurrentIndex(newIndex);
      }
    }
  }, [selectedTradeTime, tradeDates, tradesByDate, ignoreChartSelection]);

  const currentDate = tradeDates[currentIndex];
  const currentTrades = tradesByDate[currentDate] || [];

  // Group trades by time (3 trades per group)
  const groupedTrades = [];
  for (let i = 0; i < currentTrades.length; i += 3) {
    const group = currentTrades.slice(i, i + 3);
    const buyTimes = group.map(trade => new Date(trade.buyTime));
    const sellTimes = group.map(trade => new Date(trade.sellTime));

    const earliestBuyTime = new Date(Math.min(...buyTimes)).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    const latestSellTime = new Date(Math.max(...sellTimes)).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    groupedTrades.push({
      trades: group,
      holdingPeriod: `${earliestBuyTime} → ${latestSellTime}`,
      id: group[0].sellTime,
    });
  }

  // Create refs to store timeout IDs so we can clear them on new selections
  const scrollTimeoutRef = useRef(null);
  const highlightTimeoutRef = useRef(null);

  // Scroll and highlight the trade after clicking a chart point
  useEffect(() => {
    // Clear any previous timeouts so that rapid clicks always start fresh timers
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    if (selectedTradeTime) {
      scrollTimeoutRef.current = setTimeout(() => {
        if (tradeRefs.current[selectedTradeTime]) {
          tradeRefs.current[selectedTradeTime].scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedTrade(selectedTradeTime);

          highlightTimeoutRef.current = setTimeout(() => {
            setHighlightedTrade(null);
          }, 2000);
        }
      }, 300);
    }

    // Cleanup function to clear timeouts if the effect re-runs
    return () => {
      clearTimeout(scrollTimeoutRef.current);
      clearTimeout(highlightTimeoutRef.current);
    };
  }, [selectedTradeTime]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Scrollable Main Content */}
      <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '10px' }}>
        {/* Sticky Header */}
        <div 
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            zIndex: 10,
            padding: '8px 10px',
            borderBottom: '1px solid #ddd',
            textAlign: 'center'
          }}
        >
          <h2 style={{ margin: '0', fontSize: '1.5rem' }}>Trade Details</h2>
          <h3 style={{ margin: '0', fontSize: '1.2rem' }}>{currentDate}</h3>
        </div>

        {/* Trade Groups */}
        {groupedTrades.map((group, index) => (
          <div
            key={index}
            ref={(el) => (tradeRefs.current[group.id] = el)}
            onMouseEnter={() => setHighlightedTrade(group.id)}
            onMouseLeave={() => setHighlightedTrade(null)}
            style={{
              border: '1px solid #ddd',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '5px',
              backgroundColor: group.id === highlightedTrade ? '#f0f8ff' : 'transparent',
              transition: 'background-color 0.3s ease-in-out',
            }}
          >
            <strong>Holding Period: {group.holdingPeriod}</strong>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Stock</th>
                  <th style={{ textAlign: 'right', padding: '5px' }}>Buy Price</th>
                  <th style={{ textAlign: 'right', padding: '5px' }}>Sell Price</th>
                  <th style={{ textAlign: 'right', padding: '5px' }}>% Profit</th>
                </tr>
              </thead>
              <tbody>
                {group.trades.map((trade, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '5px' }}><strong>{trade.ticker}</strong></td>
                    <td style={{ padding: '5px', textAlign: 'right' }}>${trade.buyPrice.toFixed(2)}</td>
                    <td style={{ padding: '5px', textAlign: 'right' }}>${trade.sellPrice.toFixed(2)}</td>
                    <td
                      style={{
                        padding: '5px',
                        textAlign: 'right',
                        color: trade.percentProfit >= 0 ? 'green' : 'red'
                      }}
                    >
                      {trade.percentProfit.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Footer Navigation inside Sidebar */}
      <div
        style={{
          backgroundColor: 'white',
          borderTop: '1px solid #ddd',
          paddingTop: '15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <button
          onClick={() => {
            setIgnoreChartSelection(true);
            setCurrentIndex(prev => Math.max(0, prev - 1));
          }}
          disabled={currentIndex === 0}
        >
          Next Day
        </button>
        
        <span>{currentIndex + 1} / {tradeDates.length}</span>
        
        <button 
          onClick={() => {
            setIgnoreChartSelection(true);
            setCurrentIndex(prev => Math.min(tradeDates.length - 1, prev + 1));
          }}
          disabled={currentIndex === tradeDates.length - 1}
        >
          Previous Day
        </button>
      </div>
    </div>
  );
}

export default Sidebar;