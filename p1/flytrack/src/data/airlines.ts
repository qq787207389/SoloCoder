import type { Airline } from '../types';

export const AIRLINES: Airline[] = [
  { id: '1', name: '中国国际航空', iata: 'CA', icao: 'CCA', color: '#C8102E' },
  { id: '2', name: '中国东方航空', iata: 'MU', icao: 'CES', color: '#003087' },
  { id: '3', name: '中国南方航空', iata: 'CZ', icao: 'CSN', color: '#00468B' },
  { id: '4', name: '海南航空', iata: 'HU', icao: 'CHH', color: '#E60012' },
  { id: '5', name: '国泰航空', iata: 'CX', icao: 'CPA', color: '#006272' },
  { id: '6', name: '新加坡航空', iata: 'SQ', icao: 'SIA', color: '#002F6C' },
  { id: '7', name: '阿联酋航空', iata: 'EK', icao: 'UAE', color: '#D71F25' },
  { id: '8', name: '卡塔尔航空', iata: 'QR', icao: 'QTR', color: '#8C1D40' },
  { id: '9', name: '汉莎航空', iata: 'LH', icao: 'DLH', color: '#FFC72C' },
  { id: '10', name: '英国航空', iata: 'BA', icao: 'BAW', color: '#0033A0' },
  { id: '11', name: '美国航空', iata: 'AA', icao: 'AAL', color: '#C8102E' },
  { id: '12', name: '达美航空', iata: 'DL', icao: 'DAL', color: '#C8102E' },
  { id: '13', name: '联合航空', iata: 'UA', icao: 'UAL', color: '#005DAA' },
  { id: '14', name: '日本航空', iata: 'JL', icao: 'JAL', color: '#C60C30' },
  { id: '15', name: '大韩航空', iata: 'KE', icao: 'KAL', color: '#0033A0' }
];

export const getAirlineById = (id: string): Airline | undefined => {
  return AIRLINES.find(a => a.id === id);
};

export const getRandomAirline = (): Airline => {
  return AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
};
