import React from 'react';
import { Umbrella, Wind, AlertTriangle, ShieldCheck, Shirt, ThermometerSun, MapPin } from 'lucide-react';
import { WeatherData, CommuteSchedule } from '../types/weather';

interface CommuteAlertHeroProps {
  weather: WeatherData;
  schedule: CommuteSchedule;
  onOpenScheduleModal: () => void;
  onOpenLocationModal: () => void;
}

export const CommuteAlertHero: React.FC<CommuteAlertHeroProps> = ({
  weather,
  schedule,
  onOpenScheduleModal,
  onOpenLocationModal,
}) => {
  const { current, commute, airQuality, location } = weather;
  const { umbrellaAdvice } = commute;

  // Determine illustration asset
  let heroImage = '/src/assets/images/school_commute_morning_1791781795584.jpg';
  let bannerTheme = 'clear';

  if (umbrellaAdvice.needed || current.category === 'rain') {
    heroImage = '/src/assets/images/school_commute_rainy_1791781808385.jpg';
    bannerTheme = 'rain';
  } else if (current.feelsLike <= 12 || current.tempSwing >= 10) {
    heroImage = '/src/assets/images/school_commute_chilly_1791781819929.jpg';
    bannerTheme = 'chilly';
  }

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-900 text-white min-h-[380px] sm:min-h-[420px] flex flex-col justify-end">
      {/* Background Image with Fallback */}
      <img
        src={heroImage}
        alt="학생 등굣길 일러스트"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-700 hover:scale-105"
      />

      {/* Measured Dark Scrim for WCAG AA 4.5:1 text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/30" />

      {/* Hero Content */}
      <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col justify-between h-full">
        {/* Top Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-200">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
            <MapPin className="w-4 h-4 text-sky-400" />
            <span className="font-medium text-white">{location.city}</span>
            <button
              onClick={onOpenLocationModal}
              className="text-sky-300 hover:text-sky-200 underline ml-1 cursor-pointer"
            >
              위치 변경
            </button>
          </div>

          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
            <span className="text-slate-300">등교 {schedule.morningTime}</span>
            <span className="text-white/40">·</span>
            <span className="text-slate-300">하교 {schedule.afternoonTime}</span>
            {schedule.hasNightStudy && (
              <>
                <span className="text-white/40">·</span>
                <span className="text-slate-300">야자 {schedule.nightTime}</span>
              </>
            )}
            <button
              onClick={onOpenScheduleModal}
              className="text-sky-300 hover:text-sky-200 underline ml-1 cursor-pointer"
            >
              시간 수정
            </button>
          </div>
        </div>

        {/* Central Headline & Core Weather Status */}
        <div className="mt-8 mb-6">
          {/* Urgent Umbrella Alert Banner */}
          {umbrellaAdvice.needed ? (
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-sm font-medium mb-4 backdrop-blur-md">
              <Umbrella className="w-5 h-5 text-amber-300 shrink-0" />
              <span>{umbrellaAdvice.title}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-200 text-sm font-medium mb-4 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-sky-300 shrink-0" />
              <span>우산 없이 가볍게 등교해도 좋아요</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 leading-tight">
                {current.tempSwing >= 10
                  ? `일교차 ${current.tempSwing}°C! 겉옷 챙겨서 등교하세요`
                  : umbrellaAdvice.needed
                  ? '오늘 비 예보가 있어요! 가방에 우산 잊지 마세요'
                  : '상쾌하고 맑은 등굣길! 활기차게 출발하세요'}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                {umbrellaAdvice.subtitle}
              </p>
            </div>

            {/* Current Temperature Badge */}
            <div className="lg:col-span-4 flex items-end justify-start lg:justify-end gap-4">
              <div className="text-left lg:text-right">
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-white tabular-nums">
                  {current.temp}°C
                </div>
                <div className="text-xs sm:text-sm text-slate-300 flex items-center lg:justify-end gap-2 mt-1">
                  <span>체감 {current.feelsLike}°C</span>
                  <span className="text-white/40">·</span>
                  <span>{current.condition}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 tabular-nums">
                  최저 {current.minTemp}°C / 최고 {current.maxTemp}°C (일교차 {current.tempSwing}°C)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Quick Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/10 text-xs sm:text-sm">
          <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-xs">등교 시간 기온</span>
            <span className="font-semibold text-white text-base tabular-nums mt-0.5 block">
              {commute.morning.temp}°C
            </span>
            <span className="text-[11px] text-slate-300">비 확률 {commute.morning.rainProb}%</span>
          </div>

          <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-xs">하교 시간 기온</span>
            <span className="font-semibold text-white text-base tabular-nums mt-0.5 block">
              {commute.afternoon.temp}°C
            </span>
            <span className="text-[11px] text-slate-300">비 확률 {commute.afternoon.rainProb}%</span>
          </div>

          <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-xs">미세먼지 상태</span>
            <span className={`font-semibold text-base mt-0.5 block ${
              airQuality.grade === '좋음' ? 'text-emerald-300' :
              airQuality.grade === '보통' ? 'text-sky-300' :
              airQuality.grade === '나쁨' ? 'text-amber-300' : 'text-rose-300'
            }`}>
              {airQuality.grade} (PM2.5 {airQuality.pm25}㎍)
            </span>
            <span className="text-[11px] text-slate-300 truncate block">{airQuality.maskAdvice}</span>
          </div>

          <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-xs">오늘 체육 시간</span>
            <span className={`font-semibold text-base mt-0.5 block ${
              commute.peEvaluation.canOutdoor ? 'text-emerald-300' : 'text-amber-300'
            }`}>
              {commute.peEvaluation.badge}
            </span>
            <span className="text-[11px] text-slate-300 truncate block">교육부 권장 기준</span>
          </div>
        </div>
      </div>
    </div>
  );
};
