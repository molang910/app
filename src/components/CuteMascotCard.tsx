import React, { useState } from 'react';
import { Sparkles, Heart, Bell, BellRing, Volume2, Umbrella, Sun } from 'lucide-react';
import { WeatherData, CommuteSchedule } from '../types/weather';
import { AlarmConfig } from '../types/alarm';
import { audioAlarm } from '../utils/audioAlarm';

interface CuteMascotCardProps {
  weather: WeatherData;
  schedule: CommuteSchedule;
  alarmConfig: AlarmConfig;
  onOpenAlarmModal: () => void;
}

const CUTE_QUOTES = [
  '냐옹! 오늘 가방에 우산이랑 물병 챙겼냥? 🐾',
  '오늘 학교에서 친구들이랑 재밌는 하루 보내자! ✨',
  '교실 에어컨이나 창문 바람 쌀쌀하면 겉옷 꼭 입어~ 🧥',
  '체육시간에 다치지 말고 신나게 뛰놀자! ⚽',
  '아침 밥 든든하게 먹고 등교했냥? 힘내자! 🍙',
  '하교할 때 날씨 다시 한번 확인하는 거 잊지 마~ 🐱',
];

export const CuteMascotCard: React.FC<CuteMascotCardProps> = ({
  weather,
  schedule,
  alarmConfig,
  onOpenAlarmModal,
}) => {
  const { current, commute } = weather;
  const isRain = commute.umbrellaAdvice.needed || current.category === 'rain';

  const mascotImg = isRain
    ? '/src/assets/images/mascot_school_rainy_1791782622101.jpg'
    : '/src/assets/images/mascot_school_sunny_1791782608833.jpg';

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [petCount, setPetCount] = useState(0);
  const [showHeart, setShowHeart] = useState(false);

  // Default dynamic message based on weather
  let defaultMessage = `안녕! 오늘 등교길은 ${commute.morning.temp}°C야. 기분 좋은 하루 보내자냥! ☀️`;
  if (commute.umbrellaAdvice.needed) {
    defaultMessage = `비 예보가 있어! 하교 때 깜짝 비 맞지 않게 접이식 우산 꼭 챙기자냥~ ☔`;
  } else if (current.tempSwing >= 10) {
    defaultMessage = `일교차가 ${current.tempSwing}°C나 된대! 겉옷 벗고 입기 편하게 챙겨가자냥~ 🧥`;
  } else if (weather.airQuality.grade === '나쁨' || weather.airQuality.grade === '매우나쁨') {
    defaultMessage = `미세먼지가 나쁨이야! 마스크 꼭꼭 쓰고 등교하자냥~ 😷`;
  }

  const handlePet = () => {
    audioAlarm.playCutePop();
    setPetCount(prev => prev + 1);
    setQuoteIndex(prev => (prev + 1) % CUTE_QUOTES.length);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  return (
    <div className="bg-gradient-to-r from-sky-100/90 via-amber-50/70 to-rose-50/80 rounded-3xl p-5 sm:p-6 border border-sky-200/80 shadow-xs relative overflow-hidden">
      {/* Decorative background clouds and sparkles */}
      <div className="absolute top-2 right-4 text-3xl opacity-30 select-none">✨</div>
      <div className="absolute bottom-2 left-6 text-3xl opacity-20 select-none">☁️</div>

      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 relative z-10">
        {/* Mascot Avatar with Interactive Click */}
        <div className="relative group shrink-0 cursor-pointer" onClick={handlePet}>
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-3 border-white shadow-md bg-white p-1 transition-transform group-hover:scale-105 active:scale-95 duration-200">
            <img
              src={mascotImg}
              alt="날씨냥이 등교 메이트"
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Cute Pet Bubble on Click */}
          {showHeart && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce">
              <Heart className="w-3 h-3 fill-white" />
              <span>골골송~</span>
            </div>
          )}

          <div className="text-[10px] text-center font-bold text-sky-800 bg-sky-200/80 px-2 py-0.5 rounded-full mt-1.5 shadow-2xs">
            날씨냥이 🐾
          </div>
        </div>

        {/* Mascot Speech Bubble & Status */}
        <div className="flex-1 text-center sm:text-left">
          {/* Speech Bubble */}
          <div className="relative bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 mb-3 inline-block sm:block text-left">
            {/* Bubble arrow pointing to avatar */}
            <div className="hidden sm:block absolute -left-2.5 top-6 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent" />

            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>오늘의 등교 메이트 한마디</span>
              </span>
              {petCount > 0 && (
                <span className="text-[11px] text-rose-500 font-medium">
                  쓰다듬기 {petCount}회 ❤️
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">
              "{petCount > 0 ? CUTE_QUOTES[quoteIndex] : defaultMessage}"
            </p>
          </div>

          {/* Alarm status & Action buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs">
            <button
              onClick={handlePet}
              className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 font-medium border border-slate-200/80 hover:border-slate-300 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <span>🐾 냥이 쓰다듬기</span>
            </button>

            <button
              onClick={onOpenAlarmModal}
              className={`px-3 py-1.5 rounded-xl font-medium border shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 ${
                alarmConfig.enabled
                  ? 'bg-amber-100/90 hover:bg-amber-200/80 text-amber-900 border-amber-300'
                  : 'bg-white/90 hover:bg-white text-slate-700 border-slate-200'
              }`}
            >
              <BellRing className={`w-3.5 h-3.5 ${alarmConfig.enabled ? 'text-amber-600 animate-pulse' : 'text-slate-400'}`} />
              <span>
                {alarmConfig.enabled
                  ? `등하교 알람 ON (${alarmConfig.notifyBeforeMinutes === 0 ? '정각' : `${alarmConfig.notifyBeforeMinutes}분 전`})`
                  : '등하교 알람 설정하기'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
