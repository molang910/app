import React from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Clock, Umbrella } from 'lucide-react';
import { HourlySlot } from '../types/weather';

interface HourlyTimelineProps {
  hourly: HourlySlot[];
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

export const HourlyTimeline: React.FC<HourlyTimelineProps> = ({ hourly }) => {
  return (
    <section id="hourly-forecast" className="scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>24시간 등하교 타임라인</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            등교 시간대와 하교 시간대가 표시된 시간별 기온 및 비 올 확률
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Timeline Horizontal Scroll */}
        <div className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
          {hourly.map((slot, idx) => {
            const isHighlighted = slot.isSchoolMorning || slot.isSchoolAfternoon || slot.isNightStudy;

            return (
              <div
                key={idx}
                className={`flex flex-col items-center justify-between p-3 rounded-xl min-w-[84px] text-center shrink-0 border transition-colors ${
                  slot.isSchoolMorning
                    ? 'bg-sky-50/70 border-sky-200'
                    : slot.isSchoolAfternoon
                    ? 'bg-amber-50/70 border-amber-200'
                    : slot.isNightStudy
                    ? 'bg-indigo-50/70 border-indigo-200'
                    : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                }`}
              >
                {/* School Period Badge */}
                <div className="h-4 mb-1">
                  {slot.isSchoolMorning && (
                    <span className="text-[10px] font-bold text-sky-700 whitespace-nowrap">
                      등교
                    </span>
                  )}
                  {slot.isSchoolAfternoon && (
                    <span className="text-[10px] font-bold text-amber-700 whitespace-nowrap">
                      하교
                    </span>
                  )}
                  {slot.isNightStudy && (
                    <span className="text-[10px] font-bold text-indigo-700 whitespace-nowrap">
                      야자
                    </span>
                  )}
                </div>

                {/* Time */}
                <span className="text-xs font-semibold text-slate-700 font-mono">
                  {slot.time}
                </span>

                {/* Icon */}
                <div className="my-2.5">
                  {getWeatherIcon(slot.weatherCategory)}
                </div>

                {/* Temperature */}
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  {slot.temp}°
                </span>

                {/* Rain probability */}
                <div className="mt-2 text-[11px] font-medium flex items-center justify-center gap-0.5 tabular-nums">
                  <Umbrella className="w-3 h-3 text-sky-500" />
                  <span className={slot.rainProb >= 40 ? 'text-amber-600 font-bold' : 'text-slate-500'}>
                    {slot.rainProb}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span>등교 시간대 (07~09시)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>하교 시간대 (15~18시)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span>야자/학원 귀가 (21~23시)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
