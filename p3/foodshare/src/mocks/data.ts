import type { Recipe, CategoryInfo, Ingredient, CookingStep, Author } from '../types';

const authors: Author[] = [
  { id: 'a1', name: '美食家小王', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
  { id: 'a2', name: '烘焙达人Lisa', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
  { id: 'a3', name: '厨房新手阿杰', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { id: 'a4', name: '素食主义者小美', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
  { id: 'a5', name: '汤品大师老陈', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

const createIngredients = (names: string[]): Ingredient[] => {
  const units = ['克', '个', '毫升', '勺', '片', '把'];
  return names.map(name => ({
    id: generateId(),
    name,
    quantity: String(Math.floor(Math.random() * 500) + 50),
    unit: units[Math.floor(Math.random() * units.length)],
    checked: false
  }));
};

const createSteps = (count: number): CookingStep[] => {
  const descriptions = [
    '将所有食材准备好，清洗干净备用',
    '热锅倒油，油温七成热',
    '放入葱姜蒜爆香',
    '加入主料翻炒均匀',
    '加入适量调味料，继续翻炒',
    '加入清水或高汤，大火烧开',
    '转小火慢炖，让食材充分入味',
    '最后撒上葱花或香菜点缀',
    '出锅装盘即可享用'
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: generateId(),
    order: i + 1,
    description: descriptions[i % descriptions.length] + `（步骤${i + 1}）`,
    duration: Math.floor(Math.random() * 15) + 5,
    image: Math.random() > 0.5 ? `https://picsum.photos/400/300?random=${i}` : undefined
  }));
};

export const categories: CategoryInfo[] = [
  { id: 'home-cooking', name: '家常菜', icon: '🍳' },
  { id: 'baking', name: '烘焙', icon: '🧁' },
  { id: 'vegetarian', name: '素食', icon: '🥬' },
  { id: 'soup', name: '汤羹', icon: '🍲' },
  { id: 'dessert', name: '甜品', icon: '🍮' },
  { id: 'seafood', name: '海鲜', icon: '🦐' },
  { id: 'staple-food', name: '主食', icon: '🍚' },
];

export const ingredientSuggestions = [
  '鸡蛋', '面粉', '牛奶', '白糖', '盐', '生抽', '老抽', '料酒',
  '姜', '蒜', '葱', '香菜', '辣椒', '花椒', '八角', '桂皮',
  '猪肉', '牛肉', '鸡肉', '鱼肉', '虾', '豆腐', '土豆', '胡萝卜',
  '西红柿', '黄瓜', '茄子', '白菜', '青菜', '蘑菇', '木耳', '海带'
];

export const mockRecipes: Recipe[] = [
  {
    id: 'r1',
    title: '红烧肉',
    description: '经典家常红烧肉，肥而不腻，入口即化，是待客的必备硬菜。选用优质五花肉，慢火炖煮，肉质软烂，色泽红亮诱人。',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop',
    author: authors[0],
    category: 'home-cooking',
    difficulty: 'medium',
    cookTime: 90,
    servings: 4,
    ingredients: createIngredients(['五花肉', '生抽', '老抽', '冰糖', '料酒', '姜片', '八角', '桂皮']),
    steps: createSteps(6),
    likes: 256,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'r2',
    title: '戚风蛋糕',
    description: '松软可口的戚风蛋糕，口感细腻绵密，是烘焙初学者的必修课。掌握好打发技巧，在家也能做出专业级的美味蛋糕。',
    coverImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop',
    author: authors[1],
    category: 'baking',
    difficulty: 'hard',
    cookTime: 60,
    servings: 8,
    ingredients: createIngredients(['低筋面粉', '鸡蛋', '细砂糖', '牛奶', '玉米油', '柠檬汁', '香草精']),
    steps: createSteps(8),
    likes: 512,
    createdAt: '2024-01-20T14:20:00Z'
  },
  {
    id: 'r3',
    title: '清炒时蔬',
    description: '健康美味的清炒时蔬，保留蔬菜的原汁原味，清爽解腻。多种时令蔬菜搭配，营养丰富，是餐桌上的绿色选择。',
    coverImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
    author: authors[3],
    category: 'vegetarian',
    difficulty: 'easy',
    cookTime: 15,
    servings: 2,
    ingredients: createIngredients(['西兰花', '胡萝卜', '香菇', '蒜末', '盐', '蚝油', '食用油']),
    steps: createSteps(4),
    likes: 128,
    createdAt: '2024-02-01T09:15:00Z'
  },
  {
    id: 'r4',
    title: '番茄蛋花汤',
    description: '简单快手的家常汤品，酸甜可口，营养丰富。番茄的酸甜与鸡蛋的嫩滑完美结合，是一道老少皆宜的美味汤羹。',
    coverImage: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop',
    author: authors[2],
    category: 'soup',
    difficulty: 'easy',
    cookTime: 20,
    servings: 3,
    ingredients: createIngredients(['番茄', '鸡蛋', '葱花', '盐', '香油', '水淀粉', '白糖']),
    steps: createSteps(5),
    likes: 320,
    createdAt: '2024-02-05T11:45:00Z'
  },
  {
    id: 'r5',
    title: '芒果布丁',
    description: '香甜滑嫩的芒果布丁，入口即化，是夏日消暑的绝佳甜品。新鲜芒果制作，果香浓郁，无需烤箱也能轻松完成。',
    coverImage: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop',
    author: authors[1],
    category: 'dessert',
    difficulty: 'medium',
    cookTime: 30,
    servings: 4,
    ingredients: createIngredients(['芒果', '牛奶', '淡奶油', '吉利丁片', '细砂糖', '柠檬汁']),
    steps: createSteps(6),
    likes: 445,
    createdAt: '2024-02-10T16:00:00Z'
  },
  {
    id: 'r6',
    title: '蒜蓉蒸虾',
    description: '鲜嫩多汁的蒜蓉蒸虾，保留了虾的原汁原味，蒜香四溢。简单的烹饪方法，最大程度锁住海鲜的鲜甜，美味又健康。',
    coverImage: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&h=400&fit=crop',
    author: authors[0],
    category: 'seafood',
    difficulty: 'easy',
    cookTime: 25,
    servings: 2,
    ingredients: createIngredients(['大虾', '蒜末', '葱花', '生抽', '料酒', '盐', '粉丝']),
    steps: createSteps(5),
    likes: 289,
    createdAt: '2024-02-12T13:30:00Z'
  },
  {
    id: 'r7',
    title: '蛋炒饭',
    description: '粒粒分明的黄金蛋炒饭，香气扑鼻，是家常主食的经典选择。隔夜饭炒出最佳口感，配料可根据喜好自由搭配。',
    coverImage: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop',
    author: authors[2],
    category: 'staple-food',
    difficulty: 'easy',
    cookTime: 15,
    servings: 1,
    ingredients: createIngredients(['隔夜米饭', '鸡蛋', '火腿丁', '青豆', '胡萝卜丁', '葱花', '盐']),
    steps: createSteps(4),
    likes: 567,
    createdAt: '2024-02-15T12:00:00Z'
  },
  {
    id: 'r8',
    title: '糖醋排骨',
    description: '酸甜适口的糖醋排骨，外酥里嫩，色泽红亮。经典的糖醋比例是这道菜的灵魂，让人一吃就停不下来。',
    coverImage: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=400&fit=crop',
    author: authors[0],
    category: 'home-cooking',
    difficulty: 'medium',
    cookTime: 45,
    servings: 3,
    ingredients: createIngredients(['猪小排', '生抽', '醋', '白糖', '番茄酱', '料酒', '白芝麻']),
    steps: createSteps(7),
    likes: 423,
    createdAt: '2024-02-18T15:20:00Z'
  },
  {
    id: 'r9',
    title: '提拉米苏',
    description: '意大利经典甜品提拉米苏，咖啡与马斯卡彭的完美结合，入口丝滑细腻。无需烘烤，冷藏后风味更佳。',
    coverImage: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop',
    author: authors[1],
    category: 'dessert',
    difficulty: 'hard',
    cookTime: 40,
    servings: 6,
    ingredients: createIngredients(['马斯卡彭奶酪', '手指饼干', '浓缩咖啡', '蛋黄', '细砂糖', '淡奶油', '可可粉']),
    steps: createSteps(6),
    likes: 678,
    createdAt: '2024-02-20T10:00:00Z'
  },
  {
    id: 'r10',
    title: '酸辣土豆丝',
    description: '爽脆可口的酸辣土豆丝，是最受欢迎的下饭菜之一。土豆丝切得细而匀，快速翻炒保持爽脆口感，酸辣开胃。',
    coverImage: 'https://images.unsplash.com/photo-1518977676601-b53f82be73b0?w=600&h=400&fit=crop',
    author: authors[3],
    category: 'vegetarian',
    difficulty: 'easy',
    cookTime: 15,
    servings: 2,
    ingredients: createIngredients(['土豆', '干辣椒', '花椒', '醋', '盐', '蒜末', '葱花']),
    steps: createSteps(5),
    likes: 356,
    createdAt: '2024-02-22T17:45:00Z'
  },
  {
    id: 'r11',
    title: '奶油蘑菇汤',
    description: '浓郁醇香的奶油蘑菇汤，西式浓汤的代表。多种蘑菇熬制出鲜美汤底，加入奶油后更加香浓顺滑。',
    coverImage: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&h=400&fit=crop',
    author: authors[4],
    category: 'soup',
    difficulty: 'medium',
    cookTime: 35,
    servings: 4,
    ingredients: createIngredients(['口蘑', '香菇', '洋葱', '淡奶油', '黄油', '面粉', '百里香']),
    steps: createSteps(6),
    likes: 234,
    createdAt: '2024-02-25T11:30:00Z'
  },
  {
    id: 'r12',
    title: '麻婆豆腐',
    description: '麻辣鲜香的麻婆豆腐，川菜中的经典名菜。嫩滑的豆腐吸收了麻辣汤汁，配米饭简直绝配，让人欲罢不能。',
    coverImage: 'https://images.unsplash.com/photo-1582452932307-f63b7594ab6f?w=600&h=400&fit=crop',
    author: authors[0],
    category: 'home-cooking',
    difficulty: 'medium',
    cookTime: 25,
    servings: 2,
    ingredients: createIngredients(['嫩豆腐', '牛肉末', '豆瓣酱', '花椒粉', '蒜末', '葱花', '水淀粉']),
    steps: createSteps(5),
    likes: 489,
    createdAt: '2024-03-01T14:15:00Z'
  },
  {
    id: 'r13',
    title: '抹茶曲奇',
    description: '酥松可口的抹茶曲奇，茶香与黄油香气交融。微苦的抹茶中和了甜味，下午茶的最佳伴侣。',
    coverImage: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=400&fit=crop',
    author: authors[1],
    category: 'baking',
    difficulty: 'easy',
    cookTime: 30,
    servings: 20,
    ingredients: createIngredients(['低筋面粉', '黄油', '糖粉', '抹茶粉', '蛋液', '杏仁粉']),
    steps: createSteps(5),
    likes: 312,
    createdAt: '2024-03-05T09:30:00Z'
  },
  {
    id: 'r14',
    title: '清蒸鲈鱼',
    description: '鲜嫩无比的清蒸鲈鱼，最大限度保留鱼的鲜美。火候的掌握是关键，蒸出的鱼肉洁白细嫩，入口即化。',
    coverImage: 'https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=600&h=400&fit=crop',
    author: authors[4],
    category: 'seafood',
    difficulty: 'medium',
    cookTime: 20,
    servings: 3,
    ingredients: createIngredients(['鲈鱼', '葱丝', '姜丝', '蒸鱼豉油', '料酒', '盐']),
    steps: createSteps(4),
    likes: 278,
    createdAt: '2024-03-08T12:45:00Z'
  },
  {
    id: 'r15',
    title: '炸酱面',
    description: '地道老北京炸酱面，酱香浓郁，面条劲道。五花肉丁熬制的炸酱配上黄瓜丝、胡萝卜丝，拌匀后香气扑鼻。',
    coverImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop',
    author: authors[2],
    category: 'staple-food',
    difficulty: 'medium',
    cookTime: 40,
    servings: 4,
    ingredients: createIngredients(['手擀面', '五花肉丁', '黄酱', '甜面酱', '黄瓜', '胡萝卜', '豆芽']),
    steps: createSteps(7),
    likes: 534,
    createdAt: '2024-03-10T13:00:00Z'
  },
  {
    id: 'r16',
    title: '莲子银耳羹',
    description: '滋润养颜的莲子银耳羹，胶质满满，清甜可口。慢火炖出的银耳羹口感顺滑，是女性美容养颜的佳品。',
    coverImage: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&h=400&fit=crop',
    author: authors[4],
    category: 'dessert',
    difficulty: 'easy',
    cookTime: 60,
    servings: 4,
    ingredients: createIngredients(['银耳', '莲子', '红枣', '枸杞', '冰糖', '百合']),
    steps: createSteps(4),
    likes: 412,
    createdAt: '2024-03-12T15:30:00Z'
  },
  {
    id: 'r17',
    title: '蒜蓉西兰花',
    description: '简单美味的蒜蓉西兰花，翠绿爽脆，蒜香浓郁。健康低脂，是减肥人士的首选菜品。',
    coverImage: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=400&fit=crop',
    author: authors[3],
    category: 'vegetarian',
    difficulty: 'easy',
    cookTime: 10,
    servings: 2,
    ingredients: createIngredients(['西兰花', '蒜末', '盐', '蚝油', '食用油']),
    steps: createSteps(3),
    likes: 198,
    createdAt: '2024-03-15T18:00:00Z'
  },
  {
    id: 'r18',
    title: '牛角包',
    description: '层层酥脆的法式牛角包，黄油香气四溢。虽然制作过程需要耐心，但出炉的那一刻一切都值得。',
    coverImage: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=400&fit=crop',
    author: authors[1],
    category: 'baking',
    difficulty: 'hard',
    cookTime: 180,
    servings: 8,
    ingredients: createIngredients(['高筋面粉', '低筋面粉', '黄油', '牛奶', '酵母', '盐', '细砂糖']),
    steps: createSteps(10),
    likes: 623,
    createdAt: '2024-03-18T08:30:00Z'
  },
  {
    id: 'r19',
    title: '酸菜鱼',
    description: '酸辣开胃的酸菜鱼，鱼片嫩滑，汤汁鲜美。酸菜的酸与辣椒的辣完美融合，是一道让人上瘾的川菜。',
    coverImage: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&h=400&fit=crop',
    author: authors[0],
    category: 'seafood',
    difficulty: 'hard',
    cookTime: 50,
    servings: 4,
    ingredients: createIngredients(['草鱼', '酸菜', '干辣椒', '花椒', '蒜末', '蛋清', '淀粉']),
    steps: createSteps(8),
    likes: 567,
    createdAt: '2024-03-20T16:45:00Z'
  },
  {
    id: 'r20',
    title: '皮蛋瘦肉粥',
    description: '暖心暖胃的皮蛋瘦肉粥，绵密顺滑，咸香可口。广式早茶的经典，也是家常早餐的最佳选择。',
    coverImage: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&h=400&fit=crop',
    author: authors[2],
    category: 'staple-food',
    difficulty: 'easy',
    cookTime: 45,
    servings: 3,
    ingredients: createIngredients(['大米', '皮蛋', '瘦肉丝', '姜丝', '葱花', '盐', '白胡椒粉']),
    steps: createSteps(5),
    likes: 345,
    createdAt: '2024-03-22T07:00:00Z'
  },
  {
    id: 'r21',
    title: '罗宋汤',
    description: '酸甜浓郁的罗宋汤，营养丰富，色彩诱人。牛肉软烂，蔬菜入味，配上面包就是一顿丰盛的午餐。',
    coverImage: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop',
    author: authors[4],
    category: 'soup',
    difficulty: 'medium',
    cookTime: 90,
    servings: 6,
    ingredients: createIngredients(['牛肉', '土豆', '胡萝卜', '洋葱', '番茄', '卷心菜', '番茄酱']),
    steps: createSteps(8),
    likes: 289,
    createdAt: '2024-03-25T12:30:00Z'
  },
  {
    id: 'r22',
    title: '宫保鸡丁',
    description: '麻辣鲜香的宫保鸡丁，鸡肉滑嫩，花生酥脆。经典的川菜，下饭神器，花生的香脆是这道菜的点睛之笔。',
    coverImage: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&h=400&fit=crop',
    author: authors[0],
    category: 'home-cooking',
    difficulty: 'medium',
    cookTime: 25,
    servings: 3,
    ingredients: createIngredients(['鸡胸肉', '花生米', '干辣椒', '花椒', '葱段', '生抽', '醋']),
    steps: createSteps(6),
    likes: 478,
    createdAt: '2024-03-28T14:15:00Z'
  }
];
