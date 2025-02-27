import React from 'react';

function Sidebar({ trades }) {
  return (
    <div>
      <h2>Trade Details</h2>
      {trades.length === 0 ? (
        <p>No trades available.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {trades.map((trade, index) => (
            <li
              key={index}
              style={{
                marginBottom: '15px',
                borderBottom: '1px solid #eee',
                paddingBottom: '10px'
              }}
            >
              <p><strong>Ticker:</strong> {trade.ticker}</p>
              <p><strong>Buy Time:</strong> {trade.buyTime}</p>
              <p><strong>Buy Price:</strong> ${parseFloat(trade.buyPrice).toFixed(2)}</p>
              <p><strong>Sell Time:</strong> {trade.sellTime}</p>
              <p><strong>Sell Price:</strong> ${parseFloat(trade.sellPrice).toFixed(2)}</p>
              <p><strong>Shares:</strong> {trade.shares}</p>
              <p>
                <strong>Profit:</strong> ${trade.profit.toFixed(2)} 
                {' '}({trade.percentProfit.toFixed(2)}%)
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Sidebar;