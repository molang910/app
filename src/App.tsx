import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { WeatherLocation, WeatherData, CommuteSchedule } from './types/weather';
import { AlarmConfig, ActiveAlarmAlert } from './types/alarm';
import { DEFAULT_PRESET_LOCATIONS, fetchWeatherData } from './services/weatherService';
import { audioAlarm } from './utils/audioAlarm';
import { Header } from './components/Header';
import { CommuteAlertHero } from './components/CommuteAlertHero';
import { CuteMascotCard } from './components/CuteMascotCard';
import { CommuteSlotsCard } from './components/CommuteSlotsCard';
import { AirQualityAndPeCard } from './components/AirQualityAndPeCard';
import { ClothingGuideCard } from './components/ClothingGuideCard';
import { BagChecklistCard } from './components/BagChecklistCard';
import { HourlyTimeline } from './components/HourlyTimeline';
import { WeeklyForecast } from './components/WeeklyForecast';
import { ScheduleModal } from './components/ScheduleModal';
import { LocationModal } from './components/LocationModal';
import { AlarmModal } from './components/AlarmModal';
import { AlarmNotificationBanner } from './components/AlarmNotificationBanner';

const DEFAULT_SCHEDULE: CommuteSchedule = {
  morningTime: '08:00',
  afternoonTime: '16:00',
  hasNightStudy: true,
  nightTime: '21:00',
};

const DEFAULT_ALARM_CONFIG: AlarmConfig = {
  enabled: true,
  morningEnabled: true,
  afternoonEnabled: true,
  nightEnabled: true,
  notifyBeforeMinutes: 10,
  soundEnabled: true,
  browserNotification: true,
};

