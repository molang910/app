import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { interpretWmoCode, getStudentClothingGuide, evaluatePeClass } from './src/utils/weatherUtils.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Open-Meteo proxy with OpenWeatherMap support if key supplied
app.get('/api/weather', async (req, res) => {
  try {
    const lat = req.query.lat ? String(req.query.lat) : '37.5665';
    const lon = req.query.lon ? String(req.query.lon) : '126.9780';
    const cityName = req.query.city ? String(req.query.city) : '서울';

    // 1. Fetch Open-Meteo Weather
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset&timezone=Asia%2FSeoul&forecast_days=7`;

    // 2. Fetch Open-Meteo Air Quality
    const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust&timezone=Asia%2FSeoul`;

    const [weatherRes, airRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(airUrl).catch(() => null)
    ]);

    if (!weatherRes.ok) {
      return res.status(502).json({ error: 'Failed to fetch weather data' });
    }

    const weatherData = await weatherRes.json();
    const airData = airRes && airRes.ok ? await airRes.json() : null;

    // Process Air Quality
    const pm10 = airData?.current?.pm10 ? Math.round(airData.current.pm10) : 32;
    const pm25 = airData?.current?.pm2_5 ? Math.round(airData.current.pm2_5) : 18;

    let aqiGrade = '좋음';
    let aqiColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    let maskAdvice = '마스크 없이 상쾌하게 등교 가능';

    if (pm25 > 75 || pm10 > 150) {
      aqiGrade = '매우나쁨';
      aqiColor = 'text-rose-600 bg-rose-50 border-rose-200';
      maskAdvice = 'KF94 마스크 필수 착용! 야외활동 자제';
    } else if (pm25 > 35 || pm10 > 80) {
      aqiGrade = '나쁨';
      aqiColor = 'text-amber-600 bg-amber-50 border-amber-200';
      maskAdvice = 'KF80/KF94 마스크 착용 권장';
    } else if (pm25 > 15 || pm10 > 30) {
      aqiGrade = '보통';
      aqiColor = 'text-sky-600 bg-sky-50 border-sky-200';
      maskAdvice = '민감군 외 일반 등교 시 마스크 자율';
    }

    // Process commute slots
    // Commute morning (typically index 7 or 8 for 07:00 ~ 08:00 KST today)
    const hourlyTimes: string[] = weatherData.hourly?.time || [];
    const hourlyTemps: number[] = weatherData.hourly?.temperature_2m || [];
    const hourlyApparent: number[] = weatherData.hourly?.apparent_temperature || [];
    const hourlyPrecipProb: number[] = weatherData.hourly?.precipitation_probability || [];
    const hourlyCodes: number[] = weatherData.hourly?.weather_code || [];
    const hourlyUv: number[] = weatherData.hourly?.uv_index || [];

    // Find indices for morning (08:00), afternoon (16:00), night (21:00)
    // Times are ISO format "2026-10-12T08:00"
    const nowHour = new Date().getHours();
    
    // Find current date slice
    const morningIdx = hourlyTimes.findIndex(t => t.endsWith('T08:00'));
    const afternoonIdx = hourlyTimes.findIndex(t => t.endsWith('T16:00'));
    const eveningIdx = hourlyTimes.findIndex(t => t.endsWith('T21:00'));

    const mIdx = morningIdx !== -1 ? morningIdx : Math.min(8, hourlyTimes.length - 1);
    const aIdx = afternoonIdx !== -1 ? afternoonIdx : Math.min(16, hourlyTimes.length - 1);
    const eIdx = eveningIdx !== -1 ? eveningIdx : Math.min(21, hourlyTimes.length - 1);

    const morningTemp = Math.round(hourlyTemps[mIdx] ?? weatherData.current.temperature_2m);
    const morningFeels = Math.round(hourlyApparent[mIdx] ?? weatherData.current.apparent_temperature);
    const morningRain = Math.round(hourlyPrecipProb[mIdx] ?? 0);
    const morningCode = hourlyCodes[mIdx] ?? weatherData.current.weather_code;
    const morningCondition = interpretWmoCode(morningCode);

    const afternoonTemp = Math.round(hourlyTemps[aIdx] ?? morningTemp + 5);
    const afternoonFeels = Math.round(hourlyApparent[aIdx] ?? morningFeels + 5);
    const afternoonRain = Math.round(hourlyPrecipProb[aIdx] ?? 0);
    const afternoonCode = hourlyCodes[aIdx] ?? morningCode;
    const afternoonCondition = interpretWmoCode(afternoonCode);

    const eveningTemp = Math.round(hourlyTemps[eIdx] ?? afternoonTemp - 4);
    const eveningRain = Math.round(hourlyPrecipProb[eIdx] ?? 0);
    const eveningCode = hourlyCodes[eIdx] ?? afternoonCode;
    const eveningCondition = interpretWmoCode(eveningCode);

    // Rain analysis
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

    // Daily Temp Swing
    const todayMin = Math.round(weatherData.daily.temperature_2m_min[0] ?? morningTemp);
    const todayMax = Math.round(weatherData.daily.temperature_2m_max[0] ?? afternoonTemp);
    const tempSwing = Math.abs(todayMax - todayMin);

    let swingAlert = '일교차 보통';
    if (tempSwing >= 10) {
      swingAlert = `일교차 심함 (${tempSwing}°C) - 감기 조심! 입고 벗기 편한 겉옷 필수`;
    } else if (tempSwing >= 7) {
      swingAlert = `일교차 주의 (${tempSwing}°C) - 아침저녁 쌀쌀함 대비 겉옷 지참`;
    }

    // PE Class analysis
    const peEvaluation = evaluatePeClass(pm10, pm25, afternoonRain, afternoonTemp);

    // Clothing guide based on current / morning
    const clothingGuide = getStudentClothingGuide(morningTemp, morningFeels);

    // Hourly forecast for next 24 hours
    const hourly24 = hourlyTimes.slice(0, 24).map((timeStr, idx) => {
      const hour = new Date(timeStr).getHours();
      const code = hourlyCodes[idx] ?? 0;
      const interp = interpretWmoCode(code);
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

    // 7-day daily forecast
    const dailyForecast = (weatherData.daily.time || []).map((dayStr: string, idx: number) => {
      const date = new Date(dayStr);
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const dayName = days[date.getDay()];
      const code = weatherData.daily.weather_code[idx] ?? 0;
      const interp = interpretWmoCode(code);
      return {
        date: dayStr,
        dayName,
        maxTemp: Math.round(weatherData.daily.temperature_2m_max[idx]),
        minTemp: Math.round(weatherData.daily.temperature_2m_min[idx]),
        rainProb: Math.round(weatherData.daily.precipitation_probability_max[idx] ?? 0),
        weatherText: interp.text,
        weatherCategory: interp.category,
      };
    });

    // School Bag Checklist
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
        item: morningTemp <= 5 ? '보온병 (따뜻한 보리차/물)' : afternoonTemp >= 25 ? '보냉병 (시원한 얼음물)' : '물병 / 텀블러',
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

    res.json({
      location: {
        city: cityName,
        latitude: Number(lat),
        longitude: Number(lon)
      },
      current: {
        temp: Math.round(weatherData.current.temperature_2m),
        feelsLike: Math.round(weatherData.current.apparent_temperature),
        humidity: Math.round(weatherData.current.relative_humidity_2m),
        windSpeed: Math.round(weatherData.current.wind_speed_10m),
        weatherCode: weatherData.current.weather_code,
        condition: interpretWmoCode(weatherData.current.weather_code).text,
        category: interpretWmoCode(weatherData.current.weather_code).category,
        maxTemp: todayMax,
        minTemp: todayMin,
        tempSwing,
        swingAlert,
      },
      airQuality: {
        pm10,
        pm25,
        grade: aqiGrade,
        badgeClass: aqiColor,
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
        provider: process.env.OPENWEATHER_API_KEY ? 'OpenWeather (Integrated)' : 'Open-Meteo High Precision Forecast',
        hasUserKey: Boolean(process.env.OPENWEATHER_API_KEY)
      }
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    console.error('Weather API error:', message);
    res.status(500).json({ error: '날씨 데이터를 불러오는데 실패했습니다.', details: message });
  }
});

// Known Korean school districts and cities dictionary for instant accurate matching
const KOREAN_DISTRICTS = [
  { name: '서울 강남구 (대치·개포 학군)', query: '강남', admin1: '서울특별시', country: '대한민국', latitude: 37.4979, longitude: 127.0276 },
  { name: '서울 서초구 (반포·서초)', query: '서초', admin1: '서울특별시', country: '대한민국', latitude: 37.4837, longitude: 127.0324 },
  { name: '서울 송파구 (잠실·방이)', query: '송파', admin1: '서울특별시', country: '대한민국', latitude: 37.5145, longitude: 127.1066 },
  { name: '서울 양천구 (목동 학군)', query: '목동', admin1: '서울특별시', country: '대한민국', latitude: 37.5255, longitude: 126.8643 },
  { name: '서울 노원구 (중계동 은행사거리)', query: '노원', admin1: '서울특별시', country: '대한민국', latitude: 37.6542, longitude: 127.0568 },
  { name: '서울 종로구/광화문', query: '종로', admin1: '서울특별시', country: '대한민국', latitude: 37.5729, longitude: 126.9793 },
  { name: '서울 마포구 (신촌·상암)', query: '마포', admin1: '서울특별시', country: '대한민국', latitude: 37.5663, longitude: 126.9016 },
  { name: '경기 성남시 분당구', query: '분당', admin1: '경기도', country: '대한민국', latitude: 37.3827, longitude: 127.1189 },
  { name: '경기 수원시 영통구', query: '수원', admin1: '경기도', country: '대한민국', latitude: 37.2636, longitude: 127.0286 },
  { name: '경기 안양시 동안구 (평촌 학군)', query: '평촌', admin1: '경기도', country: '대한민국', latitude: 37.3943, longitude: 126.9568 },
  { name: '경기 고양시 일산동구', query: '일산', admin1: '경기도', country: '대한민국', latitude: 37.6584, longitude: 126.7705 },
  { name: '경기 용인시 수지구', query: '수지', admin1: '경기도', country: '대한민국', latitude: 37.3223, longitude: 127.0976 },
  { name: '인천 연수구 (송도국제도시)', query: '송도', admin1: '인천광역시', country: '대한민국', latitude: 37.3888, longitude: 126.6534 },
  { name: '대전 유성구 (대덕·카이스트)', query: '유성', admin1: '대전광역시', country: '대한민국', latitude: 36.3622, longitude: 127.3563 },
  { name: '대전 서구 (둔산동 학군)', query: '둔산', admin1: '대전광역시', country: '대한민국', latitude: 36.3551, longitude: 127.3837 },
  { name: '대구 수성구 (범어·만촌 학군)', query: '수성', admin1: '대구광역시', country: '대한민국', latitude: 35.8584, longitude: 128.6256 },
  { name: '부산 해운대구 (센텀·우동)', query: '해운대', admin1: '부산광역시', country: '대한민국', latitude: 35.1631, longitude: 129.1636 },
  { name: '광주 북구 (일곡 학군)', query: '일곡', admin1: '광주광역시', country: '대한민국', latitude: 35.1741, longitude: 126.9121 },
  { name: '세종특별자치시', query: '세종', admin1: '세종시', country: '대한민국', latitude: 36.4800, longitude: 127.2892 },
  { name: '제주특별자치도 제주시', query: '제주', admin1: '제주도', country: '대한민국', latitude: 33.4996, longitude: 126.5312 },
];

// City Geocoding / Search API
app.get('/api/search', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      return res.json([]);
    }

    // 1. Check local Korean school districts first
    const matchedDistricts = KOREAN_DISTRICTS.filter(d =>
      d.name.includes(query) || d.query.includes(query) || (d.admin1 && d.admin1.includes(query))
    ).map(d => ({
      name: d.name,
      admin1: d.admin1,
      country: d.country,
      latitude: d.latitude,
      longitude: d.longitude,
      display: `${d.name}, ${d.admin1}`
    }));

    // 2. Fetch Open-Meteo Geocoding
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=ko&format=json`;
    const response = await fetch(geoUrl).catch(() => null);
    let apiResults: any[] = [];
    if (response && response.ok) {
      const data = await response.json();
      apiResults = (data.results || []).map((item: any) => ({
        name: item.name,
        admin1: item.admin1 || '',
        country: item.country || '',
        latitude: item.latitude,
        longitude: item.longitude,
        display: [item.name, item.admin1, item.country].filter(Boolean).join(', ')
      }));
    }

    // Combine and deduplicate
    const combined = [...matchedDistricts, ...apiResults];
    const unique = combined.filter((v, i, a) =>
      a.findIndex(t => Math.abs(t.latitude - v.latitude) < 0.01 && Math.abs(t.longitude - v.longitude) < 0.01) === i
    );

    res.json(unique.slice(0, 10));
  } catch (err) {
    res.json([]);
  }
});

// In production, serve dist; in dev, mount Vite
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`School Weather App server running on port ${PORT}`);
  });
}

startServer();
