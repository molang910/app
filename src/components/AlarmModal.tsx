import React, { useState } from 'react';
import { X, Bell, BellRing, Volume2, Check, Clock, Sparkles, Play, ShieldAlert } from 'lucide-react';
import { AlarmConfig } from '../types/alarm';
import { CommuteSchedule } from '../types/weather';
import { audioAlarm } from '../utils/audioAlarm';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AlarmConfig;
  schedule: CommuteSchedule;
  onSaveConfig: (newConfig: AlarmConfig) => void;
  onTriggerTestAlarm: () => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  onClose,
  config,
  schedule,
  onSaveConfig,
  onTriggerTestAlarm,
}) => {
  const [enabled, setEnabled] = useState(config.enabled);
  const [morningEnabled, setMorningEnabled] = useState(config.morningEnabled);
  const [afternoonEnabled, setAfternoonEnabled] = useState(config.afternoonEnabled);
  const [nightEnabled, setNightEnabled] = useState(config.nightEnabled);
  const [notifyBeforeMinutes, setNotifyBeforeMinutes] = useState(config.notifyBeforeMinutes);
  const [soundEnabled, setSoundEnabled] = useState(config.soundEnabled);
  const [browserNotification, setBrowserNotification] = useState(config.browserNotification);
  const [permStatus, setPermStatus] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPermStatus(permission);
        if (permission === 'granted') {
          setBrowserNotification(true);
        }
      } catch {
        //
      }
    }
  };

  const handlePlaySoundTest = () => {
    audioAlarm.playSchoolChime();
  };

  const handleSave = () => {
    onSaveConfig({
      enabled,
      morningEnabled,
      afternoonEnabled,
      nightEnabled,
      notifyBeforeMinutes,
      soundEnabled,
      browserNotification,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/50 to-sky-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-200">
              <BellRing className="w-5 h-5 text-amber-600 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                <span>등하교 알람 & 날씨 알리미</span>
                <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                  귀여운 차임벨
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                설정한 등하교 시간에 맞춰 날씨 브리핑과 준비물 알람을 보내드려요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Master Enable Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block text-sm">등하교 알림 기능 켜기</span>
              <span className="text-xs text-slate-500">
                컴퓨터나 스마트폰 화면에서 제시간에 알림을 띄웁니다
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {enabled && (
            <>
              {/* Notification Timing Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  ⏰ 알림 시점 (등하교 몇 분 전?)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: 0, label: '정각' },
                    { val: 5, label: '5분 전' },
                    { val: 10, label: '10분 전' },
                    { val: 15, label: '15분 전' },
                  ].map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setNotifyBeforeMinutes(item.val)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        notifyBeforeMinutes === item.val
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commute Time Target Toggles */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  🔔 알림받을 시간 선택
                </label>

                {/* Morning */}
                <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎒</span>
                    <div>
                      <span className="font-semibold text-slate-800 text-xs block">
                        등교 알림 ({schedule.morningTime})
                      </span>
                      <span className="text-[11px] text-slate-500">
                        아침 체감온도 및 외투/우산 챙기기 알림
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={morningEnabled}
                    onChange={(e) => setMorningEnabled(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400 cursor-pointer"
                  />
                </div>

                {/* Afternoon */}
                <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏫</span>
                    <div>
                      <span className="font-semibold text-slate-800 text-xs block">
                        하교 알림 ({schedule.afternoonTime})
                      </span>
                      <span className="text-[11px] text-slate-500">
                        오후 깜짝 비 및 귀가길 날씨 안내
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={afternoonEnabled}
                    onChange={(e) => setAfternoonEnabled(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400 cursor-pointer"
                  />
                </div>

                {/* Night */}
                {schedule.hasNightStudy && (
                  <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🌙</span>
                      <div>
                        <span className="font-semibold text-slate-800 text-xs block">
                          야자·학원 귀가 알림 ({schedule.nightTime})
                        </span>
                        <span className="text-[11px] text-slate-500">
                          심야 기온 급강하 대비 겉옷 알림
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={nightEnabled}
                      onChange={(e) => setNightEnabled(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Sound & Browser Notification Settings */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="font-semibold text-slate-800 text-xs block">
                        귀여운 학교 차임벨 소리 재생
                      </span>
                      <span className="text-[11px] text-slate-500">
                        알람 울릴 때 밝고 경쾌한 멜로디가 연주됩니다
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePlaySoundTest}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg border border-amber-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Play className="w-3 h-3 fill-amber-700" />
                      <span>미리듣기</span>
                    </button>
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Browser Notification Permission */}
                <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-sky-900 block">
                      브라우저 팝업 알림 {permStatus === 'granted' ? '(허용됨 ✅)' : ''}
                    </span>
                    <span className="text-[11px] text-sky-700">
                      앱을 다른 탭으로 켜두어도 화면에 알림 배너가 뜹니다
                    </span>
                  </div>
                  {permStatus !== 'granted' ? (
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs cursor-pointer shrink-0 transition-colors"
                    >
                      알림 권한 허용
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold text-xs">
                      준비 완료
                    </span>
                  )}
                </div>
              </div>

              {/* Test Alarm Button */}
              <button
                type="button"
                onClick={onTriggerTestAlarm}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-amber-400 bg-amber-50/70 hover:bg-amber-100/80 text-amber-900 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4 text-amber-600" />
                <span>🔔 지금 바로 알람 테스트 울리기 (소리 & 팝업 확인)</span>
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            닫기
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            알람 설정 저장
          </button>
        </div>
      </div>
    </div>
  );
};
