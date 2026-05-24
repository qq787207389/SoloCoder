import type { Airport } from '../types';

export const AIRPORTS: Airport[] = [
  { id: '1', iata: 'PEK', icao: 'ZBAA', name: '北京首都国际机场', city: '北京', country: '中国', lat: 40.0799, lng: 116.5891, timezone: 'Asia/Shanghai' },
  { id: '2', iata: 'PVG', icao: 'ZSPD', name: '上海浦东国际机场', city: '上海', country: '中国', lat: 31.1433, lng: 121.8058, timezone: 'Asia/Shanghai' },
  { id: '3', iata: 'CAN', icao: 'ZGGG', name: '广州白云国际机场', city: '广州', country: '中国', lat: 23.3924, lng: 113.2988, timezone: 'Asia/Shanghai' },
  { id: '4', iata: 'HKG', icao: 'VHHH', name: '香港国际机场', city: '香港', country: '中国', lat: 22.3080, lng: 113.9185, timezone: 'Asia/Hong_Kong' },
  { id: '5', iata: 'NRT', icao: 'RJAA', name: '东京成田国际机场', city: '东京', country: '日本', lat: 35.7647, lng: 140.3864, timezone: 'Asia/Tokyo' },
  { id: '6', iata: 'SIN', icao: 'WSSS', name: '新加坡樟宜机场', city: '新加坡', country: '新加坡', lat: 1.3502, lng: 103.9944, timezone: 'Asia/Singapore' },
  { id: '7', iata: 'DXB', icao: 'OMDB', name: '迪拜国际机场', city: '迪拜', country: '阿联酋', lat: 25.2532, lng: 55.3657, timezone: 'Asia/Dubai' },
  { id: '8', iata: 'DOH', icao: 'OTHH', name: '哈马德国际机场', city: '多哈', country: '卡塔尔', lat: 25.2731, lng: 51.6081, timezone: 'Asia/Qatar' },
  { id: '9', iata: 'LHR', icao: 'EGLL', name: '伦敦希思罗机场', city: '伦敦', country: '英国', lat: 51.4700, lng: -0.4543, timezone: 'Europe/London' },
  { id: '10', iata: 'CDG', icao: 'LFPG', name: '巴黎戴高乐机场', city: '巴黎', country: '法国', lat: 49.0097, lng: 2.5479, timezone: 'Europe/Paris' },
  { id: '11', iata: 'FRA', icao: 'EDDF', name: '法兰克福国际机场', city: '法兰克福', country: '德国', lat: 50.0379, lng: 8.5622, timezone: 'Europe/Berlin' },
  { id: '12', iata: 'JFK', icao: 'KJFK', name: '纽约肯尼迪国际机场', city: '纽约', country: '美国', lat: 40.6413, lng: -73.7781, timezone: 'America/New_York' },
  { id: '13', iata: 'LAX', icao: 'KLAX', name: '洛杉矶国际机场', city: '洛杉矶', country: '美国', lat: 33.9425, lng: -118.4081, timezone: 'America/Los_Angeles' },
  { id: '14', iata: 'SFO', icao: 'KSFO', name: '旧金山国际机场', city: '旧金山', country: '美国', lat: 37.6213, lng: -122.3790, timezone: 'America/Los_Angeles' },
  { id: '15', iata: 'ORD', icao: 'KORD', name: '芝加哥奥黑尔国际机场', city: '芝加哥', country: '美国', lat: 41.9742, lng: -87.9073, timezone: 'America/Chicago' },
  { id: '16', iata: 'SYD', icao: 'YSSY', name: '悉尼金斯福德史密斯机场', city: '悉尼', country: '澳大利亚', lat: -33.9399, lng: 151.1753, timezone: 'Australia/Sydney' },
  { id: '17', iata: 'ICN', icao: 'RKSI', name: '首尔仁川国际机场', city: '首尔', country: '韩国', lat: 37.4602, lng: 126.4407, timezone: 'Asia/Seoul' },
  { id: '18', iata: 'BKK', icao: 'VTBS', name: '曼谷素万那普机场', city: '曼谷', country: '泰国', lat: 13.6900, lng: 100.7501, timezone: 'Asia/Bangkok' },
  { id: '19', iata: 'IST', icao: 'LTFM', name: '伊斯坦布尔机场', city: '伊斯坦布尔', country: '土耳其', lat: 41.2753, lng: 28.7519, timezone: 'Europe/Istanbul' },
  { id: '20', iata: 'AMS', icao: 'EHAM', name: '阿姆斯特丹史基浦机场', city: '阿姆斯特丹', country: '荷兰', lat: 52.3105, lng: 4.7683, timezone: 'Europe/Amsterdam' }
];

export const getAirportById = (id: string): Airport | undefined => {
  return AIRPORTS.find(a => a.id === id);
};

export const getRandomAirport = (): Airport => {
  return AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
};

export const getTwoDifferentAirports = (): [Airport, Airport] => {
  const idx1 = Math.floor(Math.random() * AIRPORTS.length);
  let idx2 = Math.floor(Math.random() * AIRPORTS.length);
  while (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * AIRPORTS.length);
  }
  return [AIRPORTS[idx1], AIRPORTS[idx2]];
};
