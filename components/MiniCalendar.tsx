import React, { useState } from 'react';
import type { BeautyEvent } from '../types';

interface MiniCalendarProps {
  events: BeautyEvent[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ events, selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const hasEventOnDate = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return events.some(event => {
      const eventStart = new Date(event.date).toISOString().split('T')[0];
      if (event.endDate) {
        const eventEnd = new Date(event.endDate).toISOString().split('T')[0];
        return dateStr >= eventStart && dateStr <= eventEnd;
      }
      return dateStr === eventStart;
    });
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0];
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(newMonth);
    onDateSelect(newMonth); // 親コンポーネントにも通知
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(newMonth);
    onDateSelect(newMonth); // 親コンポーネントにも通知
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateSelect(newDate);
  };

  const renderDays = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const day = i - startingDayOfWeek + 1;
      const isValidDay = day > 0 && day <= daysInMonth;
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const hasEvent = isValidDay && hasEventOnDate(date);
      const isSelected = isValidDay && isSameDay(date, selectedDate);
      const isToday = isValidDay && isSameDay(date, new Date());

      days.push(
        <button
          key={i}
          onClick={() => isValidDay && handleDayClick(day)}
          disabled={!isValidDay}
          className={`
            aspect-square p-1 text-sm relative
            ${!isValidDay ? 'invisible' : ''}
            ${isSelected ? 'bg-rose-500 text-white font-bold rounded-full' : ''}
            ${!isSelected && isToday ? 'border-2 border-rose-400 rounded-full font-semibold' : ''}
            ${!isSelected && !isToday && hasEvent ? 'font-semibold text-rose-600' : ''}
            ${!isSelected && !isToday && !hasEvent ? 'text-gray-700 hover:bg-rose-50 rounded-full' : ''}
            transition-colors
          `}
        >
          {isValidDay && day}
          {isValidDay && hasEvent && !isSelected && (
            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-rose-500 rounded-full"></span>
          )}
        </button>
      );
    }

    return days;
  };

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
          aria-label="前月"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 className="text-lg font-bold text-gray-800">
          {currentMonth.getFullYear()}年 {monthNames[currentMonth.getMonth()]}
        </h3>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
          aria-label="次月"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 p-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
          <span className="text-gray-600">イベントあり</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 border-2 border-rose-400 rounded-full"></span>
          <span className="text-gray-600">今日</span>
        </div>
      </div>
    </div>
  );
};

export default MiniCalendar;