export default function App() {
  // Load saved location or fallback
  const [currentLocation, setCurrentLocation] = useState<WeatherLocation>(() => {
    try {
      const saved = localStorage.getItem('school_weather_location');
      return saved ? JSON.parse(saved) : DEFAULT_PRESET_LOCATIONS[0];
    } catch {
      return DEFAULT_PRESET_LOCATIONS[0];
    }
  });

  // Load saved schedule or fallback
  const [schedule, setSchedule] = useState<CommuteSchedule>(() => {
    try {
      const saved = localStorage.getItem('school_weather_schedule');
      return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE;
    } catch {
      return DEFAULT_SCHEDULE;
    }
  });

  // Load saved alarm config
  const [alarmConfig, setAlarmConfig] = useState<AlarmConfig>(() => {
    try {
      const saved = localStorage.getItem('school_weather_alarm');
      return saved ? JSON.parse(saved) : DEFAULT_ALARM_CONFIG;
    } catch {
      return DEFAULT_ALARM_CONFIG;
    }
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);

  // Active in-app alarm alert
  const [activeAlert, setActiveAlert] = useState<ActiveAlarmAlert | null>(null);

  // Last triggered alarm tracker
  const triggeredAlarmsRef = useRef<Record<string, string>>({});

  // Fetch Weather
  const loadWeather = useCallback(async (loc: WeatherLocation, sched: CommuteSchedule) => {
    try {
      setError(null);
      const data = await fetchWeatherData(loc, sched);
      setWeatherData(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || '날씨 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(currentLocation, schedule);
  }, [currentLocation, schedule, loadWeather]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadWeather(currentLocation, schedule);
  };

  const handleSaveSchedule = (newSchedule: CommuteSchedule) => {
    setSchedule(newSchedule);
    try {
      localStorage.setItem('school_weather_schedule', JSON.stringify(newSchedule));
    } catch {}
  };

  const handleSelectLocation = (newLoc: WeatherLocation) => {
    setCurrentLocation(newLoc);
    try {
      localStorage.setItem('school_weather_location', JSON.stringify(newLoc));
    } catch {}
  };

  const handleSaveAlarmConfig = (newConfig: AlarmConfig) => {
    setAlarmConfig(newConfig);
    try {
      localStorage.setItem('school_weather_alarm', JSON.stringify(newConfig));
    } catch {}
  };

  // Trigger an alarm event
  const triggerAlarm = useCallback((
    type: 'morning' | 'afternoon' | 'night',
    title: string,
    message: string,
    time: string,
    icon: string
  ) => {
    // 1. Play cute school chime if enabled
    if (alarmConfig.soundEnabled) {
      audioAlarm.playSchoolChime();
    }

    // 2. Browser Web Notification if granted
    if (alarmConfig.browserNotification && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
        });
      } catch {
        //
      }
    }

    // 3. Set In-App Banner Alert
    setActiveAlert({
      id: `${type}_${Date.now()}`,
      type,
      title,
      message,
      time,
      icon,
      timestamp: Date.now(),
    });
  }, [alarmConfig.soundEnabled, alarmConfig.browserNotification]);

  // Test Alarm trigger
  const handleTriggerTestAlarm = () => {
    const temp = weatherData?.commute.morning.temp ?? 15;
    const rainNeeded = weatherData?.commute.umbrellaAdvice.needed;
    triggerAlarm(
      'morning',
      '등교 시간 알림 테스트 🔔',
      `냐옹! 등교 준비할 시간이야! 오늘 기온은 ${temp}°C, ${rainNeeded ? '비 예보가 있으니 우산 꼭 챙겨!' : '우산 없이 가볍게 출발하자!'} 가방 잊은 물건 없지? 🎒`,
      '지금 알람 테스트',
      '🐾'
    );
  };

  // Real-time alarm ticker (runs every 10 seconds to check commute time matches)
  useEffect(() => {
    if (!alarmConfig.enabled || !weatherData) return;

    const checkInterval = setInterval(() => {
      const now = new Date();
      const todayDateStr = now.toISOString().slice(0, 10);
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMins = currentHours * 60 + currentMinutes;

      const parseTimeToMins = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + (m || 0);
      };

      const offset = alarmConfig.notifyBeforeMinutes; // e.g. 10 mins before

      // Check morning commute
      if (alarmConfig.morningEnabled) {
        const morningTargetMins = parseTimeToMins(schedule.morningTime) - offset;
        const triggerKey = `morning_${todayDateStr}`;
        if (currentTotalMins === morningTargetMins && triggeredAlarmsRef.current[triggerKey] !== 'done') {
          triggeredAlarmsRef.current[triggerKey] = 'done';
          const { morning, umbrellaAdvice } = weatherData.commute;
          triggerAlarm(
            'morning',
            `등교 시간 알림 (${offset === 0 ? '정각' : `${offset}분 전`}) 🎒`,
            `기온 ${morning.temp}°C (${morning.condition}). ${umbrellaAdvice.needed ? '하교 때 비 올 수 있으니 우산 챙겨!' : '상쾌한 날씨야!'} 활기차게 출발해냥~ 🐾`,
            schedule.morningTime,
            '🏫'
          );
        }
      }

      // Check afternoon dismissal
      if (alarmConfig.afternoonEnabled) {
        const afternoonTargetMins = parseTimeToMins(schedule.afternoonTime) - offset;
        const triggerKey = `afternoon_${todayDateStr}`;
        if (currentTotalMins === afternoonTargetMins && triggeredAlarmsRef.current[triggerKey] !== 'done') {
          triggeredAlarmsRef.current[triggerKey] = 'done';
          const { afternoon } = weatherData.commute;
          triggerAlarm(
            'afternoon',
            `하교 시간 알림 (${offset === 0 ? '정각' : `${offset}분 전`}) 🔔`,
            `수고했어! 현재 기온 ${afternoon.temp}°C, 비 올 확률 ${afternoon.rainProb}%. ${afternoon.rainProb >= 40 ? '비 오니까 우산 잊지 말고 쓰고 가!' : '조심히 집으로 귀가하자냥~'} 🐾`,
            schedule.afternoonTime,
            '🌂'
          );
        }
      }

      // Check night study dismissal
      if (schedule.hasNightStudy && alarmConfig.nightEnabled) {
        const nightTargetMins = parseTimeToMins(schedule.nightTime) - offset;
        const triggerKey = `night_${todayDateStr}`;
        if (currentTotalMins === nightTargetMins && triggeredAlarmsRef.current[triggerKey] !== 'done') {
          triggeredAlarmsRef.current[triggerKey] = 'done';
          const { evening } = weatherData.commute;
          triggerAlarm(
            'night',
            `야자/학원 귀가 알림 (${offset === 0 ? '정각' : `${offset}분 전`}) 🌙`,
            `오늘 하루도 정말 고생 많았어! 밤 기온 ${evening.temp}°C로 쌀쌀하니 겉옷 단단히 여미고 귀가해냥~ 🐾`,
            schedule.nightTime,
            '✨'
          );
        }
      }
    }, 10000);

    return () => clearInterval(checkInterval);
  }, [alarmConfig, schedule, weatherData, triggerAlarm]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Active Alarm Notification Floating Banner */}
      <AlarmNotificationBanner
        alert={activeAlert}
        onDismiss={() => setActiveAlert(null)}
      />

      {/* 3-Zone Navigation Top Bar */}
      <Header
        currentLocation={currentLocation}
        schedule={schedule}
        alarmEnabled={alarmConfig.enabled}
        onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenAlarmModal={() => setIsAlarmModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">
        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-28 bg-slate-200 rounded-3xl" />
            <div className="h-96 bg-slate-200 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-64 bg-slate-200 rounded-2xl" />
              <div className="h-64 bg-slate-200 rounded-2xl" />
              <div className="h-64 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">날씨 정보를 가져올 수 없습니다</h4>
                <p className="text-xs text-rose-600 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Loaded Content */}
        {weatherData && !loading && (
          <>
            {/* Cute Mascot Greeting & Alarm Quick Bar */}
            <CuteMascotCard
              weather={weatherData}
              schedule={schedule}
              alarmConfig={alarmConfig}
              onOpenAlarmModal={() => setIsAlarmModalOpen(true)}
            />

            {/* Focal Anchor: Hero Alert Banner */}
            <CommuteAlertHero
              weather={weatherData}
              schedule={schedule}
              onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
              onOpenLocationModal={() => setIsLocationModalOpen(true)}
            />

            {/* Commute Morning vs Afternoon vs Evening Slots */}
            <CommuteSlotsCard
              weather={weatherData}
              schedule={schedule}
            />

            {/* PE Class Recommendation & Air Quality */}
            <AirQualityAndPeCard
              weather={weatherData}
            />

            {/* Student Uniform & Clothing Guide */}
            <ClothingGuideCard
              weather={weatherData}
            />

            {/* School Bag Packing Interactive Checklist */}
            <BagChecklistCard
              weather={weatherData}
            />

            {/* 24-Hour Commute Timeline */}
            <HourlyTimeline
              hourly={weatherData.hourly}
            />

            {/* 7-Day School Days Forecast */}
            <WeeklyForecast
              daily={weatherData.daily}
            />
          </>
        )}
      </main>

      {/* Clean Editorial Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">등굣길 날씨</span>
            <span>·</span>
            <span>학생 전용 스마트 등하교 날씨 & 알리미</span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span>데이터 제공: Open-Meteo & OpenWeatherMap</span>
            <span>·</span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1 hover:text-slate-900 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>실시간 새로고침</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        currentSchedule={schedule}
        onSaveSchedule={handleSaveSchedule}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
      />

      <AlarmModal
        isOpen={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
        config={alarmConfig}
        schedule={schedule}
        onSaveConfig={handleSaveAlarmConfig}
        onTriggerTestAlarm={handleTriggerTestAlarm}
      />
    </div>
  );
}
