import { http, HttpResponse } from 'msw';
import { getWeatherData, searchCities, CITIES } from './data';

export const handlers = [
  http.get('/api/weather/:cityId', ({ params }) => {
    const { cityId } = params;
    const data = getWeatherData(cityId as string);
    return HttpResponse.json(data);
  }),

  http.get('/api/cities/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const results = searchCities(query);
    return HttpResponse.json(results);
  }),

  http.get('/api/cities', () => {
    return HttpResponse.json(CITIES);
  }),

  http.get('/api/location', () => {
    return HttpResponse.json(CITIES[0]);
  }),
];
