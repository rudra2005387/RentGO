import { useState } from 'react';
import { motion } from 'framer-motion';

const PriceRangeSlider = ({ value, onChange, min = 0, max = 10000 }) => {
  const [localValue, setLocalValue] = useState(value);

  const handleMinChange = (e) => {
    const newMin = Math.min(Number(e.target.value), localValue[1]);
    const newValue = [newMin, localValue[1]];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleMaxChange = (e) => {
    const newMax = Math.max(Number(e.target.value), localValue[0]);
    const newValue = [localValue[0], newMax];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      {/* Slider Visualization */}
      <div className="relative h-2 bg-gray-200 rounded-full">
        <motion.div
          className="absolute h-2 bg-blue-600 rounded-full"
          initial={false}
          animate={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        />
      </div>

      {/* Input Sliders */}
      <div className="relative h-8">
        <input
          type="range"
          min={min}
          max={max}
          value={localValue[0]}
          onChange={handleMinChange}
          className="absolute w-full h-2 top-3 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:border-0"
          style={{ zIndex: localValue[0] > max - (max - min) / 2 ? 5 : 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={localValue[1]}
          onChange={handleMaxChange}
          className="absolute w-full h-2 top-3 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:border-0"
          style={{ zIndex: localValue[1] < max - (max - min) / 2 ? 5 : 3 }}
        />
      </div>

      {/* Display Values */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Min:</span>
          <span className="text-lg font-bold text-blue-600">${localValue[0]}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Max:</span>
          <span className="text-lg font-bold text-blue-600">${localValue[1]}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
