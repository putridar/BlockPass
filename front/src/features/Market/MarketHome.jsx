import React from 'react';
import { Link } from 'react-router-dom';

function MarketHome() {
  return (
    <div>
      <h1>Welcome to Secondary Market</h1>
      <p>Would you like to buy or sell tickets?</p>
      <Link to="/market/buy">
        <button className="p-2 border-2 border-black">Buy Tickets</button>
      </Link>
      <Link to="/market/sell">
        <button className="p-2 border-2 border-black">Sell Tickets</button>
      </Link>
      <div>
          <Link to="/home">
          <button className="p-2 border-2 border-black">Back To Home</button>
          </Link>
      </div>
    </div>
  );
}

export default MarketHome;