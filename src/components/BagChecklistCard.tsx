import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, RotateCcw, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { WeatherData, ChecklistItem } from '../types/weather';

interface BagChecklistCardProps {
  weather: WeatherData;
}

export const BagChecklistCard: React.FC<BagChecklistCardProps> = ({ weather }) => {
  const { checklist } = weather;
  const storageKey = `school_bag_checklist_${new Date().toISOString().slice(0, 10)}`;

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checkedItems));
    } catch {
      //
    }
  }, [checkedItems, storageKey]);

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleReset = () => {
    setCheckedItems({});
  };

  const totalCount = checklist.length;
  const packedCount = checklist.filter(item => checkedItems[item.id]).length;
  const isAllPacked = totalCount > 0 && packedCount === totalCount;

  return (
    <section id="bag-checklist" className="scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>등교 가방 준비물 체크리스트</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            오늘 날씨 분석 결과에 맞춰 등교 전 가방에 챙길 필수 아이템
          </p>
        </div>

        {packedCount > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer px-2.5 py-1 rounded-md hover:bg-slate-100"
            title="체크리스트 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>초기화</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        {/* Progress Strip */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">
              가방 준비 진행률:
            </span>
            <span className="text-sm font-bold text-sky-600 tabular-nums">
              {packedCount} / {totalCount} 완료
            </span>
          </div>

          {isAllPacked && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>오늘 준비물 완벽히 챙겼어요! 🎒</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isAllPacked ? 'bg-emerald-500' : 'bg-sky-500'
            }`}
            style={{ width: `${(packedCount / (totalCount || 1)) * 100}%` }}
          />
        </div>

        {/* Items List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklist.map(item => {
            const isChecked = Boolean(checkedItems[item.id]);
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  isChecked
                    ? 'bg-slate-50/80 border-slate-200 text-slate-400'
                    : item.urgent
                    ? 'bg-amber-50/40 border-amber-200/80 hover:bg-amber-50/80'
                    : 'bg-white border-slate-200/80 hover:border-sky-300 hover:shadow-xs'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className={`w-5 h-5 ${item.urgent ? 'text-amber-500' : 'text-slate-400'}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold truncate ${
                      isChecked ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}>
                      {item.item}
                    </span>
                    {item.urgent && !isChecked && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                        필수 지참
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 leading-normal ${
                    isChecked ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {item.note}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
