import { Animal, AnimalState, AnimalType, ItemType } from './types';

const ANIMAL_CONFIG: Record<AnimalType, { speed: number; detectRange: number; attackRange: number; attackDamage: number; attackCooldown: number }> = {
  [AnimalType.BOAR]: { speed: 50, detectRange: 150, attackRange: 30, attackDamage: 15, attackCooldown: 1 },
  [AnimalType.SNAKE]: { speed: 30, detectRange: 80, attackRange: 20, attackDamage: 20, attackCooldown: 1.5 },
  [AnimalType.WOLF]: { speed: 80, detectRange: 250, attackRange: 35, attackDamage: 25, attackCooldown: 0.8 }
};

export class AnimalSystem {
  static update(animal: Animal, playerX: number, playerY: number, deltaTime: number, currentTime: number): number {
    if (animal.state === AnimalState.DEAD) return 0;

    const config = ANIMAL_CONFIG[animal.type];
    const dx = playerX - animal.x;
    const dy = playerY - animal.y;
    const distToPlayer = Math.sqrt(dx * dx + dy * dy);

    if (animal.health <= 0) {
      animal.state = AnimalState.DEAD;
      return 0;
    }

    if (distToPlayer < config.attackRange) {
      animal.state = AnimalState.ATTACK;
    } else if (distToPlayer < config.detectRange) {
      animal.state = AnimalState.CHASE;
    } else {
      animal.state = AnimalState.PATROL;
    }

    switch (animal.state) {
      case AnimalState.PATROL:
        return this.patrol(animal, deltaTime, config.speed * 0.3);
      case AnimalState.CHASE:
        return this.chase(animal, playerX, playerY, deltaTime, config.speed);
      case AnimalState.ATTACK:
        return this.attack(animal, playerX, playerY, currentTime, config.attackDamage, config.attackCooldown);
      default:
        return 0;
    }
  }

  private static patrol(animal: Animal, deltaTime: number, speed: number): number {
    const tdx = animal.targetX - animal.x;
    const tdy = animal.targetY - animal.y;
    const targetDist = Math.sqrt(tdx * tdx + tdy * tdy);

    if (targetDist < 10) {
      animal.targetX = animal.x + (Math.random() - 0.5) * 200;
      animal.targetY = animal.y + (Math.random() - 0.5) * 200;
    } else {
      const moveX = (tdx / targetDist) * speed * deltaTime;
      const moveY = (tdy / targetDist) * speed * deltaTime;
      animal.x += moveX;
      animal.y += moveY;
    }
    return 0;
  }

  private static chase(animal: Animal, playerX: number, playerY: number, deltaTime: number, speed: number): number {
    const dx = playerX - animal.x;
    const dy = playerY - animal.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      animal.x += (dx / dist) * speed * deltaTime;
      animal.y += (dy / dist) * speed * deltaTime;
    }
    return 0;
  }

  private static attack(animal: Animal, _playerX: number, _playerY: number, currentTime: number, damage: number, cooldown: number): number {
    if (currentTime - animal.lastAttackTime > cooldown) {
      animal.lastAttackTime = currentTime;
      return damage;
    }
    return 0;
  }

  static getLoot(animal: Animal): { item: ItemType; count: number }[] {
    const loot: { item: ItemType; count: number }[] = [];
    
    if (animal.type === AnimalType.BOAR) {
      loot.push({ item: ItemType.RAW_MEAT, count: 2 + Math.floor(Math.random() * 2) });
      if (Math.random() < 0.5) {
        loot.push({ item: ItemType.FIBER, count: 1 + Math.floor(Math.random() * 2) });
      }
    } else if (animal.type === AnimalType.WOLF) {
      loot.push({ item: ItemType.RAW_MEAT, count: 2 });
    }
    
    return loot;
  }
}
