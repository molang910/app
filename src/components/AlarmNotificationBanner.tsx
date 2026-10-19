import React from 'react';
import { BellRing, X, CheckCircle2, Umbrella, Shirt, Sparkles } from 'lucide-react';
import { ActiveAlarmAlert } from '../types/alarm';

interface AlarmNotificationBannerProps {
  alert: ActiveAlarmAlert | null;
  onDismiss: () => void;
}

export const AlarmNotificationBanner: React.FC<AlarmNotificationBannerProps> = ({
  alert,
  onDismiss,
}) => {
  if (!alert) return null;

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-bounce-short">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border-2 border-amber-300 ring-4 ring-amber-100 flex flex-col gap-3">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs animate-wiggle">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                등하교 맞춤 알림 🔔
              </span>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                {alert.time}
              </span>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60">
          <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
            <span>{alert.icon}</span>
            <span>{alert.title}</span>
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed">
            {alert.message}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>준비 완료! 확인했어요 🎒</span>
        </button>
      </div>
    </div>
  );
};
