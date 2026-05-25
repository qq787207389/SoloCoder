import { useConcertStore } from '../store/useConcertStore';
import { concertScript } from './concertScript';

interface TimelineEvent {
  time: number;
  type: 'character' | 'light' | 'screen' | 'particle' | 'camera';
  data: Record<string, unknown>;
}

export class TimelineEngine {
  private lastProcessedEventIndex = 0;
  private isRunning = false;

  start() {
    this.isRunning = true;
    this.lastProcessedEventIndex = 0;
  }

  stop() {
    this.isRunning = false;
  }

  reset() {
    this.lastProcessedEventIndex = 0;
    this.isRunning = false;
  }

  update(currentTime: number) {
    if (!this.isRunning) return;

    const { events } = concertScript;
    
    while (
      this.lastProcessedEventIndex < events.length &&
      events[this.lastProcessedEventIndex].time <= currentTime
    ) {
      this.processEvent(events[this.lastProcessedEventIndex]);
      this.lastProcessedEventIndex++;
    }
  }

  private processEvent(event: TimelineEvent) {
    const { setCharacterState, setLightState, setScreenContent, setParticleConfig } = useConcertStore.getState();

    switch (event.type) {
      case 'character':
        setCharacterState(event.data as Partial<{
          position: [number, number, number];
          rotation: [number, number, number];
          animation: 'idle' | 'walk' | 'dance' | 'wave' | 'sing';
        }>);
        break;

      case 'light': {
        const { id, ...lightData } = event.data as { id: string; color?: string; intensity?: number };
        if (id) {
          setLightState(id, lightData);
        }
        break;
      }

      case 'screen':
        setScreenContent(event.data as {
          type: 'image' | 'video' | 'text' | 'animation';
          src?: string;
          text?: string;
          effect?: string;
        });
        break;

      case 'particle':
        setParticleConfig(event.data as Partial<{
          color: string;
          count: number;
          speed: number;
          type: 'glowstick' | 'sparkle' | 'confetti';
        }>);
        break;

      case 'camera':
        break;
    }
  }

  seekTo(time: number) {
    this.lastProcessedEventIndex = 0;
    const { events } = concertScript;
    
    while (
      this.lastProcessedEventIndex < events.length &&
      events[this.lastProcessedEventIndex].time <= time
    ) {
      this.processEvent(events[this.lastProcessedEventIndex]);
      this.lastProcessedEventIndex++;
    }
  }
}

export const timelineEngine = new TimelineEngine();
