export type Decade = '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s';

export interface Photo {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  year: number;
  decade: Decade;
  lat: number;
  lng: number;
  location: string;
  author: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  photoId: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface FilterOptions {
  decade?: Decade | 'all';
  radius?: number;
  centerLat?: number;
  centerLng?: number;
}

export interface UploadPhotoData {
  title: string;
  description: string;
  year: number;
  lat: number;
  lng: number;
  location: string;
  author: string;
  image: File;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  photo: Photo;
}

export type DecadeOption = {
  value: Decade | 'all';
  label: string;
  color: string;
};

export const DECADE_OPTIONS: DecadeOption[] = [
  { value: 'all', label: '全部', color: '#8B7355' },
  { value: '1970s', label: '70年代', color: '#8B4513' },
  { value: '1980s', label: '80年代', color: '#CD853F' },
  { value: '1990s', label: '90年代', color: '#D4702C' },
  { value: '2000s', label: '00年代', color: '#DAA520' },
  { value: '2010s', label: '10年代', color: '#B8860B' },
  { value: '2020s', label: '20年代', color: '#A0522D' },
];

export const getDecadeColor = (decade: Decade): string => {
  const option = DECADE_OPTIONS.find(opt => opt.value === decade);
  return option?.color || '#8B7355';
};

export const getYearToDecade = (year: number): Decade => {
  if (year < 1980) return '1970s';
  if (year < 1990) return '1980s';
  if (year < 2000) return '1990s';
  if (year < 2010) return '2000s';
  if (year < 2020) return '2010s';
  return '2020s';
};
