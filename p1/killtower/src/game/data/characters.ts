import type { Character } from '../types';

export const CHARACTERS: Character[] = [
  {
    id: 'warrior',
    name: '铁甲战士',
    description: '擅长近战和防御的勇士，拥有高生命值和强力攻击牌。',
    maxHp: 80,
    startingGold: 99,
    startingDeck: ['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash'],
    startingRelic: 'burningBlood',
    color: '#e74c3c'
  },
  {
    id: 'mage',
    name: '秘法法师',
    description: '精通奥术魔法的施法者，能够操纵元素和释放强力法术。',
    maxHp: 70,
    startingGold: 99,
    startingDeck: ['zap', 'zap', 'zap', 'zap', 'defend', 'defend', 'defend', 'defend', 'arcaneBlast', 'arcaneArmor'],
    startingRelic: 'crystalOrb',
    color: '#3498db'
  },
  {
    id: 'rogue',
    name: '暗影刺客',
    description: '灵活的暗杀者，擅长使用毒药和连击造成大量伤害。',
    maxHp: 75,
    startingGold: 99,
    startingDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'poisonBlade', 'backstab'],
    startingRelic: 'leatherBoots',
    color: '#9b59b6'
  }
];

export function getCharacter(id: string): Character | undefined {
  return CHARACTERS.find(c => c.id === id);
}
