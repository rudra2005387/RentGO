import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const BookingCalendar = ({ onDatesSelected = () => {}, minDate = null, unavailableDates = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = selected.toISOString().split('T')[0];

    if (unavailableDates.includes(dateStr)) return;

    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(selected);
      setCheckOutDate(null);
      onDatesSelected({ checkIn: selected, checkOut: null });
    } else if (selected < checkInDate) {
      setCheckInDate(selected);
      onDatesSelected({ checkIn: selected, checkOut: checkOutDate });
    } else {
      setCheckOutDate(selected);
      onDatesSelected({ checkIn: checkInDate, checkOut: selected });
    }
  };

  const isDateUnavailable = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split('T')[0];
    return unavailableDates.includes(dateStr);
  };

  const isDateSelected = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (checkInDate && date.toDateString() === checkInDate.toDateString()) return true;
    if (checkOutDate && date.toDateString() === checkOutDate.toDateString()) return true;
    return false;
  };

  const isDateInRange = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (!checkInDate || !checkOutDate) return false;
    return date > checkInDate && date < checkOutDate;
  };

  const renderCalendar = (date) => {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">{monthName}</h3>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs sm:text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => (
            <div key={idx} className="aspect-square">
              {day ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDateClick(day)}
                  disabled={isDateUnavailable(day)}
                  className={`
                    w-full h-full text-xs sm:text-sm font-medium rounded-lg transition-all
                    ${isDateUnavailable(day)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                      : isDateSelected(day)
                      ? 'bg-blue-600 text-white'
                      : isDateInRange(day)
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-gray-50 text-gray-900 hover:bg-gray-200'
                    }
                  `}
                >
                  {day}
                </motion.button>
              ) : (
                <div />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-8"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Select Dates</h2>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaChevronLeft className="w-4 h-4 text-gray-600" />
        </motion.button>

        <p className="text-gray-600 text-sm min-w-[150px] text-center">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaChevronRight className="w-4 h-4 text-gray-600" />
        </motion.button>
      </div>

      {/* Calendar */}
      <div className="space-y-6">
        {renderCalendar(currentDate)}
      </div>

      {/* Selected Dates Display */}
      {(checkInDate || checkOutDate) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <p className="text-sm text-gray-600 mb-1">Selected Dates:</p>
          <p className="font-semibold text-gray-900">
            {checkInDate ? checkInDate.toLocaleDateString('en-US') : 'Select check-in'} →{' '}
            {checkOutDate ? checkOutDate.toLocaleDateString('en-US') : 'Select check-out'}
          </p>
          {checkInDate && checkOutDate && (
            <p className="text-xs text-gray-600 mt-2">
              {Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))} nights
            </p>
          )}
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-6 text-xs text-gray-600 space-y-1">
        <p className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-100 rounded"></span>
          Available
        </p>
        <p className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-300 rounded"></span>
          Unavailable
        </p>
        <p className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-600 rounded"></span>
          Selected
        </p>
      </div>
    </motion.div>
  );
};

export default BookingCalendar;
