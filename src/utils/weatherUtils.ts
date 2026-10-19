// Korean weather condition mapping from WMO codes
export function interpretWmoCode(code: number): { text: string; icon: string; category: 'clear' | 'cloudy' | 'rain' | 'snow' | 'thunder' } {
  if (code === 0) return { text: '맑음', icon: 'Sun', category: 'clear' };
  if (code === 1) return { text: '대체로 맑음', icon: 'SunMedium', category: 'clear' };
  if (code === 2) return { text: '구름 조금', icon: 'CloudSun', category: 'cloudy' };
  if (code === 3) return { text: '흐림', icon: 'Cloud', category: 'cloudy' };
  if (code >= 45 && code <= 48) return { text: '안개', icon: 'CloudFog', category: 'cloudy' };
  if (code >= 51 && code <= 55) return { text: '이슬비', icon: 'CloudDrizzle', category: 'rain' };
  if (code >= 61 && code <= 65) return { text: '비', icon: 'CloudRain', category: 'rain' };
  if (code >= 66 && code <= 67) return { text: '얼어붙는 비', icon: 'CloudRain', category: 'rain' };
  if (code >= 71 && code <= 77) return { text: '눈', icon: 'CloudSnow', category: 'snow' };
  if (code >= 80 && code <= 82) return { text: '소나기', icon: 'CloudRain', category: 'rain' };
  if (code >= 85 && code <= 86) return { text: '소낙눈', icon: 'CloudSnow', category: 'snow' };
  if (code >= 95 && code <= 99) return { text: '뇌우 (천둥번개)', icon: 'CloudLightning', category: 'thunder' };
  return { text: '흐림', icon: 'Cloud', category: 'cloudy' };
}

// Student outfit recommendation based on temperature
export function getStudentClothingGuide(temp: number, feelsLike: number) {
  const t = Math.round(feelsLike);
  if (t >= 28) {
    return {
      category: '한여름',
      uniform: '하복 (쿨소재) 또는 학교 반팔 체육복',
      outer: '겉옷 불필요 (실내 에어컨 대비 얇은 셔츠/바람막이 지참 추천)',
      accessories: ['손선풍기', '얼음물 텀블러', '선크림', '땀 흡수용 손수건'],
      summary: '매우 덥습니다! 학교 교실 에어컨 가동에 대비한 얇은 겉옷만 챙기세요.'
    };
  }
  if (t >= 23) {
    return {
      category: '초여름/늦봄',
      uniform: '하복 셔츠/생활복 또는 얇은 춘추복',
      outer: '등교 때 얇은 가디건이나 린넨 셔츠',
      accessories: ['자외선 차단제', '물병'],
      summary: '활동하기 쾌적하지만 낮엔 땀이 날 수 있어요. 하복/생활복이 편합니다.'
    };
  }
  if (t >= 17) {
    return {
      category: '온화한 봄/가을',
      uniform: '춘추복 (긴팔 셔츠/니트 조끼)',
      outer: '학교 후드집업, 바람막이 또는 가디건',
      accessories: ['물병', '가벼운 가방'],
      summary: '학생들이 가장 활동하기 좋은 날씨! 교복 위에 가디건이나 후드집업 걸치기 좋습니다.'
    };
  }
  if (t >= 12) {
    return {
      category: '선선한 환절기',
      uniform: '춘추복/동복 셔츠 + 교복 조끼/니트',
      outer: '교복 자켓(마이), 도톰한 후드집업, 야상/바람막이',
      accessories: ['따뜻한 물 텀블러'],
      summary: '아침 등굣길이 꽤 쌀쌀합니다. 교복 마이나 도톰한 후드집업을 꼭 챙기세요.'
    };
  }
  if (t >= 6) {
    return {
      category: '쌀쌀한 초겨울',
      uniform: '동복 풀착용 (셔츠 + 조끼/니트 + 마이)',
      outer: '경량 패딩, 코트, 기모 후드집업',
      accessories: ['따뜻한 차/물', '기모 스타킹/타이즈', '립밤'],
      summary: '체감온도가 낮으니 동복에 경량 패딩이나 도톰한 외투를 입고 등교하세요.'
    };
  }
  if (t >= 0) {
    return {
      category: '겨울 추위',
      uniform: '동복 + 기모 내의(히트텍) 추천',
      outer: '숏패딩 또는 롱패딩, 두꺼운 코트',
      accessories: ['핫팩', '장갑', '목도리', '보온 텀블러'],
      summary: '교실 환기 시 추울 수 있습니다. 내복/히트텍을 입고 패딩을 단단히 여미세요!'
    };
  }
  return {
    category: '한파 주의',
    uniform: '동복 풀착용 + 두꺼운 기모 내의/히트텍 필수',
    outer: '헤비 다운 롱패딩, 방한 외투',
    accessories: ['손난로/핫팩', '방한 마스크', '기모 목도리', '방한 장갑'],
    summary: '강력한 한파! 피부 노출을 최소화하고 핫팩을 양손 주머니에 꼭 챙기세요.'
  };
}

// Student PE Class Evaluation
export function evaluatePeClass(pm10: number, pm25: number, rainProb: number, temp: number) {
  if (rainProb >= 50) {
    return {
      canOutdoor: false,
      badge: '비 예보 (강당 실내 체육)',
      reason: `체육 시간대 강수 확률이 ${rainProb}%로 비가 예상되어 강당 실내 수업이 권장됩니다.`,
    };
  }
  if (pm25 >= 75 || pm10 >= 150) {
    return {
      canOutdoor: false,
      badge: '미세먼지 매우나쁨 (실내 전환)',
      reason: '미세먼지 경보 기준치 초과로 교육부 지침상 실내 강당 수업 권장 대상입니다.',
    };
  }
  if (pm25 >= 36 || pm10 >= 81) {
    return {
      canOutdoor: false,
      badge: '미세먼지 나쁨 (실내 권장)',
      reason: '초미세먼지 농도가 나쁨 수준입니다. 호흡기 민감 학생 마스크 착용 및 실내 활동을 권장합니다.',
    };
  }
  if (temp <= -5) {
    return {
      canOutdoor: false,
      badge: '혹한 경보 (실내 체육)',
      reason: '기온이 영하권으로 매우 낮아 실내 체육관 수업이 적합합니다.',
    };
  }
  if (temp >= 33) {
    return {
      canOutdoor: false,
      badge: '폭염 주의 (실내 체육)',
      reason: '낮 최고기온이 33°C를 초과해 야외 체육 시 일사병 위험이 있습니다.',
    };
  }
  return {
    canOutdoor: true,
    badge: '야외 운동장 가능',
    reason: '공기질 양호하고 날씨가 적절하여 신나게 운동장에서 축구/피구/체육활동을 할 수 있습니다!',
  };
}
