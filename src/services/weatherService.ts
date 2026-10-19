import { WeatherData, WeatherLocation, CommuteSchedule } from '../types/weather';
import { interpretWmoCode, getStudentClothingGuide, evaluatePeClass } from '../utils/weatherUtils';

export const DEFAULT_PRESET_LOCATIONS: WeatherLocation[] = [
  { city: '서울 강남구 (대치/역삼 학군)', latitude: 37.4979, longitude: 127.0276, admin1: '서울특별시' },
  { city: '서울 종로구/광화문', latitude: 37.5729, longitude: 126.9793, admin1: '서울특별시' },
  { city: '서울 송파구 (잠실/방이)', latitude: 37.5145, longitude: 127.1066, admin1: '서울특별시' },
  { city: '서울 양천구 (목동 학군)', latitude: 37.5255, longitude: 126.8643, admin1: '서울특별시' },
  { city: '경기 성남시 (분당구)', latitude: 37.3827, longitude: 127.1189, admin1: '경기도' },
  { city: '경기 수원시 (영통/팔달)', latitude: 37.2636, longitude: 127.0286, admin1: '경기도' },
  { city: '인천 연수구 (송도국제도시)', latitude: 37.3888, longitude: 126.6534, admin1: '인천광역시' },
  { city: '대전 유성구 (카이스트/대덕)', latitude: 36.3622, longitude: 127.3563, admin1: '대전광역시' },
  { city: '대구 수성구 (범어/수성 학군)', latitude: 35.8584, longitude: 128.6256, admin1: '대구광역시' },
  { city: '부산 해운대구 (센텀/우동)', latitude: 35.1631, longitude: 129.1636, admin1: '부산광역시' },
  { city: '광주 북구 (전남대/일곡 학군)', latitude: 35.1741, longitude: 126.9121, admin1: '광주광역시' },
  { city: '세종특별자치시', latitude: 36.4800, longitude: 127.2892, admin1: '세종시' },
];

