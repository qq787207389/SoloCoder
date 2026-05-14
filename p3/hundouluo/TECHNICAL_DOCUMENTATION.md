# Super Contra - Technical Documentation

## Boss Phase Switching & Level Event Scheduling System

### Overview
This document describes the technical implementation of two core systems in Super Contra:
1. **Boss Phase Switching** - Dynamic boss behavior based on health thresholds
2. **Level Event Scheduling** - Scripted enemy, item, and boss spawns based on camera position

---

## 1. Boss Phase Switching System

### Architecture
The Boss system uses a **state machine pattern** combined with **data-driven phase configuration** to create dynamic boss encounters that evolve as the fight progresses.

### Core Components

#### 1.1 BossPhase Enum
```typescript
export enum BossPhase {
  PHASE_1 = 1,  // Initial phase - basic attack patterns
  PHASE_2 = 2,  // Enhanced phase - additional attack types
  PHASE_3 = 3   // Final phase - bullet hell mode
}
```

#### 1.2 BossState Enum
Controls the boss's current behavior state:
```typescript
export enum BossState {
  IDLE = 'idle',        // Waiting between actions
  MOVE = 'move',        // Repositioning
  ATTACK = 'attack',    // Executing attack pattern
  TRANSITION = 'transition',  // Phase change animation
  DEAD = 'dead'         // Boss defeated
}
```

#### 1.3 Phase Configuration Interface
```typescript
export interface BossPhaseConfig {
  healthThreshold: number;    // % health to trigger this phase (0.66 = 66%)
  attackPatterns: string[];   // Available attack patterns
  speed: number;              // Movement speed
  damage: number;             // Bullet damage multiplier
}
```

### Phase Transition Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                     BATTLE PROGRESS                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│          CHECK PHASE THRESHOLD (EVERY FRAME)                │
│  healthPercent = currentHealth / maxHealth                  │
│  if healthPercent <= nextPhaseThreshold → START TRANSITION  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PHASE TRANSITION STATE                    │
│  • Stop all attack patterns                                  │
│  • Play visual transition effects (flashing, etc.)           │
│  • Increment phase counter                                   │
│  • Apply new phase configuration (speed, attacks)            │
│  • Duration: 2 seconds                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEW PHASE ACTIVATION                      │
│  • Activate new bullet emitters                              │
│  • Unlock new attack patterns                                │
│  • Increase movement speed                                   │
│  • Return to IDLE state                                      │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Details in FirstBoss

```typescript
// Example phase configuration for FirstBoss
protected setupPhaseConfigs(): void {
  this.phaseConfigs = [
    {
      healthThreshold: 0.66,    // Transition at 66% health
      attackPatterns: ['spiral', 'tracking'],
      speed: 100,
      damage: 1
    },
    {
      healthThreshold: 0.33,    // Transition at 33% health  
      attackPatterns: ['spiral', 'tracking', 'circular'],
      speed: 130,
      damage: 1
    },
    {
      healthThreshold: 0,       // Final phase
      attackPatterns: ['spiral', 'tracking', 'circular', 'barrage'],
      speed: 160,
      damage: 2
    }
  ];
}
```

#### Phase Change Callback
```typescript
protected onPhaseChange(newPhase: BossPhase): void {
  this.setupEmittersForPhase(newPhase);
}

private setupEmittersForPhase(phase: BossPhase): void {
  this.bulletEmitters.forEach(e => e.stop());
  this.bulletEmitters = [];
  
  // PHASE 1: Single central emitter
  // PHASE 2: + Left/Right emitters (total 3)
  // PHASE 3: All emitters with enhanced patterns
}
```

---

## 2. Level Event Scheduling System

### Architecture
The Level Manager uses a **position-based event system** that triggers scripted events as the camera scrolls through the level. This creates a curated gameplay experience with controlled difficulty progression.

### Core Components

#### 2.1 LevelEvent Interface
```typescript
export interface LevelEvent {
  position: number;           // Camera X position to trigger event
  type: 'enemy' | 'boss' | 'item' | 'scroll_stop' | 'message';
  data: any;                  // Event-specific data
  triggered: boolean;         // Has event been executed?
}
```

#### 2.2 LevelConfig Interface
```typescript
export interface LevelConfig {
  name: string;               // Level display name
  length: number;             // Total level length (pixels)
  events: LevelEvent[];       // Array of all events
  backgroundMusic?: string;   // Optional music track
}
```

