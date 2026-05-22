import { setupWorker, type SetupWorker } from 'msw/browser';
import { handlers } from './handlers';

export let worker: SetupWorker | null = null;

export async function initMockServiceWorker() {
  if (typeof window !== 'undefined') {
    try {
      console.log('Initializing MSW...');
      worker = setupWorker(...handlers);
      
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
          options: {
            scope: '/',
          },
        },
      });
      
      console.log('✅ MSW started successfully');
      
      worker.events.on('request:start', ({ request }) => {
        console.log('MSW intercepted:', request.method, request.url);
      });
      
      worker.events.on('request:match', ({ request }) => {
        console.log('MSW matched:', request.method, request.url);
      });
      
      worker.events.on('request:unhandled', ({ request }) => {
        console.log('MSW unhandled:', request.method, request.url);
      });
      
    } catch (error) {
      console.error('❌ MSW failed to start:', error);
      throw error;
    }
  }
}