export async function fetchWeatherData(
  location: WeatherLocation,
  schedule?: CommuteSchedule
): Promise<WeatherData> {
  const { latitude, longitude, city } = location;

  // Try server proxy first
  try {
    const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}&city=${encodeURIComponent(city)}`);
    if (res.ok) {
      const data: WeatherData = await res.json();
      return adjustForSchedule(data, schedule);
    }
  } catch {
    // If backend proxy fails, proceed to direct client fallback
  }

  // Client-side fallback via Open-Meteo directly
  return fetchDirectOpenMeteo(location, schedule);
}

// Adjust commute slots based on student's custom schedule
function adjustForSchedule(data: WeatherData, schedule?: CommuteSchedule): WeatherData {
  if (!schedule) return data;

  const morningHour = parseInt(schedule.morningTime.split(':')[0], 10) || 8;
  const afternoonHour = parseInt(schedule.afternoonTime.split(':')[0], 10) || 16;
  const nightHour = parseInt(schedule.nightTime.split(':')[0], 10) || 21;

  const morningSlot = data.hourly.find(h => h.hour === morningHour);
  const afternoonSlot = data.hourly.find(h => h.hour === afternoonHour);
  const nightSlot = data.hourly.find(h => h.hour === nightHour);

  if (morningSlot) {
    data.commute.morning = {
      timeLabel: `등교 시간 (${schedule.morningTime})`,
      temp: morningSlot.temp,
      feelsLike: morningSlot.feelsLike,
      rainProb: morningSlot.rainProb,
      condition: morningSlot.weatherText,
      category: morningSlot.weatherCategory,
    };
  }

  if (afternoonSlot) {
    data.commute.afternoon = {
      timeLabel: `하교 시간 (${schedule.afternoonTime})`,
      temp: afternoonSlot.temp,
      feelsLike: afternoonSlot.feelsLike,
      rainProb: afternoonSlot.rainProb,
      condition: afternoonSlot.weatherText,
      category: afternoonSlot.weatherCategory,
    };
  }

  if (nightSlot && schedule.hasNightStudy) {
    data.commute.evening = {
      timeLabel: `야자/학원 귀가 (${schedule.nightTime})`,
      temp: nightSlot.temp,
      rainProb: nightSlot.rainProb,
      condition: nightSlot.weatherText,
      category: nightSlot.weatherCategory,
    };
  }

  // Update hourly flags
  data.hourly = data.hourly.map(slot => ({
    ...slot,
    isSchoolMorning: Math.abs(slot.hour - morningHour) <= 1,
    isSchoolAfternoon: Math.abs(slot.hour - afternoonHour) <= 1,
    isNightStudy: schedule.hasNightStudy && Math.abs(slot.hour - nightHour) <= 1,
  }));

  return data;
}

// Client Direct Fallback
async function fetchDirectOpenMeteo(
  location: WeatherLocation,
  schedule?: CommuteSchedule
): Promise<WeatherData> {
  const { latitude, longitude, city } = location;

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset&timezone=Asia%2FSeoul&forecast_days=7`;

  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm10,pm2_5&timezone=Asia%2FSeoul`;

  const [weatherRes, airRes] = await Promise.all([
    fetch(weatherUrl),
    fetch(airUrl).catch(() => null)
  ]);

  if (!weatherRes.ok) {
    throw new Error('날씨 데이터를 가져올 수 없습니다.');
  }

  const wData = await weatherRes.json();
  const aData = airRes && airRes.ok ? await airRes.json() : null;

  const pm10 = aData?.current?.pm10 ? Math.round(aData.current.pm10) : 28;
  const pm25 = aData?.current?.pm2_5 ? Math.round(aData.current.pm2_5) : 15;

  let aqiGrade: '좋음' | '보통' | '나쁨' | '매우나쁨' = '좋음';
  let badgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let maskAdvice = '마스크 없이 상쾌하게 등교 가능';

  if (pm25 > 75 || pm10 > 150) {
    aqiGrade = '매우나쁨';
    badgeClass = 'text-rose-700 bg-rose-50 border-rose-200';
    maskAdvice = 'KF94 마스크 필수 착용! 야외활동 자제';
  } else if (pm25 > 35 || pm10 > 80) {
    aqiGrade = '나쁨';
    badgeClass = 'text-amber-700 bg-amber-50 border-amber-200';
    maskAdvice = 'KF80/KF94 마스크 착용 권장';
  } else if (pm25 > 15 || pm10 > 30) {
    aqiGrade = '보통';
    badgeClass = 'text-sky-700 bg-sky-50 border-sky-200';
    maskAdvice = '민감군 외 일반 등교 시 마스크 자율';
  }

  const hourlyTimes: string[] = wData.hourly?.time || [];
  const hourlyTemps: number[] = wData.hourly?.temperature_2m || [];
  const hourlyApparent: number[] = wData.hourly?.apparent_temperature || [];
  const hourlyPrecipProb: number[] = wData.hourly?.precipitation_probability || [];
  const hourlyCodes: number[] = wData.hourly?.weather_code || [];
  const hourlyUv: number[] = wData.hourly?.uv_index || [];

  const morningIdx = Math.min(8, hourlyTimes.length - 1);
  const afternoonIdx = Math.min(16, hourlyTimes.length - 1);
  const eveningIdx = Math.min(21, hourlyTimes.length - 1);

  const morningTemp = Math.round(hourlyTemps[morningIdx] ?? wData.current.temperature_2m);
  const morningFeels = Math.round(hourlyApparent[morningIdx] ?? wData.current.apparent_temperature);
  const morningRain = Math.round(hourlyPrecipProb[morningIdx] ?? 0);
  const morningCondition = interpretWmoCode(hourlyCodes[morningIdx] ?? 0);

  const afternoonTemp = Math.round(hourlyTemps[afternoonIdx] ?? morningTemp + 5);
  const afternoonFeels = Math.round(hourlyApparent[afternoonIdx] ?? morningFeels + 5);
  const afternoonRain = Math.round(hourlyPrecipProb[afternoonIdx] ?? 0);
  const afternoonCondition = interpretWmoCode(hourlyCodes[afternoonIdx] ?? 0);

  const eveningTemp = Math.round(hourlyTemps[eveningIdx] ?? afternoonTemp - 4);
  const eveningRain = Math.round(hourlyPrecipProb[eveningIdx] ?? 0);
  const eveningCondition = interpretWmoCode(hourlyCodes[eveningIdx] ?? 0);

  const todayMin = Math.round(wData.daily.temperature_2m_min[0] ?? morningTemp);
  const todayMax = Math.round(wData.daily.temperature_2m_max[0] ?? afternoonTemp);
  const tempSwing = Math.abs(todayMax - todayMin);

  let swingAlert = '일교차 보통';
  if (tempSwing >= 10) {
    swingAlert = `일교차 심함 (${tempSwing}°C) - 감기 조심! 입고 벗기 편한 겉옷 필수`;
  } else if (tempSwing >= 7) {
    swingAlert = `일교차 주의 (${tempSwing}°C) - 아침저녁 쌀쌀함 대비 겉옷 지참`;
  }

  const maxDayRainProb = Math.max(...hourlyPrecipProb.slice(0, 24), 0);
  const willRainToday = maxDayRainProb >= 30;
  const rainDuringCommute = morningRain >= 30 || afternoonRain >= 30;

  let umbrellaAdvice = {
    needed: willRainToday,
    title: '우산 불필요',
    subtitle: '오늘 등하굣길 강수 확률이 낮아 우산 없이 가볍게 가도 좋습니다.',
    type: 'none'
  };

  if (morningRain < 30 && afternoonRain >= 40) {
    umbrellaAdvice = {
      needed: true,
      title: '하교 시 우산 필수 (깜짝 비 주의!)',
      subtitle: `등교 땐 비가 안 오지만, 하교 시간(16시)에 비 올 확률 ${afternoonRain}%입니다! 접이식 우산을 꼭 가방에 넣어가세요.`,
      type: 'afternoon_warning'
    };
  } else if (morningRain >= 40 && afternoonRain < 30) {
    umbrellaAdvice = {
      needed: true,
      title: '등교 시 우산 지참 (하교 땐 갤 예정)',
      subtitle: `아침 등굣길 강수확률 ${morningRain}%. 하교 땐 비가 그칠 예정이니 잃어버리지 않게 3단 우산을 챙기세요.`,
      type: 'morning_rain'
    };
  } else if (willRainToday) {
    umbrellaAdvice = {
      needed: true,
      title: '종일 비 예보 (우산 필수)',
      subtitle: `오늘 최고 강수 확률 ${maxDayRainProb}%. 튼튼한 장우산이나 접이식 우산을 꼭 챙기세요.`,
      type: 'all_day'
    };
  }

  const clothingGuide = getStudentClothingGuide(morningTemp, morningFeels);
  const peEvaluation = evaluatePeClass(pm10, pm25, afternoonRain, afternoonTemp);

  const hourly24 = hourlyTimes.slice(0, 24).map((timeStr, idx) => {
    const hour = new Date(timeStr).getHours();
    const interp = interpretWmoCode(hourlyCodes[idx] ?? 0);
    return {
      time: `${String(hour).padStart(2, '0')}:00`,
      hour,
      temp: Math.round(hourlyTemps[idx] ?? 0),
      feelsLike: Math.round(hourlyApparent[idx] ?? 0),
      rainProb: Math.round(hourlyPrecipProb[idx] ?? 0),
      weatherText: interp.text,
      weatherCategory: interp.category,
      uv: Math.round(hourlyUv[idx] ?? 0),
      isSchoolMorning: hour >= 7 && hour <= 9,
      isSchoolAfternoon: hour >= 15 && hour <= 18,
      isNightStudy: hour >= 21 && hour <= 23,
    };
  });

  const dailyForecast = (wData.daily.time || []).map((dayStr: string, idx: number) => {
    const date = new Date(dayStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const interp = interpretWmoCode(wData.daily.weather_code[idx] ?? 0);
    return {
      date: dayStr,
      dayName: days[date.getDay()],
      maxTemp: Math.round(wData.daily.temperature_2m_max[idx]),
      minTemp: Math.round(wData.daily.temperature_2m_min[idx]),
      rainProb: Math.round(wData.daily.precipitation_probability_max[idx] ?? 0),
      weatherText: interp.text,
      weatherCategory: interp.category,
    };
  });

  const checklist = [
    {
      id: 'umbrella',
      item: willRainToday ? '접이식 우산 (비 올 확률 높음!)' : '우산 (비 예보 없음)',
      recommended: willRainToday,
      urgent: rainDuringCommute,
      note: umbrellaAdvice.title
    },
    {
      id: 'outerwear',
      item: tempSwing >= 8 || morningFeels <= 14 ? '가디건 / 바람막이 / 겉옷' : '교복 기본 복장',
      recommended: tempSwing >= 8 || morningFeels <= 16,
      urgent: tempSwing >= 10,
      note: swingAlert
    },
    {
      id: 'mask',
      item: pm25 >= 36 || pm10 >= 81 ? 'KF94 / KF80 보건용 마스크' : '마스크 (필요시 지참)',
      recommended: pm25 >= 36 || pm10 >= 81,
      urgent: pm25 >= 76 || pm10 >= 151,
      note: maskAdvice
    },
    {
      id: 'tumbler',
      item: morningTemp <= 5 ? '보온병 (따뜻한 물)' : afternoonTemp >= 25 ? '보냉병 (시원한 물)' : '물병 / 텀블러',
      recommended: true,
      urgent: false,
      note: '수분 보충 및 체온 유지용'
    },
    {
      id: 'seasonal',
      item: morningFeels <= 3 ? '핫팩 (주머니용)' : afternoonTemp >= 27 ? '손선풍기 / 쿨링패치' : '립밤 / 핸드크림',
      recommended: morningFeels <= 5 || afternoonTemp >= 27,
      urgent: morningFeels <= 0,
      note: '환절기 및 계절 대비'
    }
  ];

  const currentCondition = interpretWmoCode(wData.current.weather_code);

  const initialData: WeatherData = {
    location,
    current: {
      temp: Math.round(wData.current.temperature_2m),
      feelsLike: Math.round(wData.current.apparent_temperature),
      humidity: Math.round(wData.current.relative_humidity_2m),
      windSpeed: Math.round(wData.current.wind_speed_10m),
      weatherCode: wData.current.weather_code,
      condition: currentCondition.text,
      category: currentCondition.category,
      maxTemp: todayMax,
      minTemp: todayMin,
      tempSwing,
      swingAlert,
    },
    airQuality: {
      pm10,
      pm25,
      grade: aqiGrade,
      badgeClass,
      maskAdvice,
    },
    commute: {
      morning: {
        timeLabel: '등교 시간 (08:00)',
        temp: morningTemp,
        feelsLike: morningFeels,
        rainProb: morningRain,
        condition: morningCondition.text,
        category: morningCondition.category,
      },
      afternoon: {
        timeLabel: '하교 시간 (16:00)',
        temp: afternoonTemp,
        feelsLike: afternoonFeels,
        rainProb: afternoonRain,
        condition: afternoonCondition.text,
        category: afternoonCondition.category,
      },
      evening: {
        timeLabel: '야자/학원 귀가 (21:00)',
        temp: eveningTemp,
        rainProb: eveningRain,
        condition: eveningCondition.text,
        category: eveningCondition.category,
      },
      umbrellaAdvice,
      peEvaluation,
      clothingGuide,
    },
    checklist,
    hourly: hourly24,
    daily: dailyForecast,
    meta: {
      provider: 'Open-Meteo High Precision Forecast',
      hasUserKey: false
    }
  };

  return adjustForSchedule(initialData, schedule);
}

export async function searchLocations(query: string): Promise<WeatherLocation[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const results = await res.json();
      if (Array.isArray(results) && results.length > 0) {
        return results.map((r: any) => ({
          city: r.name,
          latitude: r.latitude,
          longitude: r.longitude,
          admin1: r.admin1,
          country: r.country
        }));
      }
    }
  } catch {
    // fallback
  }

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=6&language=ko&format=json`;
    const res = await fetch(geoUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.results) {
        return data.results.map((r: any) => ({
          city: r.name,
          latitude: r.latitude,
          longitude: r.longitude,
          admin1: r.admin1,
          country: r.country
        }));
      }
    }
  } catch {
    //
  }

  return [];
}
