import { ItemType, ITEM_TYPES } from '../constants';

type BehaviorStatus = 'success' | 'failure' | 'running';

interface BehaviorNode {
  execute(context: BossAIContext): BehaviorStatus;
}

export interface BossAIContext {
  hp: number;
  maxHP: number;
  playerLines: number;
  playerCharge: number;
  difficulty: number;
  lastAttackTime: number;
  currentTime: number;
}

class SequenceNode implements BehaviorNode {
  private children: BehaviorNode[];

  constructor(children: BehaviorNode[]) {
    this.children = children;
  }

  execute(context: BossAIContext): BehaviorStatus {
    for (const child of this.children) {
      const status = child.execute(context);
      if (status !== 'success') {
        return status;
      }
    }
    return 'success';
  }
}

class SelectorNode implements BehaviorNode {
  private children: BehaviorNode[];

  constructor(children: BehaviorNode[]) {
    this.children = children;
  }

  execute(context: BossAIContext): BehaviorStatus {
    for (const child of this.children) {
      const status = child.execute(context);
      if (status !== 'failure') {
        return status;
      }
    }
    return 'failure';
  }
}

class ConditionNode implements BehaviorNode {
  private condition: (context: BossAIContext) => boolean;

  constructor(condition: (context: BossAIContext) => boolean) {
    this.condition = condition;
  }

  execute(context: BossAIContext): BehaviorStatus {
    return this.condition(context) ? 'success' : 'failure';
  }
}

class AttackActionNode implements BehaviorNode {
  private attackType: ItemType;
  private cooldown: number;
  private onAttack: (type: ItemType) => void;

  constructor(attackType: ItemType, cooldown: number, onAttack: (type: ItemType) => void) {
    this.attackType = attackType;
    this.cooldown = cooldown;
    this.onAttack = onAttack;
  }

  execute(context: BossAIContext): BehaviorStatus {
    if (context.currentTime - context.lastAttackTime >= this.cooldown) {
      this.onAttack(this.attackType);
      return 'success';
    }
    return 'failure';
  }
}

export class BossAI {
  private behaviorTree: BehaviorNode;
  private lastAttackTime: number;
  public onAttack: (type: ItemType) => void = () => {};

  constructor() {
    this.lastAttackTime = 0;
    this.behaviorTree = this.buildBehaviorTree();
  }

  private buildBehaviorTree(): BehaviorNode {
    return new SelectorNode([
      new SequenceNode([
        new ConditionNode(ctx => ctx.hp / ctx.maxHP < 0.3),
        new ConditionNode(ctx => ctx.currentTime - ctx.lastAttackTime >= 3000),
        new AttackActionNode('ADD_LINES', 3000, type => this.onAttack(type))
      ]),
      new SequenceNode([
        new ConditionNode(ctx => ctx.playerCharge >= 50),
        new ConditionNode(ctx => ctx.currentTime - ctx.lastAttackTime >= 4000),
        new AttackActionNode('SHUFFLE', 4000, type => this.onAttack(type))
      ]),
      new SequenceNode([
        new ConditionNode(ctx => ctx.playerLines >= 20),
        new ConditionNode(ctx => ctx.currentTime - ctx.lastAttackTime >= 5000),
        new AttackActionNode('SPEED_UP', 5000, type => this.onAttack(type))
      ]),
      new SequenceNode([
        new ConditionNode(ctx => ctx.currentTime - ctx.lastAttackTime >= 6000),
        new AttackActionNode('ADD_LINES', 6000, type => this.onAttack(type))
      ])
    ]);
  }

  update(
    currentTime: number,
    hp: number,
    maxHP: number,
    playerLines: number,
    playerCharge: number,
    difficulty: number
  ): void {
    const context: BossAIContext = {
      hp,
      maxHP,
      playerLines,
      playerCharge,
      difficulty,
      lastAttackTime: this.lastAttackTime,
      currentTime
    };

    const status = this.behaviorTree.execute(context);
    if (status === 'success') {
      this.lastAttackTime = currentTime;
    }
  }

  reset(): void {
    this.lastAttackTime = 0;
  }
}
