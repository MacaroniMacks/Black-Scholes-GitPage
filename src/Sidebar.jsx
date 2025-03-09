import React from 'react';

const Sidebar = ({ 
  inputs, 
  handleInputChange, 
  handleTypeChange, 
  heatmapParams, 
  setHeatmapParams,
  results,
  showGreeks,
  toggleGreeks
}) => {
  return (
    <div className="w-1/5 bg-gray-800 shadow-lg p-4 overflow-y-auto border-r border-gray-700">
      <h1 className="text-xl font-bold mb-6 text-center text-gray-100">Black-Scholes Options</h1>
      
      {/* Option Parameters */}
      <div className="space-y-4 mb-6">
        <h2 className="font-medium text-gray-300">Option Parameters</h2>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Stock Price ($)</label>
          <input
            type="number"
            name="stockPrice"
            value={inputs.stockPrice}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Strike Price ($)</label>
          <input
            type="number"
            name="strikePrice"
            value={inputs.strikePrice}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Time to Maturity (years)</label>
          <input
            type="number"
            name="timeToMaturity"
            value={inputs.timeToMaturity}
            onChange={handleInputChange}
            step="0.01"
            min="0.01"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Risk-Free Rate (decimal)</label>
          <input
            type="number"
            name="riskFreeRate"
            value={inputs.riskFreeRate}
            onChange={handleInputChange}
            step="0.001"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Heatmap Parameters */}
      <div className="space-y-4 mb-6">
        <h2 className="font-medium text-gray-300">Heatmap Settings</h2>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Min Spot Price</label>
          <input
            type="number"
            value={heatmapParams.minSpotPrice}
            onChange={(e) => setHeatmapParams({...heatmapParams, minSpotPrice: parseFloat(e.target.value)})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Max Spot Price</label>
          <input
            type="number"
            value={heatmapParams.maxSpotPrice}
            onChange={(e) => setHeatmapParams({...heatmapParams, maxSpotPrice: parseFloat(e.target.value)})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Min Volatility: {heatmapParams.minVol.toFixed(2)}</label>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">0.00</span>
            <input
              type="range"
              value={heatmapParams.minVol}
              onChange={(e) => setHeatmapParams({...heatmapParams, minVol: parseFloat(e.target.value)})}
              min="0"
              max="1"
              step="0.01"
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-xs text-gray-500 ml-2">1.00</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Max Volatility: {heatmapParams.maxVol.toFixed(2)}</label>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">0.00</span>
            <input
              type="range"
              value={heatmapParams.maxVol}
              onChange={(e) => setHeatmapParams({...heatmapParams, maxVol: parseFloat(e.target.value)})}
              min="0"
              max="1"
              step="0.01"
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-xs text-gray-500 ml-2">1.00</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Grid Size: {heatmapParams.steps}</label>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">2</span>
            <input
              type="range"
              value={heatmapParams.steps}
              onChange={(e) => setHeatmapParams({...heatmapParams, steps: parseInt(e.target.value)})}
              min="2"
              max="12"
              step="1"
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-xs text-gray-500 ml-2">12</span>
          </div>
          <div className="flex justify-between px-2 mt-1">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-1 w-1 bg-gray-500 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 mt-4">
        <p>The Black-Scholes model assumes lognormal distribution of stock prices, constant volatility, and frictionless markets.</p>
      </div>
    </div>
  );
};

export default Sidebar;