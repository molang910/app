import React, { useState } from 'react';
import { Shirt, Sparkles, Check, ChevronRight, Layers, Tag } from 'lucide-react';
import { WeatherData } from '../types/weather';

interface ClothingGuideCardProps {
  weather: WeatherData;
}

interface TempOutfitTier {
  id: string;
  range: string;
  label: string;
  uniform: string;
  outerwear: string;
  accessories: string[];
  tips: string;
}

const OUTFIT_TIERS: TempOutfitTier[] = [
  {
    id: 'hot',
    range: '28°C 이상',
    label: '한여름 / 폭염',
    uniform: '하복 셔츠 / 쿨소재 생활복, 반팔 체육복',
    outerwear: '겉옷 불필요 (교실 에어컨 바람 대비 얇은 셔츠/가디건 지참)',
    accessories: ['손선풍기', '얼음물 텀블러', '선크림', '땀 흡수용 손수건'],
    tips: '체온 조절을 위해 통풍이 잘되는 생활복 등교를 추천합니다.'
  },
  {
    id: 'warm',
    range: '23°C ~ 27°C',
    label: '초여름 / 늦봄',
    uniform: '하복 또는 얇은 춘추복 셔츠',
    outerwear: '등교 때 가벼운 린넨 셔츠나 얇은 가디건',
    accessories: ['자외선 차단제', '시원한 물병'],
    tips: '낮에는 땀이 날 수 있으니 가벼운 옷차림이 좋습니다.'
  },
  {
    id: 'mild',
    range: '17°C ~ 22°C',
    label: '완연한 봄·가을',
    uniform: '춘추복 (셔츠 + 교복 니트 조끼)',
    outerwear: '학교 후드집업, 바람막이 또는 가디건',
    accessories: ['가벼운 백팩', '물병'],
    tips: '학생들이 가장 쾌적하게 활동하기 좋은 날씨입니다.'
  },
  {
    id: 'cool',
    range: '12°C ~ 16°C',
    label: '환절기 / 선선함',
    uniform: '춘추복/동복 셔츠 + 니트/조끼',
    outerwear: '교복 마이(자켓), 도톰한 후드집업, 바람막이',
    accessories: ['따뜻한 물 텀블러'],
    tips: '아침저녁 일교차가 크므로 입고 벗기 편한 겉옷을 꼭 챙기세요.'
  },
  {
    id: 'chilly',
    range: '6°C ~ 11°C',
    label: '쌀쌀한 초겨울',
    uniform: '동복 풀세트 (셔츠 + 조끼 + 마이)',
    outerwear: '경량 패딩, 도톰한 코트, 기모 후드집업',
    accessories: ['기모 스타킹/타이즈', '립밤', '따뜻한 보온병'],
    tips: '체감온도가 낮아 쌀쌀합니다. 보온성 좋은 외투를 착용하세요.'
  },
  {
    id: 'cold',
    range: '0°C ~ 5°C',
    label: '겨울 추위',
    uniform: '동복 + 기모 내의(히트텍) 추천',
    outerwear: '숏패딩 / 롱패딩, 두꺼운 다운 자켓',
    accessories: ['핫팩', '장갑', '목도리', '보온 텀블러'],
    tips: '교실 환기 시 추울 수 있으니 교복 안에 얇은 이너를 겹쳐 입으세요.'
  },
  {
    id: 'freezing',
    range: '영하권',
    label: '한파 주의보',
    uniform: '동복 + 두꺼운 기모 내의/히트텍 필수',
    outerwear: '헤비 다운 롱패딩, 방한 외투',
    accessories: ['포켓용 핫팩', '방한 마스크', '기모 목도리', '방한 장갑'],
    tips: '피부 노출을 최소화하고 양손 주머니에 핫팩을 챙기세요!'
  }
];

export const ClothingGuideCard: React.FC<ClothingGuideCardProps> = ({ weather }) => {
  const currentTemp = weather.current.temp;

  // Find active tier for current temp
  const getInitialTierId = (t: number) => {
    if (t >= 28) return 'hot';
    if (t >= 23) return 'warm';
    if (t >= 17) return 'mild';
    if (t >= 12) return 'cool';
    if (t >= 6) return 'chilly';
    if (t >= 0) return 'cold';
    return 'freezing';
  };

  const currentTierId = getInitialTierId(currentTemp);
  const [selectedTierId, setSelectedTierId] = useState<string>(currentTierId);

  const activeTier = OUTFIT_TIERS.find(tier => tier.id === selectedTierId) || OUTFIT_TIERS[3];
  const isCurrentlyRecommended = selectedTierId === currentTierId;

  return (
    <section id="outfit-guide" className="scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>기온별 교복 & 옷차림 가이드</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            아침 기온에 딱 맞는 교복 및 외투 추천 (온도 구간을 클릭해 둘러보세요)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        {/* Tier Selector Horizontal Pills/Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 border-b border-slate-100 scrollbar-none">
          {OUTFIT_TIERS.map(tier => {
            const isToday = tier.id === currentTierId;
            const isSelected = tier.id === selectedTierId;
            return (
              <button
                key={tier.id}
                onClick={() => setSelectedTierId(tier.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{tier.range}</span>
                {isToday && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    isSelected ? 'bg-sky-400 text-slate-950' : 'bg-sky-100 text-sky-800'
                  }`}>
                    오늘 날씨
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Tier Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">
                {activeTier.range} · {activeTier.label}
              </span>
              {isCurrentlyRecommended && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  현재 체감 기온 권장 복장
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Uniform recommendation */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Shirt className="w-3.5 h-3.5 text-sky-600" />
                  <span>추천 교복 복장</span>
                </div>
                <div className="text-sm font-bold text-slate-900 leading-snug">
                  {activeTier.uniform}
                </div>
              </div>

              {/* Outerwear recommendation */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>추천 겉옷 (외투)</span>
                </div>
                <div className="text-sm font-bold text-slate-900 leading-snug">
                  {activeTier.outerwear}
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed bg-sky-50/50 p-3.5 rounded-xl border border-sky-100">
              💡 <span className="font-semibold text-sky-950">스타일 팁:</span> {activeTier.tips}
            </p>
          </div>

          {/* Accessories & Items Checklist for this tier */}
          <div className="lg:col-span-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-700 block mb-2.5">
              함께 챙기면 좋은 등교 소품
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeTier.accessories.map((acc, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-white text-slate-800 text-xs font-medium rounded-lg border border-slate-200/70 shadow-xs"
                >
                  {acc}
                </span>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-200/60 leading-relaxed">
              학교 규정 및 교실 냉난방 상황에 따라 유연하게 조절하세요.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
