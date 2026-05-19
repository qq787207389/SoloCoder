import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAppStore } from '../store/useAppStore';
import type { Song } from '../types';

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSwitchingSongRef = useRef(false);
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setAudioContext,
    setAnalyser,
    playNext,
  } = usePlayerStore();
  const { addToRecentPlays } = useAppStore();

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const initAudioContext = useCallback(() => {
    if (!audioRef.current) return;

    const existingCtx = usePlayerStore.getState().audioContext;
    if (existingCtx) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      const source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      setAudioContext(audioContext);
      setAnalyser(analyser);
    } catch (error) {
      console.warn('Audio context init failed:', error);
    }
  }, [setAudioContext, setAnalyser]);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      playNext();
    };

    const handleCanPlay = async () => {
      if (isPlaying && !isSwitchingSongRef.current) {
        try {
          await audio.play();
        } catch (error) {
          console.warn('Auto play failed:', error);
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [setCurrentTime, setDuration, playNext, isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const playNewSong = async () => {
      isSwitchingSongRef.current = true;
      const audio = audioRef.current!;

      try {
        audio.pause();
        audio.src = currentSong.audio;
        audio.load();

        initAudioContext();

        await audio.play();
        setIsPlaying(true);
        addToRecentPlays(currentSong);
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      } finally {
        isSwitchingSongRef.current = false;
      }
    };

    playNewSong();
  }, [currentSong, initAudioContext, setIsPlaying, addToRecentPlays]);

  useEffect(() => {
    if (!audioRef.current || isSwitchingSongRef.current) return;

    const audio = audioRef.current;

    if (isPlaying) {
      if (audio.paused) {
        audio.play().catch((error) => {
          console.warn('Play failed:', error);
          setIsPlaying(false);
        });
      }
    } else {
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [isPlaying, setIsPlaying]);

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const playSong = (song: Song, playlist?: Song[]) => {
    if (playlist) {
      usePlayerStore.getState().setPlaylist(playlist);
    }
    usePlayerStore.getState().setCurrentSong(song);
  };

  return {
    audioRef,
    seek,
    playSong,
  };
};
