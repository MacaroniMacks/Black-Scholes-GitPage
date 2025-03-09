import * as math from 'mathjs';

/**
 * Black-Scholes Option Pricing Model utility functions
 */

/**
 * Standard Normal Cumulative Distribution Function
 * @param {number} x - The input value
 * @returns {number} - The cumulative probability
 */
export const cdf = (x) => {
  // Using math.js erf function for better numerical stability
  return 0.5 * (1 + math.erf(x / math.sqrt(2)));
};

/**
 * Calculate Black-Scholes option prices
 * @param {number} S - Stock price
 * @param {number} K - Strike price
 * @param {number} T - Time to maturity in years
 * @param {number} r - Risk-free interest rate (decimal)
 * @param {number} sigma - Volatility (decimal)
 * @returns {Object} - Object with call and put prices
 */
export const calculateBlackScholes = (S, K, T, r, sigma) => {
  // Handle edge case of immediate expiration
  if (T <= 0) return { call: Math.max(0, S - K), put: Math.max(0, K - S) };
  
  // Calculate d1 and d2
  const d1 = (Math.log(S / K) + (r + Math.pow(sigma, 2) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  
  // Calculate call and put prices
  const call = S * cdf(d1) - K * Math.exp(-r * T) * cdf(d2);
  const put = K * Math.exp(-r * T) * cdf(-d2) - S * cdf(-d1);
  
  return {
    call: Math.max(0, call),
    put: Math.max(0, put)
  };
};

/**
 * Calculate all option Greeks
 * @param {Object} params - Parameter object
 * @param {number} params.S - Stock price
 * @param {number} params.K - Strike price
 * @param {number} params.T - Time to maturity in years
 * @param {number} params.r - Risk-free interest rate (decimal)
 * @param {number} params.sigma - Volatility (decimal)
 * @param {string} params.optionType - Option type ('call' or 'put')
 * @returns {Object} - Object with all Greeks
 */
export const calculateGreeks = (params) => {
  const { S, K, T, r, sigma, optionType } = params;
  
  // Calculate d1 and d2
  const d1 = (Math.log(S / K) + (r + Math.pow(sigma, 2) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  
  // Delta
  const delta = optionType === 'call' ? cdf(d1) : cdf(d1) - 1;
  
  // Gamma (same for calls and puts)
  const gamma = Math.exp(-Math.pow(d1, 2) / 2) / (S * sigma * Math.sqrt(T) * Math.sqrt(2 * Math.PI));
  
  // Theta (time decay per year, needs to be divided by 365 for daily)
  const theta = optionType === 'call' 
    ? -S * sigma * Math.exp(-Math.pow(d1, 2) / 2) / (2 * Math.sqrt(T) * Math.sqrt(2 * Math.PI)) - r * K * Math.exp(-r * T) * cdf(d2)
    : -S * sigma * Math.exp(-Math.pow(d1, 2) / 2) / (2 * Math.sqrt(T) * Math.sqrt(2 * Math.PI)) + r * K * Math.exp(-r * T) * cdf(-d2);
  
  // Vega (for 1% change in volatility)
  const vega = S * Math.sqrt(T) * Math.exp(-Math.pow(d1, 2) / 2) / Math.sqrt(2 * Math.PI) / 100;
  
  // Rho (for 1% change in interest rate)
  const rho = optionType === 'call' 
    ? K * T * Math.exp(-r * T) * cdf(d2) / 100 
    : -K * T * Math.exp(-r * T) * cdf(-d2) / 100;
  
  return {
    delta,
    gamma,
    theta: theta / 365, // Convert to daily
    vega,
    rho
  };
};

/**
 * Get a color for heatmap cell based on its value
 * @param {number} value - The cell value
 * @param {number} max - The maximum value in the dataset
 * @param {boolean} isCall - Whether this is for a call option
 * @returns {string} - The color in hex format
 */
export const getColorForValue = (value, max, isCall) => {
  // Prevent division by zero
  if (max === 0) max = 1;
  
  // For call options: purple -> blue -> green -> yellow
  // For put options: green -> yellow
  const callColors = [
    '#4A148C', '#6A1B9A', '#7B1FA2', '#9C27B0', 
    '#3949AB', '#1E88E5', '#039BE5', '#00ACC1',
    '#00897B', '#43A047', '#7CB342', '#C0CA33'
  ];
  
  const putColors = [
    '#1B5E20', '#2E7D32', '#388E3C', '#43A047', 
    '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7',
    '#C8E6C9', '#F0F4C3', '#E6EE9C', '#DCE775'
  ];
  
  const colors = isCall ? callColors : putColors;
  const ratio = Math.min(value / max, 1);
  const index = Math.floor(ratio * (colors.length - 1));
  return colors[index];
};

/**
 * Find the maximum value in a 2D array
 * @param {Array<Array<number>>} data - 2D array of numbers
 * @returns {number} - The maximum value
 */
export const getMaxValue = (data) => {
  if (!data || !data.length) return 1;
  return Math.max(...data.flat());
};

/**
 * Generate heatmap data for option prices
 * @param {Object} params - Parameter object
 * @param {number} params.strikePrice - Strike price
 * @param {number} params.timeToMaturity - Time to maturity
 * @param {number} params.riskFreeRate - Risk-free rate
 * @param {number} params.minSpotPrice - Minimum spot price
 * @param {number} params.maxSpotPrice - Maximum spot price
 * @param {number} params.minVol - Minimum volatility
 * @param {number} params.maxVol - Maximum volatility
 * @param {number} params.steps - Number of steps
 * @returns {Object} - Object with call and put heatmap data
 */
export const generateHeatmapData = (params) => {
  const { 
    strikePrice, 
    timeToMaturity, 
    riskFreeRate,
    minSpotPrice,
    maxSpotPrice,
    minVol,
    maxVol,
    steps 
  } = params;
  
  // Ensure we don't have too many steps (for performance)
  const safeSteps = Math.min(steps, 20);
  
  const spotStep = (maxSpotPrice - minSpotPrice) / (safeSteps - 1);
  const volStep = (maxVol - minVol) / (safeSteps - 1);
  
  const callData = [];
  const putData = [];
  
  for (let i = 0; i < safeSteps; i++) {
    const vol = minVol + i * volStep;
    const callRow = [];
    const putRow = [];
    
    for (let j = 0; j < safeSteps; j++) {
      const spot = minSpotPrice + j * spotStep;
      const { call, put } = calculateBlackScholes(
        spot, 
        parseFloat(strikePrice), 
        parseFloat(timeToMaturity), 
        parseFloat(riskFreeRate), 
        vol
      );
      
      callRow.push(parseFloat(call.toFixed(2)));
      putRow.push(parseFloat(put.toFixed(2)));
    }
    
    callData.push(callRow);
    putData.push(putRow);
  }
  
  return {
    callHeatmap: callData,
    putHeatmap: putData
  };
};