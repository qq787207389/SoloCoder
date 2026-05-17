# 🏛️ Temple Escape - 3D Endless Runner

A modern, high-performance 3D endless runner game built with TypeScript, Vite, and Three.js. Run through procedurally generated environments, dodge obstacles, collect coins, and survive as long as possible!

## ✨ Features

### 🎮 Gameplay
- **3 Lane System**: Smooth left/right lane switching
- **Jump & Slide**: Avoid obstacles with vertical movement
- **Progressive Difficulty**: Speed increases over time
- **Resurrection System**: Use coins to continue after death
- **High Score Tracking**: Persistent localStorage high score

### 🎨 Visuals
- **3 Dynamic Themes**: Forest 🌲, City 🏙️, Cave 🦇
- **Procedural Track Generation**: Infinite scrolling terrain
- **Dynamic Obstacles**: 7+ obstacle types (trees, fences, rocks, beams, spikes, fire)
- **Particle Effects**: Dust trails from running
- **Atmospheric Fog**: Distance fog for depth perception
- **Smooth Camera**: Follows player with road curvature effects

### 💎 Powerups
- **🧲 Magnet**: Automatically attracts nearby coins (5s)
- **🛡️ Shield**: Blocks one collision damage (8s)
- **✨ Double Score**: Doubles all points earned (10s)

### 📱 Platform Support
- **Keyboard Controls**: Arrow keys or WASD
- **Touch Controls**: Swipe gestures for mobile
- **Responsive Design**: Works on desktop and mobile

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The game will be available at `http://localhost:5173`

## 🎯 Controls

### Keyboard
- **← / A**: Move left
- **→ / D**: Move right
- **↑ / W / Space**: Jump
- **↓ / S**: Slide

### Touch
- **Swipe Left**: Move left
- **Swipe Right**: Move right
- **Swipe Up**: Jump
- **Swipe Down**: Slide

## 🏗️ Architecture

### Project Structure
```
src/
├── game/
│   ├── core/
│   ├── entities/
│   │   ├── Player.ts        # Player character logic
│   │   ├── Obstacle.ts      # Obstacle types & behavior
│   │   ├── Coin.ts          # Coin collectible
│   │   └── Powerup.ts       # Powerup items
│   ├── systems/
│   │   ├── InputSystem.ts   # Input handling
│   │   ├── ObstacleGenerator.ts  # Procedural obstacle spawning
│   │   ├── ParticleSystem.ts     # Particle effects
│   │   └── TrackSegment.ts  # Track generation
│   ├── config/
│   │   ├── GameConfig.ts    # Game balance constants
│   │   └── ThemeConfig.ts   # Visual theme definitions
│   ├── utils/
│   │   ├── ObjectPool.ts    # Object pooling for performance
│   │   └── MathUtils.ts     # Math helper functions
│   └── Game.ts              # Main game controller
├── style.css                # UI styles
└── main.ts                  # Application entry
```

### Key Systems

#### Object Pooling
- Reuses objects instead of creating/destroying them
- Eliminates garbage collection stutters
- Applied to: Track segments, obstacles, coins, particles

#### Procedural Generation
- Obstacles spawn based on difficulty and speed
- Pattern-based spawning ensures fair gameplay
- Themes transition every 300 meters

#### Collision Detection
- AABB (Axis-Aligned Bounding Box) collision
- Optimized for performance
- Shield powerup blocks one collision

## ⚡ Performance Optimizations

### Rendering
- **Shadow Mapping**: Soft shadows with optimized resolution
- **Frustum Culling**: Three.js built-in culling
- **Object Pooling**: No GC during gameplay
- **Texture Atlases**: (Future optimization)

### Mobile
- **Responsive UI**: Adaptive layouts for all screen sizes
- **Touch Optimization**: Gesture recognition with threshold tuning
- **Render Quality**: Lower shadow resolution on mobile

### Code
- **TypeScript**: Full type safety
- **Modular Architecture**: Separation of concerns
- **Delta Time**: Frame-rate independent movement
- **Event-driven Input**: No polling overhead

## ⚙️ Configuration

Game balance can be adjusted in `src/game/config/GameConfig.ts`:

```typescript
export const GameConfig = {
  LANE_COUNT: 3,
  INITIAL_SPEED: 15,
  MAX_SPEED: 45,
  SPEED_INCREMENT: 0.5,
  JUMP_FORCE: 12,
  GRAVITY: 30,
  COIN_VALUE: 10,
  RESURRECTION_COST: 50,
  // ... more settings
};
```

Themes and obstacle properties can be adjusted in `ThemeConfig.ts`.

## 🎵 Audio (Future Enhancement)

Currently a visual-only game. Planned audio features:
- Running footsteps
- Jump/landing sounds
- Coin collection chimes
- Powerup activation sounds
- Collision/death effects
- Background ambient music

## 📊 Technical Details

### Render Pipeline
- **WebGL 2.0** via Three.js
- **PBR Materials**: Metalness/roughness workflow
- **Directional Light**: Sun with shadow mapping
- **Ambient Light**: Base illumination
- **Fog**: Exponential fog for atmosphere

### Physics
- **Gravity Simulation**: 30 units/s²
- **Jump Physics**: Impulse-based jumping
- **Lane Interpolation**: Smooth 5Hz position interpolation
- **Speed Scaling**: All physics time-scaled by current speed

### Memory Management
- Object pools initialized at startup
- No dynamic allocations during gameplay
- All vectors and objects reused
- Event listeners properly cleaned up

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
1. More obstacle types
2. Additional powerups
3. Audio system
4. Post-processing effects (bloom, motion blur)
5. Character customization
6. Leaderboard system
7. More track themes

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- Inspired by classic endless runners like Temple Run and Subway Surfers
- Built with Three.js - https://threejs.org/
- Powered by Vite - https://vitejs.dev/

---

Enjoy the run! 🏃‍♂️
