
import { Upgrade } from '../types';

export const UPGRADES: Upgrade[] = [
  {
    id: 'damage_1',
    name: '攻击力 +20%',
    description: '提升 20% 伤害',
    icon: '⚔️',
    type: 'attack',
    apply: (player) =&gt; { player.damage *= 1.2; }
  },
  {
    id: 'damage_2',
    name: '攻击力 +50%',
    description: '提升 50% 伤害',
    icon: '🗡️',
    type: 'attack',
    apply: (player) =&gt; { player.damage *= 1.5; }
  },
  {
    id: 'fire_rate_1',
    name: '攻击速度 +20%',
    description: '提升 20% 攻击速度',
    icon: '⚡',
    type: 'attack',
    apply: (player) =&gt; { player.fireRate *= 0.8; }
  },
  {
    id: 'bullet_count_1',
    name: '子弹数量 +1',
    description: '增加 1 颗子弹',
    icon: '🎯',
    type: 'attack',
    apply: (player) =&gt; { player.bulletCount += 1; }
  },
  {
    id: 'speed_1',
    name: '移动速度 +25%',
    description: '提升 25% 移动速度',
    icon: '👟',
    type: 'speed',
    apply: (player) =&gt; { player.speed *= 1.25; }
  },
  {
    id: 'speed_2',
    name: '移动速度 +50%',
    description: '提升 50% 移动速度',
    icon: '🏃',
    type: 'speed',
    apply: (player) =&gt; { player.speed *= 1.5; }
  },
  {
    id: 'health_1',
    name: '最大生命 +30',
    description: '增加 30 点最大生命',
    icon: '❤️',
    type: 'defense',
    apply: (player) =&gt; { player.maxHealth += 30; player.health += 30; }
  },
  {
    id: 'health_2',
    name: '最大生命 +50',
    description: '增加 50 点最大生命',
    icon: '💖',
    type: 'defense',
    apply: (player) =&gt; { player.maxHealth += 50; player.health += 50; }
  },
  {
    id: 'heal_1',
    name: '恢复生命',
    description: '恢复 30 点生命',
    icon: '💚',
    type: 'defense',
    apply: (player) =&gt; { player.health = Math.min(player.maxHealth, player.health + 30); }
  },
  {
    id: 'magnet_1',
    name: '经验吸引范围 +50%',
    description: '提升经验球吸引范围',
    icon: '🧲',
    type: 'special',
    apply: (player) =&gt; { player.magnetRange *= 1.5; }
  },
  {
    id: 'bullet_size_1',
    name: '子弹大小 +30%',
    description: '增大子弹体积',
    icon: '🔵',
    type: 'attack',
    apply: (player) =&gt; { player.bulletSize *= 1.3; }
  },
  {
    id: 'bullet_speed_1',
    name: '子弹速度 +30%',
    description: '提升子弹飞行速度',
    icon: '💨',
    type: 'attack',
    apply: (player) =&gt; { player.bulletSpeed *= 1.3; }
  }
];

export function getRandomUpgrades(count: number): Upgrade[] {
  const shuffled = [...UPGRADES].sort(() =&gt; Math.random() - 0.5);
  return shuffled.slice(0, count);
}
