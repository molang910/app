import React from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, ArrowRight, Umbrella, Shirt, AlertCircle } from 'lucide-react';
import { WeatherData, CommuteSchedule } from '../types/weather';

interface CommuteSlotsCardProps {
  weather: WeatherData;
  schedule: CommuteSchedule;
}

function getWeatherIcon(category: string, className = "w-6 h-6") {
  switch (category) {
    case 'rain':
      return <CloudRain className={`${className} text-sky-500`} />;
    case 'snow':
      return <CloudSnow className={`${className} text-indigo-400`} />;
    case 'thunder':
      return <CloudLightning className={`${className} text-amber-500`} />;
    case 'cloudy':
      return <Cloud className={`${className} text-slate-500`} />;
    default:
      return <Sun className={`${className} text-amber-500`} />;
  }
}

export const CommuteSlotsCard: React.FC<CommuteSlotsCardProps> = ({ weather, schedule }) => {
  const { commute, current } = weather;
  const { morning, afternoon, evening } = commute;

  return (
    <section id="commute-summary" className="scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>등하교 구간별 맞춤 예보</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            학생이 실제로 길을 걷는 등교 시간과 하교 시간대의 체감 날씨를 비교합니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Slot 1: Morning Commute */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-sky-300 transition-colors flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
                오전 등교길
              </span>
              <span className="text-xs font-mono text-slate-500 font-medium">
                {schedule.morningTime} 기준
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {morning.temp}°C
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  체감 {morning.feelsLike ?? morning.temp}°C · {morning.condition}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                {getWeatherIcon(morning.category, "w-8 h-8")}
              </div>
            </div>

            {/* Rain Probability Bar */}
            <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Umbrella className="w-3.5 h-3.5 text-sky-600" />
                  비 올 확률
                </span>
                <span className={`font-bold tabular-nums ${morning.rainProb >= 40 ? 'text-amber-600' : 'text-slate-700'}`}>
                  {morning.rainProb}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    morning.rainProb >= 40 ? 'bg-amber-500' : 'bg-sky-500'
                  }`}
                  style={{ width: `${Math.min(100, morning.rainProb)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-2">
            <Shirt className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">추천 복장: </span>
              {morning.temp <= 10
                ? '동복 + 도톰한 패딩/코트 필수'
                : morning.temp <= 16
                ? '춘추복 + 가디건 또는 후드집업'
                : morning.temp <= 23
                ? '춘추복 긴팔 또는 생활복'
                : '시원한 하복 / 반팔 체육복'}
            </div>
          </div>
        </div>

        {/* Slot 2: Afternoon Dismissal */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-amber-300 transition-colors flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                오후 하교길
              </span>
              <span className="text-xs font-mono text-slate-500 font-medium">
                {schedule.afternoonTime} 기준
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {afternoon.temp}°C
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  체감 {afternoon.feelsLike ?? afternoon.temp}°C · {afternoon.condition}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                {getWeatherIcon(afternoon.category, "w-8 h-8")}
              </div>
            </div>

            {/* Rain Probability Bar */}
            <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Umbrella className="w-3.5 h-3.5 text-amber-600" />
                  비 올 확률
                </span>
                <span className={`font-bold tabular-nums ${afternoon.rainProb >= 40 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {afternoon.rainProb}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    afternoon.rainProb >= 40 ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, afternoon.rainProb)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">하교 포인트: </span>
              {afternoon.rainProb >= 40
                ? '아침에 맑았어도 하교 때 비 예보! 우산 챙기기'
                : afternoon.temp - morning.temp >= 7
                ? `아침보다 ${afternoon.temp - morning.temp}°C 높음! 겉옷 벗을 준비`
                : '활동하기 쾌적하며 비 걱정 없이 귀가 가능'}
            </div>
          </div>
        </div>

        {/* Slot 3: Evening Study / Academy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-indigo-300 transition-colors flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                야자·학원 귀가길
              </span>
              <span className="text-xs font-mono text-slate-500 font-medium">
                {schedule.hasNightStudy ? `${schedule.nightTime} 기준` : '야간 귀가 대비'}
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {evening.temp}°C
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  야간 기온 · {evening.condition}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                {getWeatherIcon(evening.category, "w-8 h-8")}
              </div>
            </div>

            {/* Rain Probability Bar */}
            <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Umbrella className="w-3.5 h-3.5 text-indigo-600" />
                  비 올 확률
                </span>
                <span className={`font-bold tabular-nums ${evening.rainProb >= 40 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {evening.rainProb}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-indigo-500"
                  style={{ width: `${Math.min(100, evening.rainProb)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-2">
            <Shirt className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">야간 주의: </span>
              {afternoon.temp - evening.temp >= 5
                ? '해 질 무렵 기온 급강하! 밤 늦게 귀가 시 겉옷 필수'
                : '기온 차이가 완만하여 편안하게 귀가할 수 있습니다'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
