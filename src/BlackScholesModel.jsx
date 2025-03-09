import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Heatmap from './Heatmap';
import * as MathUtils from './Math';

const BlackScholesCalculator = () => {
  const [inputs, setInputs] = useState({
    stockPrice: 100,
    strikePrice: 100,
    timeToMaturity: 1,
    riskFreeRate: 0.05,
    volatility: 0.2,
    optionType: 'call'
  });
  
  const [results, setResults] = useState({
    callPrice: 0,
    putPrice: 0,
    delta: 0,
    gamma: 0,
    theta: 0,
    vega: 0,
    rho: 0
  });
  
  const [showGreeks, setShowGreeks] = useState(false);
  
  // State for heatmap data
  const [heatmapData, setHeatmapData] = useState({
    callHeatmap: [],
    putHeatmap: []
  });
  
  // Parameters for heatmap
  const [heatmapParams, setHeatmapParams] = useState({
    minSpotPrice: 80,
    maxSpotPrice: 120,
    minVol: 0.1,
    maxVol: 0.4,
    steps: 10
  });
  
  // Calculate option prices and Greeks when inputs change
  useEffect(() => {
    calculateResults();
  }, [inputs]);
  
  // Generate heatmap when relevant parameters change
  useEffect(() => {
    generateHeatmapData();
  }, [inputs.strikePrice, inputs.timeToMaturity, inputs.riskFreeRate, heatmapParams]);
  
  const calculateResults = () => {
    const { stockPrice, strikePrice, timeToMaturity, riskFreeRate, volatility, optionType } = inputs;
    
    // Convert inputs to numbers
    const S = parseFloat(stockPrice);
    const K = parseFloat(strikePrice);
    const T = parseFloat(timeToMaturity);
    const r = parseFloat(riskFreeRate);
    const sigma = parseFloat(volatility);
    
    // Calculate prices using the Math utility
    const { call, put } = MathUtils.calculateBlackScholes(S, K, T, r, sigma);
    
    // Calculate Greeks
    const greeks = MathUtils.calculateGreeks({
      S, K, T, r, sigma, optionType
    });
    
    setResults({
      callPrice: call,
      putPrice: put,
      ...greeks
    });
    
    // Update heatmap params based on current stock price
    setHeatmapParams(prev => ({
      ...prev,
      minSpotPrice: Math.round(S * 0.7),
      maxSpotPrice: Math.round(S * 1.3)
    }));
  };
  
  const generateHeatmapData = () => {
    const { strikePrice, timeToMaturity, riskFreeRate } = inputs;
    
    // Generate the heatmap data using the Math utility
    const heatmapData = MathUtils.generateHeatmapData({
      strikePrice,
      timeToMaturity,
      riskFreeRate,
      ...heatmapParams
    });
    
    setHeatmapData(heatmapData);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleTypeChange = (type) => {
    setInputs(prev => ({
      ...prev,
      optionType: type
    }));
  };
  
  const toggleGreeks = () => {
    setShowGreeks(!showGreeks);
  };
  
  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      {/* Sidebar component */}
      <Sidebar 
        inputs={inputs}
        handleInputChange={handleInputChange}
        handleTypeChange={handleTypeChange}
        heatmapParams={heatmapParams}
        setHeatmapParams={setHeatmapParams}
        results={results}
        showGreeks={showGreeks}
        toggleGreeks={toggleGreeks}
      />
      
      {/* Heatmap component */}
      <Heatmap 
        inputs={inputs}
        heatmapParams={heatmapParams}
        heatmapData={heatmapData}
        getColorForValue={MathUtils.getColorForValue}
        getMaxValue={MathUtils.getMaxValue}
      />
    </div>
  );
};

export default BlackScholesCalculator;