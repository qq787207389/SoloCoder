import { http, HttpResponse } from 'msw';
import { v4 as uuidv4 } from 'uuid';
import {
  getCurrentUser,
  getUsers,
  saveUsers,
  getPets,
  savePets,
  getPosts,
  savePosts,
  getReminders,
  saveReminders,
} from '../utils/storage';
import type { Pet, Post, Reminder } from '../types.ts';

const API_BASE = '/api';

export const handlers = [
  http.get(`${API_BASE}/user`, () => {
    const user = getCurrentUser();
    return HttpResponse.json({ user });
  }),

  http.get(`${API_BASE}/users`, () => {
    const users = getUsers();
    return HttpResponse.json({ users });
  }),

  http.get(`${API_BASE}/pets`, async ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    let pets = getPets();
    if (userId) {
      pets = pets.filter((pet) => pet.userId === userId);
    }
    return HttpResponse.json({ pets });
  }),

  http.post(`${API_BASE}/pets`, async ({ request }) => {
    const petData = (await request.json()) as Omit<Pet, 'id'>;
    const newPet: Pet = {
      ...petData,
      id: uuidv4(),
    };
    const pets = getPets();
    pets.unshift(newPet);
    savePets(pets);
    return HttpResponse.json({ pet: newPet });
  }),

  http.put(`${API_BASE}/pets/:id`, async ({ params, request }) => {
    const { id } = params;
    const petData = (await request.json()) as Partial<Pet>;
    const pets = getPets();
    const index = pets.findIndex((p) => p.id === id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Pet not found' }, { status: 404 });
    }
    pets[index] = { ...pets[index], ...petData };
    savePets(pets);
    return HttpResponse.json({ pet: pets[index] });
  }),

  http.delete(`${API_BASE}/pets/:id`, ({ params }) => {
    const { id } = params;
    let pets = getPets();
    pets = pets.filter((p) => p.id !== id);
    savePets(pets);
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_BASE}/posts`, async ({ request }) => {
    const url = new URL(request.url);
    const petId = url.searchParams.get('petId');
    const userId = url.searchParams.get('userId');
    const tag = url.searchParams.get('tag');
    let posts = getPosts();
    
    if (petId) {
      posts = posts.filter((post) => post.petId === petId);
    }
    if (userId) {
      posts = posts.filter((post) => post.userId === userId);
    }
    if (tag) {
      posts = posts.filter((post) => post.tags.includes(tag));
    }
    
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return HttpResponse.json({ posts });
  }),

  http.post(`${API_BASE}/posts`, async ({ request }) => {
    const postData = (await request.json()) as Omit<Post, 'id' | 'likes' | 'comments' | 'createdAt'>;
    const newPost: Post = {
      ...postData,
      id: uuidv4(),
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };
    const posts = getPosts();
    posts.unshift(newPost);
    savePosts(posts);
    return HttpResponse.json({ post: newPost });
  }),

  http.post(`${API_BASE}/posts/:id/like`, ({ params }) => {
    const { id } = params;
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return HttpResponse.json({ error: 'Not logged in' }, { status: 401 });
    }
    
    const posts = getPosts();
    const post = posts.find((p) => p.id === id);
    if (!post) {
      return HttpResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    const likeIndex = post.likes.indexOf(currentUser.id);
    if (likeIndex === -1) {
      post.likes.push(currentUser.id);
    } else {
      post.likes.splice(likeIndex, 1);
    }
    
    savePosts(posts);
    return HttpResponse.json({ post });
  }),

  http.post(`${API_BASE}/posts/:id/comment`, async ({ params, request }) => {
    const { id } = params;
    const { content } = (await request.json()) as { content: string };
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return HttpResponse.json({ error: 'Not logged in' }, { status: 401 });
    }
    
    const posts = getPosts();
    const post = posts.find((p) => p.id === id);
    if (!post) {
      return HttpResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    const newComment = {
      id: uuidv4(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
    };
    
    post.comments.push(newComment);
    savePosts(posts);
    return HttpResponse.json({ comment: newComment });
  }),

  http.get(`${API_BASE}/reminders`, async ({ request }) => {
    const url = new URL(request.url);
    const petId = url.searchParams.get('petId');
    let reminders = getReminders();
    if (petId) {
      reminders = reminders.filter((r) => r.petId === petId);
    }
    return HttpResponse.json({ reminders });
  }),

  http.post(`${API_BASE}/reminders`, async ({ request }) => {
    const reminderData = (await request.json()) as Omit<Reminder, 'id'>;
    const newReminder: Reminder = {
      ...reminderData,
      id: uuidv4(),
    };
    const reminders = getReminders();
    reminders.push(newReminder);
    saveReminders(reminders);
    return HttpResponse.json({ reminder: newReminder });
  }),

  http.put(`${API_BASE}/reminders/:id`, async ({ params, request }) => {
    const { id } = params;
    const reminderData = (await request.json()) as Partial<Reminder>;
    const reminders = getReminders();
    const index = reminders.findIndex((r) => r.id === id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }
    reminders[index] = { ...reminders[index], ...reminderData };
    saveReminders(reminders);
    return HttpResponse.json({ reminder: reminders[index] });
  }),

  http.delete(`${API_BASE}/reminders/:id`, ({ params }) => {
    const { id } = params;
    let reminders = getReminders();
    reminders = reminders.filter((r) => r.id !== id);
    saveReminders(reminders);
    return HttpResponse.json({ success: true });
  }),
];
