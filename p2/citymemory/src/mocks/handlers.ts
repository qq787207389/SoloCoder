import { http, HttpResponse } from 'msw';
import type { Photo, Comment } from '../types';
import { mockPhotos, mockComments, getPhotoById, getCommentsByPhotoId } from './data/photos';

let photos = [...mockPhotos];
let comments = [...mockComments];

export const handlers = [
  http.get('/api/photos', ({ request }) => {
    const url = new URL(request.url);
    const decade = url.searchParams.get('decade');
    const radius = url.searchParams.get('radius');
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');

    let filteredPhotos = [...photos];

    if (decade && decade !== 'all') {
      filteredPhotos = filteredPhotos.filter(p => p.decade === decade);
    }

    if (radius && lat && lng) {
      const centerLat = parseFloat(lat);
      const centerLng = parseFloat(lng);
      const radiusKm = parseFloat(radius);
      
      filteredPhotos = filteredPhotos.filter(p => {
        const distance = getDistance(centerLat, centerLng, p.lat, p.lng);
        return distance <= radiusKm;
      });
    }

    return HttpResponse.json(filteredPhotos);
  }),

  http.get('/api/photos/:id', ({ params }) => {
    const id = params.id as string;
    const photo = getPhotoById(id);
    
    if (!photo) {
      return HttpResponse.json({ error: 'Photo not found' }, { status: 404 });
    }
    
    return HttpResponse.json(photo);
  }),

  http.get('/api/photos/:id/comments', ({ params }) => {
    const photoId = params.id as string;
    const photoComments = getCommentsByPhotoId(photoId);
    
    return HttpResponse.json(photoComments);
  }),

  http.post('/api/photos/:id/comments', async ({ params, request }) => {
    const photoId = params.id as string;
    const body = await request.json() as { content: string; author: string };
    
    const newComment: Comment = {
      id: `c${Date.now()}`,
      photoId,
      content: body.content,
      author: body.author || '匿名用户',
      createdAt: new Date().toISOString(),
    };
    
    comments.push(newComment);
    
    return HttpResponse.json(newComment, { status: 201 });
  }),

  http.post('/api/photos', async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const year = parseInt(formData.get('year') as string);
    const lat = parseFloat(formData.get('lat') as string);
    const lng = parseFloat(formData.get('lng') as string);
    const location = formData.get('location') as string;
    const author = formData.get('author') as string;
    const imageFile = formData.get('image') as File;

    const imageUrl = URL.createObjectURL(imageFile);
    const decade = getDecadeFromYear(year);

    const newPhoto: Photo = {
      id: `${Date.now()}`,
      title,
      imageUrl,
      description,
      year,
      decade,
      lat,
      lng,
      location,
      author: author || '匿名用户',
      createdAt: new Date().toISOString(),
    };

    photos.push(newPhoto);

    return HttpResponse.json(newPhoto, { status: 201 });
  }),

  http.get('/api/photos/timeline', () => {
    const sortedPhotos = [...photos].sort((a, b) => a.year - b.year);
    
    const grouped: Record<string, Photo[]> = {};
    sortedPhotos.forEach(photo => {
      const key = photo.year.toString();
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(photo);
    });

    return HttpResponse.json(grouped);
  }),
];

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getDecadeFromYear(year: number): Photo['decade'] {
  if (year < 1980) return '1970s';
  if (year < 1990) return '1980s';
  if (year < 2000) return '1990s';
  if (year < 2010) return '2000s';
  if (year < 2020) return '2010s';
  return '2020s';
}
