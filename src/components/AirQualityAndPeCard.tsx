import React from 'react';
import { Wind, Activity, Award, ShieldAlert, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { WeatherData } from '../types/weather';

interface AirQualityAndPeCardProps {
  weather: WeatherData;
}

export const AirQualityAndPeCard: React.FC<AirQualityAndPeCardProps> = ({ weather }) => {
  const { airQuality, commute } = weather;
  const { peEvaluation } = commute;

  const getPmStatus = (val: number, type: 'pm10' | 'pm25') => {
    if (type === 'pm25') {
      if (val <= 15) return { grade: '좋음', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      if (val <= 35) return { grade: '보통', color: 'text-sky-700 bg-sky-50 border-sky-200' };
      if (val <= 75) return { grade: '나쁨', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      return { grade: '매우나쁨', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    } else {
      if (val <= 30) return { grade: '좋음', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      if (val <= 80) return { grade: '보통', color: 'text-sky-700 bg-sky-50 border-sky-200' };
      if (val <= 150) return { grade: '나쁨', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      return { grade: '매우나쁨', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    }
  };

  const pm10Status = getPmStatus(airQuality.pm10, 'pm10');
  const pm25Status = getPmStatus(airQuality.pm25, 'pm25');

  return (
    <section id="pe-airquality" className="scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>체육 수업 & 공기질 리포트</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            교육부 미세먼지 및 기상 지침 기반 야외 체육 가능 여부와 마스크 착용 가이드
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* PE Class Decision Box */}
        <div className={`lg:col-span-7 rounded-2xl p-6 border shadow-sm flex flex-col justify-between ${
          peEvaluation.canOutdoor
            ? 'bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 border-emerald-200'
            : 'bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 border-amber-200'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-white shadow-xs">
                  {peEvaluation.canOutdoor ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                </span>
                <span className="font-semibold text-slate-900 text-base">
                  오늘 야외 체육수업 판정
                </span>
              </div>

              <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                peEvaluation.canOutdoor
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {peEvaluation.badge}
              </span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed mb-5">
              {peEvaluation.reason}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200/60 text-xs">
            <div className="bg-white/80 p-3 rounded-xl border border-slate-200/60">
              <span className="text-slate-500 block">체육 복장 팁</span>
              <span className="font-semibold text-slate-900 mt-1 block">
                {peEvaluation.canOutdoor ? '학교 운동장용 체육복 + 운동화' : '실내 강당용 실내화 구비'}
              </span>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-slate-200/60">
              <span className="text-slate-500 block">권장 수분 섭취</span>
              <span className="font-semibold text-slate-900 mt-1 block">
                체육 후 충분한 수분 보충 필요
              </span>
            </div>
          </div>
        </div>

        {/* Air Quality & Mask Box */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-sky-600" />
                <span className="font-semibold text-slate-900 text-base">
                  등하굣길 미세먼지 수치
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">실시간 기준</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* PM 2.5 */}
              <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500 font-medium">초미세먼지 (PM2.5)</span>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${pm25Status.color}`}>
                    {pm25Status.grade}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {airQuality.pm25} <span className="text-xs font-normal text-slate-500">㎍/㎥</span>
                </div>
              </div>

              {/* PM 10 */}
              <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500 font-medium">미세먼지 (PM10)</span>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${pm10Status.color}`}>
                    {pm10Status.grade}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {airQuality.pm10} <span className="text-xs font-normal text-slate-500">㎍/㎥</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-sky-600" />
              <span>등교 마스크 가이드</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {airQuality.maskAdvice}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
