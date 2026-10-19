import React, { useState } from 'react';
import { X, Clock, Check, BellRing } from 'lucide-react';
import { CommuteSchedule } from '../types/weather';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSchedule: CommuteSchedule;
  onSaveSchedule: (newSchedule: CommuteSchedule) => void;
}

const MORNING_OPTIONS = ['07:20', '07:40', '08:00', '08:20', '08:40', '09:00'];
const AFTERNOON_OPTIONS = ['15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];
const NIGHT_OPTIONS = ['20:00', '21:00', '22:00', '23:00'];

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  currentSchedule,
  onSaveSchedule,
}) => {
  const [morningTime, setMorningTime] = useState(currentSchedule.morningTime);
  const [afternoonTime, setAfternoonTime] = useState(currentSchedule.afternoonTime);
  const [hasNightStudy, setHasNightStudy] = useState(currentSchedule.hasNightStudy);
  const [nightTime, setNightTime] = useState(currentSchedule.nightTime);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSchedule({
      morningTime,
      afternoonTime,
      hasNightStudy,
      nightTime,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">내 등하교 시간 맞춤 설정</h3>
              <p className="text-xs text-slate-500">본인의 실제 학교 일과 시간에 맞춰 예보를 조율합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Morning Commute Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              아침 등교 시간
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MORNING_OPTIONS.map(time => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setMorningTime(time)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    morningTime === time
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Afternoon Dismissal Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              오후 하교 시간
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AFTERNOON_OPTIONS.map(time => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setAfternoonTime(time)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    afternoonTime === time
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Night Study / Academy */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-slate-700 block">야자 / 학원 심야 귀가</span>
                <span className="text-[11px] text-slate-500">야간 자율학습이나 학원 후 귀가 시간 추가</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNightStudy}
                  onChange={(e) => setHasNightStudy(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {hasNightStudy && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {NIGHT_OPTIONS.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setNightTime(time)}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      nightTime === time
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            설정 저장하기
          </button>
        </div>
      </div>
    </div>
  );
};
