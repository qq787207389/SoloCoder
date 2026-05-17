# Dynamic Obstacle Generation Algorithm

## Overview

The obstacle generation system is designed to create a fair, challenging, and unpredictable endless runner experience. It adapts to the player's current speed and distance traveled, ensuring the game remains engaging while never becoming impossible.

## Core Principles

### 1. Difficulty Scaling
- **Speed-based**: Faster speed = more frequent obstacles
- **Distance-based**: Further distance = harder patterns
- **Gradient**: Smooth, unnoticeable difficulty increase

### 2. Fairness Guarantees
- **No Unavoidable Patterns**: Every obstacle configuration has an escape route
- **Pattern Validation**: Predefined patterns ensure playability
- **Recovery Windows**: Guaranteed gaps after difficult sections

### 3. Variability
- **Randomized Patterns**: No two runs are identical
- **Theme Integration**: Obstacle types match environment theme
- **Dynamic Spacing**: Gaps adapt to current speed

## Algorithm Architecture

```
┌─────────────────────────────────────────────────────────┐
│                Obstacle Generator                        │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │ Difficulty   │───▶│ Pattern      │───▶│ Spawn    │  │
│  │ Calculator   │    │ Selector     │    │ System   │  │
│  └──────────────┘    └──────────────┘    └──────────┘  │
│         │                    │                   │       │
│         ▼                    ▼                   ▼       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │ Speed &      │    │ Pattern      │    │ Lane     │  │
│  │ Distance     │    │ Database     │    │ Position │  │
│  └──────────────┘    └──────────────┘    └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Difficulty Calculation

### Formula
```typescript
difficulty = 1 + min(distance / 500, 2)
```

- **Base difficulty**: 1.0 (start of game)
- **Max difficulty**: 3.0 (after 1000m)
- **Linear scaling**: +0.5 difficulty every 250m

### Effects on Gameplay

| Difficulty | Obstacle Freq | Complexity | Double Obstacles |
|------------|---------------|------------|------------------|
| 1.0 - 1.5  | 1 every 10-15m| Simple     | Rare (<10%)      |
| 1.5 - 2.5  | 1 every 8-12m | Medium     | Common (30%)     |
| 2.5 - 3.0  | 1 every 6-10m | Complex    | Frequent (50%)   |

## Obstacle Patterns

### Pattern Database

```typescript
patterns = [
  // Level 1: Single obstacles (always available)
  { obstacles: [{ lane: 0, type: 'treeStump' }], minGap: 8 },
  { obstacles: [{ lane: 1, type: 'fence' }], minGap: 8 },
  { obstacles: [{ lane: 2, type: 'rock' }], minGap: 8 },
  
  // Level 2: Overhead obstacles (difficulty > 1.5)
  { obstacles: [{ lane: 1, type: 'beam' }], minGap: 10 },
  { obstacles: [{ lane: 0, type: 'spikes' }], minGap: 10 },
  { obstacles: [{ lane: 1, type: 'branch' }], minGap: 10 },
  
  // Level 3: Dynamic hazards (difficulty > 2.0)
  { obstacles: [{ lane: 2, type: 'fire' }], minGap: 12 },
  
  // Level 4: Multi-lane patterns (difficulty > 2.5)
  {
    obstacles: [
      { lane: 0, type: 'treeStump' },
      { lane: 2, type: 'rock' },
    ],
    minGap: 12,
  },
  {
    obstacles: [
      { lane: 0, type: 'fence' },
      { lane: 1, type: 'beam' },
    ],
    minGap: 15,
  },
]
```

### Pattern Selection Logic

1. **Filter by Difficulty**: Only patterns appropriate for current difficulty
2. **Weighted Random**: Higher weight to simpler patterns at low difficulty
3. **Anti-Repetition**: Consecutive identical patterns are avoided
4. **Gap Enforcement**: Minimum distance between obstacle groups

## Spacing Algorithm

### Dynamic Gap Calculation

```typescript
baseGap = 8  // meters
adjustedGap = baseGap / (1 + (difficulty - 1) * 0.3)
actualGap = adjustedGap + random(-2, 3)
```

### Gap Validation

- **Minimum Gap**: 5 meters at max speed
- **Recovery Rule**: After any multi-obstacle pattern, guaranteed 15m gap
- **Speed Compensation**: Faster speed = slightly larger gaps for reaction time

## Obstacle Placement

### Lane Selection Rules

1. **Player Tracking**: (Future) Bias obstacles toward player's current lane
2. **Uniform Distribution**: Equal probability for all lanes over time
3. **Avoid Clustering**: Same lane doesn't get consecutive obstacles

### Vertical Placement

| Type       | Height | Action Required |
|------------|--------|-----------------|
| treeStump  | 1m     | Jump or switch  |
| fence      | 2m     | Jump or switch  |
| rock       | 1.2m   | Jump or switch  |
| beam       | 1.5m   | Slide           |
| branch     | 1.8m   | Slide           |
| spikes     | 0.3m   | Jump            |
| fire       | 2m     | Jump or switch  |

## Coin Generation

### Placement Strategy

- **Coin Lines**: 3-5 coins in a straight line in one lane
- **Wave Patterns**: Vertical sine wave patterns for visual appeal
- **Risk-Reward**: Coin clusters near obstacles to encourage daring plays

### Density Formula

```typescript
coinDensity = 0.3 + (3 - difficulty) * 0.1
```

- More coins early game to encourage resurrection use
- Fewer coins at high difficulty to maintain challenge

## Powerup Generation

### Spawn Rules

- **Base Chance**: 2% chance per spawn check
- **Distance Scaling**: +0.5% per 500m (max 4%)
- **No Clustering**: Minimum 200m between powerups
- **Balanced Distribution**: Equal probability for all powerup types

### Powerup Balance

| Powerup     | Duration | Rarity | Game Impact |
|-------------|----------|--------|-------------|
| Magnet      | 5s       | Common | Coin farming |
| Shield      | 8s       | Medium | Survival boost |
| Double Score| 10s      | Rare   | Score explosion |

## Deadlock Prevention

### Safety Checks

1. **No Three-Lane Block**: Never block all three lanes simultaneously
2. **Overhead + Ground Safety**: No beam directly above ground obstacle
3. **Jump Chain Limit**: Maximum 2 consecutive jump-only obstacles
4. **Slide Chain Limit**: Maximum 2 consecutive slide-only obstacles

### Recovery System

If the algorithm detects a potential deadlock:
1. Abort current pattern spawn
2. Insert 20m clear section
3. Reduce difficulty temporarily by 0.2
4. Log for analytics

## Performance Optimizations

### O(1) Spawn Checks
- All calculations are constant time
- No loops over existing obstacles
- Random number generation optimized

### Memory Efficiency
- Patterns stored as simple objects
- No runtime heap allocations
- All calculations use stack variables

### Predictability
- Seeded random for reproducible runs
- Deterministic pattern selection
- No hidden state

## Tuning Guide

### Make Game Easier
1. Increase `OBSTACLE_MIN_GAP`
2. Lower `MAX_SPEED`
3. Reduce difficulty scaling factor
4. Increase powerup spawn chance

### Make Game Harder
1. Add more multi-lane patterns
2. Increase difficulty scaling rate
3. Reduce minimum gaps
4. Add "no-switch" obstacles (block 2 lanes)

### Balance Checklist
- [ ] Average run time 60-90 seconds for new players
- [ ] Expert players can reach 1000m+
- [ ] Resurrection feels valuable but not mandatory
- [ ] No "cheap" deaths from unavoidable obstacles
- [ ] Powerups feel impactful but not overpowered

## Future Enhancements

1. **ML Difficulty Adaptation**: Adjust based on player skill
2. **Environment Hazards**: Moving obstacles, falling debris
3. **Boss Sections**: Unique patterns every 500m
4. **Combo System**: Reward clean obstacle navigation
5. **Analytics Integration**: Track pattern success rates

---

*"The best difficulty curve is one the player never notices."* - Game Design Proverb
