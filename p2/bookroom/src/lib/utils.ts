import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateICS(event: {
  title: string
  description: string
  location: string
  startTime: Date
  endTime: Date
}) {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bookroom//Event//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@bookroom`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(event.startTime)}`,
    `DTEND:${formatDate(event.endTime)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  return icsContent
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function calculateSimilarity(
  interests1: string[],
  interests2: string[]
): number {
  if (interests1.length === 0 || interests2.length === 0) return 0

  const set1 = new Set(interests1.map((i) => i.toLowerCase()))
  const set2 = new Set(interests2.map((i) => i.toLowerCase()))

  const intersection = [...set1].filter((x) => set2.has(x))
  const union = [...new Set([...set1, ...set2])]

  return intersection.length / union.length
}