### Event Scheduling Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                  CAMERA POSITION UPDATE                      │
│              Every frame: currentPosition = camera.x         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   EVENT TRIGGER CHECK                        │
│  for each event in config.events:                            │
│    if !event.triggered && currentPosition >= event.position  │
│      → triggerEvent(event)                                   │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   SPAWN ENEMY   │  │   SPAWN ITEM    │  │   SPAWN BOSS    │
│  • Patrol       │  • Weapon Upgrade  │  • Stop Scrolling  │
│  • Turret       │  • Bomb            │  • Spawn Boss      │
│  • Flying       │  • Shield          │  • Boss Health UI  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Example Level 1 Event Timeline

```
Camera Position (pixels)
     │
  150├──► Patrol Enemy x1
  250├──► Patrol Enemy x1  
  350├──► Shotgun Weapon Pickup
  450├──► Turret Enemy x1
  550├──► Patrol Enemy x1
  650├──► Flying Enemy x1
  750├──► Bomb Pickup
  850├──► Turret Enemy x1
  900├──► Turret Enemy x1 (Elevated)
 1000├──► Flying Enemy x2
 1200├──► Machinegun Weapon Pickup
 1300├──► Patrol Enemy x2
 1450├──► Shield Pickup
 1550├──► Turret Enemy x1
 1650├──► Flying Enemy x1
 1750├──► Laser Weapon Pickup
 1850├──► SCROLL STOP (Freeze Camera)
 1900└──► BOSS SPAWN - FirstBoss
```

### Event Implementation

#### Enemy Spawning
```typescript
private spawnEnemy(data: any): void {
  let enemy;
  switch (data.enemyType) {
    case 'patrol':
      enemy = new PatrolEnemy(this.game, data.x, data.y);
      break;
    case 'turret':
      enemy = new TurretEnemy(this.game, data.x, data.y);
      break;
    case 'flying':
      enemy = new FlyingEnemy(this.game, data.x, data.y);
      break;
  }
  if (enemy) this.game.addEnemy(enemy);
}
```

#### Boss Spawning with Scroll Lock
```typescript
private spawnBoss(data: any): void {
  if (this.bossSpawned) return;
  this.bossSpawned = true;
  
  const boss = new FirstBoss(this.game, data.x, data.y);
  this.game.addBoss(boss);
  
  // Game.bossActive flag stops auto-scrolling
  // Player must defeat boss to proceed
}
```

---

## 3. Integration with Other Systems

### 3.1 Bullet Emitter System
Each phase change activates different BulletEmitter configurations:
- **LINEAR**: Directed bullet patterns
- **CIRCULAR**: 360-degree bullet spreads  
- **SPIRAL**: Rotating bullet patterns
- **TRACKING**: Homing bullets targeting player

### 3.2 UI System Integration
The Boss health bar UI automatically:
- Displays when boss is active
- Shows current phase number
- Color-codes health (Green → Yellow → Red)
- Updates in real-time during phase transitions

### 3.3 Spatial Hash Optimization
All entities (player, enemies, bullets) are registered with the SpatialHash grid for efficient collision detection, even during intense bullet hell phases.

---

## 4. Key Design Decisions

### 4.1 Why Position-Based vs Time-Based Events?
- **Position-based** ensures consistent player experience regardless of movement speed
- Players can't "outrun" enemy spawns
- Difficulty scaling is consistent across playthroughs

### 4.2 Why Health Thresholds for Phases?
- Creates natural difficulty progression
- Rewards skillful play with faster phase transitions
- Provides visual feedback of battle progress

### 4.3 Why Data-Driven Configuration?
- Easy to balance and tweak without code changes
- Designers can create new bosses/levels independently
- Supports modding and community content

---

## 5. Performance Considerations

1. **Event Checking**: O(n) check each frame, but n is small (~20-50 events per level)
2. **Phase Transitions**: Object pooling ensures no GC spikes during bullet cleanup
3. **Emitter Management**: Inactive emitters are stopped immediately to reduce update load

---

## 6. Extending the System

### Adding New Boss Phases
```typescript
// 1. Add to BossPhase enum
// 2. Add new phase config
// 3. Implement onPhaseChange handler for new phase
// 4. Add new attack patterns to executeAttackPattern()
```

### Adding New Event Types
```typescript
// 1. Extend LevelEvent type union
// 2. Add handler in triggerEvent() switch
// 3. Create corresponding data interface
```

This architecture provides a flexible, maintainable foundation for creating rich, dynamic Contra-style gameplay experiences.
