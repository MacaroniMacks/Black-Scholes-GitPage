import React, { useRef, useEffect, useState, useMemo } from 'react';

const Heatmap = ({ 
  inputs, 
  heatmapParams,
  heatmapData,
  getColorForValue,
  getMaxValue
}) => {
  // Refs to access the grid elements directly
  const callGridRef = useRef(null);
  const putGridRef = useRef(null);
  
  // State to store grid cell positions
  const [callCellPositions, setCallCellPositions] = useState([]);
  const [putCellPositions, setPutCellPositions] = useState([]);
  
  // Calculate grid cell positions when grid or parameters change
  useEffect(() => {
    if (callGridRef.current && heatmapData?.callHeatmap?.length > 0) {
      const cellElements = callGridRef.current.children;
      const positions = [];
      
      // Get positions of the bottom row cells (assuming grid fills row by row)
      const bottomRowStartIndex = cellElements.length - heatmapParams.steps;
      
      for (let i = 0; i < heatmapParams.steps; i++) {
        const cellIndex = bottomRowStartIndex + i;
        if (cellElements[cellIndex]) {
          const rect = cellElements[cellIndex].getBoundingClientRect();
          const gridRect = callGridRef.current.getBoundingClientRect();
          
          // Calculate position relative to the grid container
          positions.push({
            index: i,
            position: (rect.left + rect.width / 2) - gridRect.left
          });
        }
      }
      
      setCallCellPositions(positions);
    }
    
    if (putGridRef.current && heatmapData?.putHeatmap?.length > 0) {
      const cellElements = putGridRef.current.children;
      const positions = [];
      
      // Get positions of the bottom row cells (assuming grid fills row by row)
      const bottomRowStartIndex = cellElements.length - heatmapParams.steps;
      
      for (let i = 0; i < heatmapParams.steps; i++) {
        const cellIndex = bottomRowStartIndex + i;
        if (cellElements[cellIndex]) {
          const rect = cellElements[cellIndex].getBoundingClientRect();
          const gridRect = putGridRef.current.getBoundingClientRect();
          
          // Calculate position relative to the grid container
          positions.push({
            index: i,
            position: (rect.left + rect.width / 2) - gridRect.left
          });
        }
      }
      
      setPutCellPositions(positions);
    }
  }, [heatmapParams, heatmapData]);

  // Improved color gradient function using HSL for smoother transitions
  const getRedGreenColorForValue = (value, max) => {
    if (max === 0) max = 1; // Prevent division by zero
    
    // Calculate the ratio (0 to 1)
    const ratio = Math.min(value / max, 1);
    
    // Use HSL color space for more pleasing gradients
    // Hue: 120 is green, 0 is red
    // Start with green (low values) and transition to red (high values)
    const hue = 120 - (ratio * 120);
    
    // Adjust saturation and lightness for a more professional look
    const saturation = 70; // Consistent saturation
    const lightness = 40 + (ratio * 8.5); // Slightly brighter for higher values
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };
  
  // Generate an array of colors for the legend scale
  const generateScaleColors = (steps) => {
    const colors = [];
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      
      // Use the same HSL approach, but reversed for the legend (red at top)
      const hue = ratio * 120;
      const saturation = 75;
      const lightness = 50 - (ratio * 10);
      
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
  };
  
  // Generate X-axis price labels based on grid size
  const generatePriceLabels = (min, max, steps) => {
    const labels = [];
    
    // For small grid sizes, show fewer labels to avoid crowding
    const skipFactor = steps > 8 ? 1 : 2;
    
    for (let i = 0; i < steps; i += skipFactor) {
      const price = min + i * ((max - min) / (steps - 1));
      labels.push({
        index: i,
        price: price
      });
    }
    
    // Always show the last price
    if (labels[labels.length - 1]?.index !== steps - 1) {
      labels.push({
        index: steps - 1,
        price: max
      });
    }
    
    return labels;
  };
  
  // Generate colors for legend - match number of steps with the grid
  const legendColors = generateScaleColors(heatmapParams.steps);
  
  // Generate price labels for both heatmaps - use useMemo to avoid unnecessary recalculations
  const callPriceLabels = useMemo(() => generatePriceLabels(
    heatmapParams.minSpotPrice,
    heatmapParams.maxSpotPrice,
    heatmapParams.steps
  ), [heatmapParams.minSpotPrice, heatmapParams.maxSpotPrice, heatmapParams.steps]);
  
  const putPriceLabels = useMemo(() => generatePriceLabels(
    heatmapParams.minSpotPrice,
    heatmapParams.maxSpotPrice,
    heatmapParams.steps
  ), [heatmapParams.minSpotPrice, heatmapParams.maxSpotPrice, heatmapParams.steps]);

  /**
   * Generates dynamic ticks based on a data range
   * @param {number} min - The minimum value in the data
   * @param {number} max - The maximum value in the data
   * @param {number} maxTicks - The maximum number of ticks to generate (default: 8)
   * @returns {number[]} - Array of tick values
   */
  const generateDynamicTicks = (min, max, maxTicks = 8) => {
    // Handle edge cases
    if (min === max) {
      return [min];
    }
    
    // Find a nice rounded range that covers the data
    // Add a small buffer (5%) to avoid having ticks right at the edges
    const buffer = (max - min) * 0.05;
    const roundedMin = Math.max(0, Math.floor(min - buffer));
    const roundedMax = Math.ceil(max + buffer);
    const range = roundedMax - roundedMin;
    
    // Calculate the ideal step size to get evenly spaced ticks
    let step = Math.ceil(range / (maxTicks - 1));
    
    // Generate ticks using the step size starting from the rounded minimum
    const ticks = [];
    let currentTick = roundedMin;
    
    while (currentTick <= roundedMax && ticks.length < maxTicks) {
      ticks.push(currentTick);
      currentTick += step;
    }
    
    return ticks;
  };

  // Render legend with dynamic tick marks
  const renderLegend = (heatmapData) => {
    // Ensure we have a valid 2D array
    if (!heatmapData || !heatmapData.length || !heatmapData[0].length) {
      return null;
    }

    // Flatten the 2D array
    const flatValues = heatmapData.flat().filter(value => !isNaN(value));
    
    // If no valid values, return null
    if (flatValues.length === 0) {
      return null;
    }
    
    // Find min and max values
    const minVal = Math.min(...flatValues);
    const maxVal = Math.max(...flatValues);
    
    // Generate ticks that will be evenly spaced after rounding
    const tickValues = generateDynamicTicks(minVal, maxVal, 8);
    
    return (
      <>
        {tickValues.map((value, index, array) => {
          // Reverse the index to put higher values at the top
          const reversedIndex = array.length - 1 - index;
          
          // Simply position based on reversed index - evenly spaced
          // This ensures equal spacing regardless of value differences
          const tickCount = array.length;
          const spaceBetween = (96) / (tickCount - 1); // 96% usable space (2% padding top/bottom)
          const position = 2 + (reversedIndex * spaceBetween); // Start at 2% (padding)
          
          return (
            <div 
              key={`legend-tick-${index}-${value}`}
              className="absolute flex items-center"
              style={{ 
                left: 0,
                top: `${position}%`, 
                transform: 'translateY(-50%)',
                width: '100%',
                paddingRight: '0px'
              }}
            >
              {/* Tick line */}
              <div 
                className="w-2 h-0.5 bg-white" 
                style={{ 
                  marginLeft: '-1px'
                }}
              ></div>
              
              {/* Tick value - smaller font, no background */}
              <div 
                className="ml-1 text-white"
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '0.6rem'
                }}
              >
                {value}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  // Memoize the rendered legends to improve performance and track changes
  // Include heatmapParams in dependencies to ensure updates when grid size changes
  const callLegend = useMemo(() => 
    heatmapData?.callHeatmap ? renderLegend(heatmapData.callHeatmap) : null, 
    [heatmapData?.callHeatmap, heatmapParams.steps, heatmapParams.minVol, heatmapParams.maxVol]
  );
  
  const putLegend = useMemo(() => 
    heatmapData?.putHeatmap ? renderLegend(heatmapData.putHeatmap) : null, 
    [heatmapData?.putHeatmap, heatmapParams.steps, heatmapParams.minVol, heatmapParams.maxVol]
  );
  
  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-900">
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Option Price Heatmaps</h2>
        
        <div className="text-center mb-4 text-sm text-gray-300">
          <p>Spot Price: ${parseFloat(inputs.stockPrice).toFixed(2)} | Strike: ${parseFloat(inputs.strikePrice).toFixed(2)} | 
             Time: {parseFloat(inputs.timeToMaturity).toFixed(2)} yr | 
            Rate: {(parseFloat(inputs.riskFreeRate) * 100).toFixed(2)}%</p>
        </div>
        
        {/* Display both heatmaps side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Call Option Heatmap */}
          <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
            <div className="flex">
              {/* Y-axis Label (Volatility) */}
              <div className="w-6 flex flex-col justify-center items-center mr-3">
                <div className="transform -rotate-90 text-xs font-medium text-gray-300 whitespace-nowrap">
                  Volatility
                </div>
              </div>
              
              <div className="flex-1">
                {/* Move the title here to center it over the grid */}
                <div className="mb-2 font-semibold text-lg text-center text-gray-200 pl-12 mr-14">
                  Call Option Price
                </div>
                
                <div className="flex">
                  {/* Y-axis labels container with same aspect ratio as the grid */}
                  <div className="w-6 flex flex-col pr-1">
                    {Array.from({ length: heatmapParams.steps }).map((_, i) => (
                      <div 
                        key={`y-axis-call-${i}`} 
                        className="text-xs text-right text-gray-300 flex items-center justify-end"
                        style={{ 
                          flex: '1 1 0%', /* Equal flex to match grid cell size */
                          paddingRight: '4px'
                        }}
                      >
                        {(heatmapParams.minVol + i * ((heatmapParams.maxVol - heatmapParams.minVol) / (heatmapParams.steps - 1))).toFixed(2)}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex-1 relative">
                    {heatmapData?.callHeatmap?.length > 0 ? (
                      <div 
                        ref={callGridRef}
                        className="grid w-full aspect-square" 
                        style={{ 
                          gridTemplateColumns: `repeat(${heatmapParams.steps}, 1fr)`,
                          gridTemplateRows: `repeat(${heatmapParams.steps}, 1fr)`,
                          gap: '0px',
                        }}
                      >
                        {heatmapData.callHeatmap.map((row, i) =>
                          row.map((value, j) => (
                            <div
                              key={`call-${i}-${j}`}
                              className="flex items-center justify-center text-xs font-medium"
                              style={{
                                backgroundColor: getRedGreenColorForValue(value, getMaxValue(heatmapData.callHeatmap)),
                                color: value > getMaxValue(heatmapData.callHeatmap) / 2 ? 'white' : 'black'
                              }}
                              title={`Spot: ${(heatmapParams.minSpotPrice + j * ((heatmapParams.maxSpotPrice - heatmapParams.minSpotPrice) / (heatmapParams.steps - 1))).toFixed(2)}, Vol: ${(heatmapParams.minVol + i * ((heatmapParams.maxVol - heatmapParams.minVol) / (heatmapParams.steps - 1))).toFixed(2)}, Price: ${value}`}
                            >
                              {value}
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-600 rounded">
                        <p className="text-gray-300">Loading heatmap data...</p>
                      </div>
                    )}
                    
                    {/* X-axis Labels (Spot Price) - Directly aligned with grid cells */}
                    <div className="absolute w-full left-0 top-full">
                      {callPriceLabels.map((label) => {
                        // Find the corresponding grid cell position
                        const cellPosition = callCellPositions.find(pos => pos.index === label.index);
                        
                        return (
                          <div 
                            key={`x-label-call-${label.index}`} 
                            className="absolute text-center text-xs text-gray-300"
                            style={{ 
                              left: cellPosition ? `${cellPosition.position}px` : `${(label.index / (heatmapParams.steps - 1)) * 100}%`,
                              transform: 'translateX(-50%)',
                              top: '8px'
                            }}
                          >
                            ${label.price.toFixed(0)}
                          </div>
                        );
                      })}
                      
                      {/* Ticks for all grid cells */}
                      {callCellPositions.map((pos) => (
                        <div 
                          key={`x-tick-call-${pos.index}`}
                          className="absolute w-0.5 h-1.5 bg-gray-500"
                          style={{
                            left: `${pos.position}px`,
                            transform: 'translateX(-50%)',
                            top: '2px'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Color Legend Container - height will match the grid due to flex layout */}
                  <div className="ml-2 flex relative">
                    {/* Gradient legend bar */}
                    <div className="flex flex-col w-4">
                      <div className="h-full relative overflow-hidden flex flex-col border border-gray-600">
                        {/* Smooth gradient background */}
                        <div 
                          className="absolute w-full h-full" 
                          style={{ 
                            background: `linear-gradient(to bottom, hsl(0, 100.00%, 50.00%), hsl(60, 75%, 45%), hsl(120, 100.00%, 50.00%))`
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Separate div for tick marks to the right of legend */}
                    <div className="relative h-full w-8" style={{ padding: '2px 0' }}>
                      {callLegend}
                    </div>
                  </div>
                </div>
                
                <div className="text-center text-xs font-medium text-gray-300 mt-6 pl-6">
                  Spot Price
                </div>
              </div>
            </div>
          </div>
          
          {/* Put Option Heatmap */}
          <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
            <div className="flex">
              {/* Y-axis Label (Volatility) */}
              <div className="w-6 flex flex-col justify-center items-center mr-3">
                <div className="transform -rotate-90 text-xs font-medium text-gray-300 whitespace-nowrap">
                  Volatility
                </div>
              </div>
              
              <div className="flex-1">
                {/* Move the title here to center it over the grid */}
                <div className="mb-2 font-semibold text-lg text-center text-gray-200 pl-12 mr-14">
                  Put Option Price
                </div>
                
                <div className="flex">
                  {/* Y-axis labels container with same aspect ratio as the grid */}
                  <div className="w-6 flex flex-col pr-1">
                    {Array.from({ length: heatmapParams.steps }).map((_, i) => (
                      <div 
                        key={`y-axis-put-${i}`} 
                        className="text-xs text-right text-gray-300 flex items-center justify-end"
                        style={{ 
                          flex: '1 1 0%', /* Equal flex to match grid cell size */
                          paddingRight: '4px'
                        }}
                      >
                        {(heatmapParams.minVol + i * ((heatmapParams.maxVol - heatmapParams.minVol) / (heatmapParams.steps - 1))).toFixed(2)}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex-1 relative">
                    {heatmapData?.putHeatmap?.length > 0 ? (
                      <div 
                        ref={putGridRef}
                        className="grid w-full aspect-square" 
                        style={{ 
                          gridTemplateColumns: `repeat(${heatmapParams.steps}, 1fr)`,
                          gridTemplateRows: `repeat(${heatmapParams.steps}, 1fr)`,
                          gap: '0px',
                        }}
                      >
                        {heatmapData.putHeatmap.map((row, i) =>
                          row.map((value, j) => (
                            <div
                              key={`put-${i}-${j}`}
                              className="flex items-center justify-center text-xs font-medium"
                              style={{
                                backgroundColor: getRedGreenColorForValue(value, getMaxValue(heatmapData.putHeatmap)),
                                color: value > getMaxValue(heatmapData.putHeatmap) / 2 ? 'white' : 'black'
                              }}
                              title={`Spot: $${(heatmapParams.minSpotPrice + j * ((heatmapParams.maxSpotPrice - heatmapParams.minSpotPrice) / (heatmapParams.steps - 1))).toFixed(2)}, Vol: ${(heatmapParams.minVol + i * ((heatmapParams.maxVol - heatmapParams.minVol) / (heatmapParams.steps - 1))).toFixed(2)}, Price: $${value}`}
                            >
                              {value}
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-600 rounded">
                        <p className="text-gray-300">Loading heatmap data...</p>
                      </div>
                    )}
                    
                    {/* X-axis Labels (Spot Price) - Directly aligned with grid cells */}
                    <div className="absolute w-full left-0 top-full">
                      {putPriceLabels.map((label) => {
                        // Find the corresponding grid cell position
                        const cellPosition = putCellPositions.find(pos => pos.index === label.index);
                        
                        return (
                          <div 
                            key={`x-label-put-${label.index}`} 
                            className="absolute text-center text-xs text-gray-300"
                            style={{ 
                              left: cellPosition ? `${cellPosition.position}px` : `${(label.index / (heatmapParams.steps - 1)) * 100}%`,
                              transform: 'translateX(-50%)',
                              top: '8px'
                            }}
                          >
                            ${label.price.toFixed(0)}
                          </div>
                        );
                      })}
                      
                      {/* Ticks for all grid cells */}
                      {putCellPositions.map((pos) => (
                        <div 
                          key={`x-tick-put-${pos.index}`}
                          className="absolute w-0.5 h-1.5 bg-gray-500"
                          style={{
                            left: `${pos.position}px`,
                            transform: 'translateX(-50%)',
                            top: '2px'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Color Legend Container - height will match the grid due to flex layout */}
                  <div className="ml-2 flex relative">
                    {/* Gradient legend bar */}
                    <div className="flex flex-col w-4">
                      <div className="h-full relative overflow-hidden flex flex-col border border-gray-600">
                        {/* Smooth gradient background */}
                        <div 
                          className="absolute w-full h-full" 
                          style={{ 
                            background: `linear-gradient(to bottom, hsl(0, 100.00%, 50.00%), hsl(60, 75%, 45%), hsl(120, 100.00%, 50.00%))`
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Separate div for tick marks to the right of legend */}
                    <div className="relative h-full w-8" style={{ padding: '2px 0' }}>
                      {putLegend}
                    </div>
                  </div>
                </div>
                
                <div className="text-center text-xs font-medium text-gray-300 mt-6 pl-6">
                  Spot Price
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-400 text-center">
          <p>These heatmaps show how option prices change with varying spot prices and volatility levels.</p>
          <p>The striking price remains constant at ${parseFloat(inputs.strikePrice).toFixed(2)}.</p>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;