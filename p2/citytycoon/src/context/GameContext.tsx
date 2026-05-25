import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { GameState, TileType, BuildingType, Position } from '../types';
import { createInitialState, placeRoad, placeZone, placeBuilding, demolish, removeNotification } from '../game/GameState';
import { gameTick, setTool, setPaused, setSpeed, selectPosition, updateCamera } from '../game/GameEngine';

type GameAction =
  | { type: 'TICK' }
  | { type: 'SET_TOOL'; payload: string }
  | { type: 'SET_PAUSED'; payload: boolean }
  | { type: 'SET_SPEED'; payload: number }
  | { type: 'SELECT_POSITION'; payload: Position | null }
  | { type: 'PLACE_ROAD'; payload: Position }
  | { type: 'PLACE_ZONE'; payload: { position: Position; zoneType: TileType } }
  | { type: 'PLACE_BUILDING'; payload: { position: Position; buildingType: BuildingType } }
  | { type: 'DEMOLISH'; payload: Position }
  | { type: 'UPDATE_CAMERA'; payload: { x: number; y: number; zoom: number } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'RESET_GAME' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'TICK':
      return gameTick(state);
    case 'SET_TOOL':
      return setTool(state, action.payload);
    case 'SET_PAUSED':
      return setPaused(state, action.payload);
    case 'SET_SPEED':
      return setSpeed(state, action.payload);
    case 'SELECT_POSITION':
      return selectPosition(state, action.payload);
    case 'PLACE_ROAD':
      return placeRoad(state, action.payload);
    case 'PLACE_ZONE':
      return placeZone(state, action.payload.position, action.payload.zoneType);
    case 'PLACE_BUILDING':
      return placeBuilding(state, action.payload.position, action.payload.buildingType);
    case 'DEMOLISH':
      return demolish(state, action.payload);
    case 'UPDATE_CAMERA':
      return updateCamera(state, action.payload.x, action.payload.y, action.payload.zoom);
    case 'REMOVE_NOTIFICATION':
      return removeNotification(state, action.payload);
    case 'RESET_GAME':
      return createInitialState();
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  handleTileClick: (position: Position) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);
  const animationRef = useRef<number>();
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    const tickInterval = 500;

    const gameLoop = (timestamp: number) => {
      if (timestamp - lastTickRef.current > tickInterval) {
        dispatch({ type: 'TICK' });
        lastTickRef.current = timestamp;
      }
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleTileClick = useCallback((position: Position) => {
    const { selectedTool } = state;

    switch (selectedTool) {
      case 'select':
        dispatch({ type: 'SELECT_POSITION', payload: position });
        break;
      case 'road':
        dispatch({ type: 'PLACE_ROAD', payload: position });
        break;
      case 'residential':
        dispatch({ type: 'PLACE_ZONE', payload: { position, zoneType: TileType.RESIDENTIAL } });
        break;
      case 'commercial':
        dispatch({ type: 'PLACE_ZONE', payload: { position, zoneType: TileType.COMMERCIAL } });
        break;
      case 'industrial':
        dispatch({ type: 'PLACE_ZONE', payload: { position, zoneType: TileType.INDUSTRIAL } });
        break;
      case 'water':
        dispatch({ type: 'PLACE_ZONE', payload: { position, zoneType: TileType.WATER } });
        break;
      case 'electricity':
        dispatch({ type: 'PLACE_ZONE', payload: { position, zoneType: TileType.ELECTRICITY } });
        break;
      case 'police':
        dispatch({ type: 'PLACE_BUILDING', payload: { position, buildingType: BuildingType.POLICE } });
        break;
      case 'fire_station':
        dispatch({ type: 'PLACE_BUILDING', payload: { position, buildingType: BuildingType.FIRE_STATION } });
        break;
      case 'school':
        dispatch({ type: 'PLACE_BUILDING', payload: { position, buildingType: BuildingType.SCHOOL } });
        break;
      case 'hospital':
        dispatch({ type: 'PLACE_BUILDING', payload: { position, buildingType: BuildingType.HOSPITAL } });
        break;
      case 'park':
        dispatch({ type: 'PLACE_BUILDING', payload: { position, buildingType: BuildingType.PARK } });
        break;
      case 'demolish':
        dispatch({ type: 'DEMOLISH', payload: position });
        break;
    }
  }, [state.selectedTool]);

  return (
    <GameContext.Provider value={{ state, dispatch, handleTileClick }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
