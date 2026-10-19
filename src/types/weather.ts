export interface WeatherLocation {
  city: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
  category: 'clear' | 'cloudy' | 'rain' | 'snow' | 'thunder';
  maxTemp: number;
  minTemp: number;
  tempSwing: number;
  swingAlert: string;
}

export interface AirQuality {
  pm10: number;
  pm25: number;
  grade: '좋음' | '보통' | '나쁨' | '매우나쁨';
  badgeClass: string;
  maskAdvice: string;
}

export interface CommuteSlot {
  timeLabel: string;
  temp: number;
  feelsLike?: number;
  rainProb: number;
  condition: string;
  category: 'clear' | 'cloudy' | 'rain' | 'snow' | 'thunder';
}

export interface UmbrellaAdvice {
  needed: boolean;
  title: string;
  subtitle: string;
  type: string;
}

export interface PeEvaluation {
  canOutdoor: boolean;
  badge: string;
  reason: string;
}

export interface ClothingGuide {
  category: string;
  uniform: string;
  outer: string;
  accessories: string[];
  summary: string;
}

export interface ChecklistItem {
  id: string;
  item: string;
  recommended: boolean;
  urgent: boolean;
  note: string;
}

export interface HourlySlot {
  time: string;
  hour: number;
  temp: number;
  feelsLike: number;
  rainProb: number;
  weatherText: string;
  weatherCategory: 'clear' | 'cloudy' | 'rain' | 'snow' | 'thunder';
  uv: number;
  isSchoolMorning: boolean;
  isSchoolAfternoon: boolean;
  isNightStudy: boolean;
}

export interface DailySlot {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  rainProb: number;
  weatherText: string;
  weatherCategory: 'clear' | 'cloudy' | 'rain' | 'snow' | 'thunder';
}

export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  airQuality: AirQuality;
  commute: {
    morning: CommuteSlot;
    afternoon: CommuteSlot;
    evening: CommuteSlot;
    umbrellaAdvice: UmbrellaAdvice;
    peEvaluation: PeEvaluation;
    clothingGuide: ClothingGuide;
  };
  checklist: ChecklistItem[];
  hourly: HourlySlot[];
  daily: DailySlot[];
  meta: {
    provider: string;
    hasUserKey: boolean;
  };
}

export interface CommuteSchedule {
  morningTime: string; // "08:00"
  afternoonTime: string; // "16:00"
  hasNightStudy: boolean;
  nightTime: string; // "21:00"
}
