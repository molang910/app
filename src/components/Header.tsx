import React from 'react';
import { Clock, MapPin, Bell, BellRing } from 'lucide-react';
import { WeatherLocation, CommuteSchedule } from '../types/weather';

interface HeaderProps {
  currentLocation: WeatherLocation;
  schedule: CommuteSchedule;
  alarmEnabled: boolean;
  onOpenScheduleModal: () => void;
  onOpenLocationModal: () => void;
  onOpenAlarmModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  schedule,
  alarmEnabled,
  onOpenScheduleModal,
  onOpenLocationModal,
  onOpenAlarmModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-lg">🎒</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
                등굣길 날씨
              </span>
              <span className="text-[11px] text-sky-600 font-semibold leading-none mt-1">
                귀여운 등하교 메이트 🐾
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#commute-summary" className="hover:text-sky-600 transition-colors whitespace-nowrap shrink-0">
            등하교 요약
          </a>
          <a href="#outfit-guide" className="hover:text-sky-600 transition-colors whitespace-nowrap shrink-0">
            교복·옷차림
          </a>
          <a href="#pe-airquality" className="hover:text-sky-600 transition-colors whitespace-nowrap shrink-0">
            체육&미세먼지
          </a>
          <a href="#bag-checklist" className="hover:text-sky-600 transition-colors whitespace-nowrap shrink-0">
            가방 체크리스트
          </a>
          <a href="#hourly-forecast" className="hover:text-sky-600 transition-colors whitespace-nowrap shrink-0">
            시간대별 예보
          </a>
          <a href="#weekly-forecast" className="hover:text-sky-600 transition-colors whitespace-nowrap shrink-0">
            주간 날씨
          </a>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Location button */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors whitespace-nowrap shrink-0 max-w-[130px] sm:max-w-[180px] cursor-pointer"
            title="학교 위치 변경"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate">{currentLocation.city}</span>
          </button>

          {/* Alarm button */}
          <button
            onClick={onOpenAlarmModal}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              alarmEnabled
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="등하교 알람 설정"
          >
            {alarmEnabled ? (
              <BellRing className="w-3.5 h-3.5 text-amber-500 animate-wiggle shrink-0" />
            ) : (
              <Bell className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className="hidden sm:inline">{alarmEnabled ? '알람 ON' : '알람'}</span>
          </button>

          {/* Commute Time schedule button */}
          <button
            onClick={onOpenScheduleModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="hidden xs:inline">등하교 시간</span>
          </button>
        </div>
      </div>
    </header>
  );
};
