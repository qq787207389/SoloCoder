## 1. 架构设计
```mermaid
flowchart TD
    "前端展示层" --> "状态管理层 (Zustand)"
    "状态管理层" --> "游戏逻辑层"
    "游戏逻辑层" --> "案件生成系统"
    "游戏逻辑层" --> "证据矛盾检测引擎"
    "游戏逻辑层" --> "庭审对话系统"
    "数据层" --> "案件模板库"
    "数据层" --> "证据模板库"
    "数据层" --> "人物模板库"
```

## 2. 技术说明
- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **样式方案**: Tailwind CSS 3
- **动画效果**: Framer Motion
- **画布渲染**: HTML5 Canvas API

## 3. 路由定义
| 路由 | 用途 |
|------|------|
| `/` | 主菜单页面 |
| `/investigation` | 案件调查地图 |
| `/investigation/:location` | 地点调查界面 |
| `/evidence` | 证据簿界面 |
| `/trial` | 庭审界面 |
| `/verdict` | 裁决界面 |

## 4. 核心数据结构

### 4.1 案件数据模型
```typescript
interface Case {
  id: string;
  type: 'theft' | 'murder' | 'fraud' | 'arson';
  title: string;
  description: string;
  truth: CaseTruth;
  timeline: TimelineEvent[];
  characters: Character[];
  evidence: Evidence[];
  witnesses: Witness[];
  locations: Location[];
  difficulty: number;
}

interface CaseTruth {
  realCulprit: string;
  motive: string;
  keyEvidenceChain: string[];
  hiddenDetails: string[];
}
```

### 4.2 证据数据模型
```typescript
interface Evidence {
  id: string;
  name: string;
  type: 'physical' | 'testimony' | 'forensic';
  reliability: number; // 0-100
  description: string;
  location: string;
  discovered: boolean;
  canContradict: string[]; // 可反驳的证词ID
  contradictions: string[]; // 与该证据矛盾的陈述
}
```

### 4.3 人物数据模型
```typescript
interface Character {
  id: string;
  name: string;
  role: 'victim' | 'suspect' | 'witness' | 'culprit';
  description: string;
  alibi: string;
  motives: string[];
  relationships: Relationship[];
}

interface Relationship {
  targetId: string;
  type: 'friend' | 'enemy' | 'family' | 'colleague' | 'stranger';
  description: string;
}
```

### 4.4 证人数据模型
```typescript
interface Witness {
  characterId: string;
  testimony: Testimony[];
  isHostile: boolean;
  hiddenAgenda: string;
}

interface Testimony {
  id: string;
  statement: string;
  isTrue: boolean;
  canBeContradicted: boolean;
  contradictedBy: string[]; // 证据ID
  revealed: boolean;
}
```

### 4.5 游戏状态
```typescript
interface GameState {
  currentPhase: 'menu' | 'investigation' | 'trial' | 'verdict';
  currentCase: Case | null;
  actionPoints: number;
  maxActionPoints: number;
  discoveredEvidence: string[];
  visitedLocations: string[];
  interviewedWitnesses: string[];
  juryInclination: number; // -100 (有罪) 到 100 (无罪)
  judgeTrust: number; // 0-100
  objectionsRemaining: number;
  currentWitnessIndex: number;
  currentTestimonyIndex: number;
  trialLog: TrialEvent[];
}
```

## 5. 核心系统设计

### 5.1 案件生成系统
- 基于模板的随机生成
- 保证逻辑自洽的人物关系
- 构建时间线和证据链
- 支持案件模板扩展

### 5.2 证据矛盾检测引擎
- 规则引擎判断证据是否可反驳证词
- 基于关键词和语义匹配
- 支持自定义矛盾规则

### 5.3 庭审对话系统
- 分支对话树结构
- 动态内容插入
- 基于玩家行为的证词变化

## 6. 目录结构
```
courtinfer/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── investigation/
│   │   ├── trial/
│   │   ├── evidence/
│   │   └── common/
│   ├── store/
│   │   └── gameStore.ts
│   ├── systems/
│   │   ├── caseGenerator.ts
│   │   ├── contradictionEngine.ts
│   │   └── dialogueSystem.ts
│   ├── data/
│   │   ├── caseTemplates.ts
│   │   ├── evidenceTemplates.ts
│   │   └── characterTemplates.ts
│   ├── types/
│   │   └── index.ts
│   ├── hooks/
│   ├── utils/
│   └── pages/
├── public/
└── package.json
```
