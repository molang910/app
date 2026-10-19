import React from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Calendar, Umbrella } from 'lucide-react';
import { DailySlot } from '../types/weather';

interface WeeklyForecastProps {
  daily: DailySlot[];
}

function getWeatherIcon(category: string, className = "w-5 h-5") {
  switch (category) {
    case 'rain':
      return <CloudRain className={`${className} text-sky-500`} />;
    case 'snow':
      return <CloudSnow className={`${className} text-indigo-400`} />;
    case 'thunder':
      return <CloudLightning className={`${className} text-amber-500`} />;
    case 'cloudy':
      return <Cloud className={`${className} text-slate-400`} />;
    default:
      return <Sun className={`${className} text-amber-500`} />;
  }
}

export const WeeklyForecast: React.FC<WeeklyForecastProps> = ({ daily }) => {
  return (
    <section id="weekly-forecast" className="scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>이번 주 학교 등교일 날씨 (주간 예보)</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            한 주 동안 비 오는 날을 미리 확인하고 우산과 체육복 일정을 준비하세요.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {daily.map((day, idx) => {
            const isWeekend = day.dayName === '토' || day.dayName === '일';
            const willRain = day.rainProb >= 40;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors ${
                  idx === 0
                    ? 'bg-sky-50/60 border-sky-300 shadow-xs'
                    : isWeekend
                    ? 'bg-slate-50/40 border-slate-100 opacity-80'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-bold ${
                      idx === 0 ? 'text-sky-700' : isWeekend ? 'text-slate-400' : 'text-slate-900'
                    }`}>
                      {idx === 0 ? '오늘' : `${day.dayName}요일`}
                    </span>
                    {!isWeekend && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        등교일
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 my-2">
                    {getWeatherIcon(day.weatherCategory, "w-6 h-6")}
                    <span className="text-xs text-slate-600 font-medium truncate">
                      {day.weatherText}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">최저 / 최고</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {day.minTemp}° / {day.maxTemp}°
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Umbrella className="w-3 h-3 text-sky-500" />
                      강수확률
                    </span>
                    <span className={`font-bold tabular-nums ${willRain ? 'text-amber-600' : 'text-slate-600'}`}>
                      {day.rainProb}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
