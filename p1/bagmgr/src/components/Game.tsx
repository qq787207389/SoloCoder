import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import MainMenu from '@/components/MainMenu';
import DungeonView from '@/components/DungeonView';
import Inventory from '@/components/Inventory';
import CombatView from '@/components/CombatView';
import LootView from '@/components/LootView';
import CampView from '@/components/CampView';
import ShopView from '@/components/ShopView';
import AltarView from '@/components/AltarView';
import StatusBar from '@/components/StatusBar';
import './Game.css';

export default function Game() {
  const { screen, player } = useGameStore();

  useEffect(() => {
    if (player.hp <= 0 && screen !== 'menu' && screen !== 'gameover') {
      useGameStore.getState().setScreen('gameover');
    }
  }, [player.hp, screen]);

  const renderScreen = () => {
    switch (screen) {
      case 'menu':
        return <MainMenu />;
      case 'dungeon':
        return (
          <div className="game-layout">
            <StatusBar />
            <div className="game-main">
              <DungeonView />
            </div>
          </div>
        );
      case 'inventory':
        return (
          <div className="game-layout">
            <StatusBar />
            <div className="game-main">
              <Inventory />
            </div>
          </div>
        );
      case 'combat':
        return (
          <div className="game-layout">
            <StatusBar />
            <div className="game-main">
              <CombatView />
            </div>
          </div>
        );
      case 'loot':
        return (
          <div className="game-layout">
            <StatusBar />
            <div className="game-main">
              <LootView />
            </div>
          </div>
        );
      case 'camp':
        return (
          <div className="game-layout">
            <StatusBar />
            <div className="game-main">
              <CampView />
            </div>
          </div>
        );
      case 'shop':
        return (
          <div className="game-layout">
            <StatusBar />
            <div className="game-main">
              <ShopView />
            </div>
          </div>
        );
      case 'altar':
        return (
          <div className="game-layout">
            <StatusBar />
            <div className="game-main">
              <AltarView />
            </div>
          </div>
        );
      case 'gameover':
        return (
          <div className="game-over-screen">
            <h1>💀 游戏结束</h1>
            <p>你倒在了地牢的深处...</p>
            <p>到达层数：第 {player.currentFloor} 层</p>
            <button
              className="btn btn-primary"
              onClick={() => useGameStore.getState().setScreen('menu')}
            >
              返回主菜单
            </button>
          </div>
        );
      case 'victory':
        return (
          <div className="victory-screen">
          <h1>🎉 胜利！</h1>
          <p>你成功征服了地牢！</p>
          <p>到达层数：第 {player.currentFloor} 层</p>
          <p>获得金币：{player.gold}</p>
          <button
            className="btn btn-primary"
            onClick={() => useGameStore.getState().setScreen('menu')}
          >
            返回主菜单
          </button>
        </div>
        );
      default:
        return <MainMenu />;
    }
  };

  return <div className="game-container">{renderScreen()}</div>;
}
