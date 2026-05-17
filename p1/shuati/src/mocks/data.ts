import type { Question, Comment } from '@/types'

const tags = [
  '数组', '字符串', '哈希表', '动态规划', '双指针', '栈', '树',
  '广度优先搜索', '深度优先搜索', '二分查找', '排序', '位运算',
  '贪心算法', '回溯算法', '链表', '递归', '滑动窗口', '数学'
]

const generateQuestions = (): Question[] => {
  const questions: Question[] = []
  
  const codingTemplates: Record<string, string> = {
    js: `function solution(input) {\n  // 在这里编写你的代码\n  \n  return result;\n}`,
    py: `def solution(input):\n    # 在这里编写你的代码\n    \n    return result`,
  }

  const singleChoiceQuestions: Question[] = [
    {
      id: '1',
      number: 1,
      title: 'JavaScript 中哪个方法用于数组遍历并返回新数组？',
      description: '选择正确的数组方法',
      difficulty: 'easy',
      type: 'single',
      tags: ['数组', 'JavaScript'],
      passRate: 85,
      favorites: 120,
      submissions: 500,
      options: ['forEach', 'map', 'filter', 'reduce'],
      answer: 'map',
      explanation: 'map 方法会创建一个新数组，其结果是该数组中的每个元素都调用一次提供的函数后的返回值。forEach 只是遍历不返回新数组。',
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      number: 2,
      title: 'React 中哪个 Hook 用于管理组件状态？',
      description: '选择正确的 React Hook',
      difficulty: 'easy',
      type: 'single',
      tags: ['React', '前端'],
      passRate: 92,
      favorites: 200,
      submissions: 800,
      options: ['useEffect', 'useState', 'useContext', 'useRef'],
      answer: 'useState',
      explanation: 'useState 是 React 中用于在函数组件中添加状态的 Hook。它返回一个状态值和一个更新该状态的函数。',
      createdAt: '2024-01-02',
    },
    {
      id: '3',
      number: 3,
      title: 'CSS Flexbox 中哪个属性定义主轴方向？',
      description: '选择正确的 Flex 属性',
      difficulty: 'easy',
      type: 'single',
      tags: ['CSS', '前端'],
      passRate: 78,
      favorites: 80,
      submissions: 350,
      options: ['align-items', 'justify-content', 'flex-direction', 'flex-wrap'],
      answer: 'flex-direction',
      explanation: 'flex-direction 属性指定了内部元素是如何在 flex 容器中布局的，定义了主轴的方向。',
      createdAt: '2024-01-03',
    },
    {
      id: '4',
      number: 4,
      title: 'TypeScript 中哪个关键字用于定义接口？',
      description: '选择正确的 TypeScript 关键字',
      difficulty: 'easy',
      type: 'single',
      tags: ['TypeScript', '前端'],
      passRate: 88,
      favorites: 150,
      submissions: 600,
      options: ['type', 'interface', 'class', 'struct'],
      answer: 'interface',
      explanation: 'interface 关键字用于定义 TypeScript 中的接口，它可以描述对象的形状。',
      createdAt: '2024-01-04',
    },
    {
      id: '5',
      number: 5,
      title: 'HTTP 状态码 404 表示什么？',
      description: '选择正确的 HTTP 状态码含义',
      difficulty: 'easy',
      type: 'single',
      tags: ['网络', 'HTTP'],
      passRate: 95,
      favorites: 100,
      submissions: 400,
      options: ['服务器错误', '未授权', '未找到', '请求成功'],
      answer: '未找到',
      explanation: '404 Not Found 表示服务器找不到请求的资源。',
      createdAt: '2024-01-05',
    },
    {
      id: '6',
      number: 6,
      title: 'Git 中哪个命令用于创建新分支？',
      description: '选择正确的 Git 命令',
      difficulty: 'easy',
      type: 'single',
      tags: ['Git', '版本控制'],
      passRate: 82,
      favorites: 90,
      submissions: 380,
      options: ['git merge', 'git branch', 'git checkout', 'git clone'],
      answer: 'git branch',
      explanation: 'git branch 命令用于列出、创建或删除分支。',
      createdAt: '2024-01-06',
    },
    {
      id: '7',
      number: 7,
      title: 'Node.js 中哪个模块用于文件操作？',
      description: '选择正确的 Node.js 模块',
      difficulty: 'medium',
      type: 'single',
      tags: ['Node.js', '后端'],
      passRate: 75,
      favorites: 70,
      submissions: 320,
      options: ['http', 'fs', 'path', 'os'],
      answer: 'fs',
      explanation: 'fs (File System) 模块提供了用于与文件系统进行交互的 API。',
      createdAt: '2024-01-07',
    },
    {
      id: '8',
      number: 8,
      title: '数据库中 SQL 语句 SELECT * FROM users WHERE name LIKE ? 中的 % 表示什么？',
      description: '选择正确的 SQL 通配符含义',
      difficulty: 'medium',
      type: 'single',
      tags: ['数据库', 'SQL'],
      passRate: 70,
      favorites: 60,
      submissions: 280,
      options: ['匹配一个字符', '匹配零个或多个字符', '匹配数字', '匹配空白字符'],
      answer: '匹配零个或多个字符',
      explanation: '在 LIKE 操作符中，% 表示匹配零个或多个字符。',
      createdAt: '2024-01-08',
    },
  ]

  const multipleChoiceQuestions: Question[] = [
    {
      id: '9',
      number: 9,
      title: '以下哪些是 JavaScript 的原始数据类型？（多选）',
      description: '选择所有正确的答案',
      difficulty: 'easy',
      type: 'multiple',
      tags: ['JavaScript', '基础'],
      passRate: 70,
      favorites: 110,
      submissions: 450,
      options: ['String', 'Number', 'Array', 'Boolean', 'Object'],
      answer: ['String', 'Number', 'Boolean'],
      explanation: 'JavaScript 的原始数据类型包括：String、Number、Boolean、Null、Undefined、Symbol 和 BigInt。Array 和 Object 是引用类型。',
      createdAt: '2024-01-09',
    },
    {
      id: '10',
      number: 10,
      title: '以下哪些是 React 的生命周期方法？（多选）',
      description: '选择所有正确的答案',
      difficulty: 'medium',
      type: 'multiple',
      tags: ['React', '前端'],
      passRate: 65,
      favorites: 95,
      submissions: 380,
      options: ['componentDidMount', 'componentWillUnmount', 'useState', 'render', 'useEffect'],
      answer: ['componentDidMount', 'componentWillUnmount', 'render'],
      explanation: 'componentDidMount、componentWillUnmount 和 render 是类组件的生命周期方法。useState 和 useEffect 是函数组件的 Hooks。',
      createdAt: '2024-01-10',
    },
    {
      id: '11',
      number: 11,
      title: '以下哪些是 CSS 盒模型的组成部分？（多选）',
      description: '选择所有正确的答案',
      difficulty: 'easy',
      type: 'multiple',
      tags: ['CSS', '前端'],
      passRate: 85,
      favorites: 85,
      submissions: 340,
      options: ['content', 'padding', 'margin', 'border', 'shadow'],
      answer: ['content', 'padding', 'margin', 'border'],
      explanation: 'CSS 盒模型由 content、padding、border 和 margin 组成。shadow 不属于盒模型。',
      createdAt: '2024-01-11',
    },
    {
      id: '12',
      number: 12,
      title: '以下哪些是 HTTP 请求方法？（多选）',
      description: '选择所有正确的答案',
      difficulty: 'easy',
      type: 'multiple',
      tags: ['网络', 'HTTP'],
      passRate: 88,
      favorites: 105,
      submissions: 420,
      options: ['GET', 'POST', 'SEND', 'DELETE', 'FETCH'],
      answer: ['GET', 'POST', 'DELETE'],
      explanation: '常见的 HTTP 请求方法包括：GET、POST、PUT、DELETE、PATCH、HEAD、OPTIONS 等。SEND 和 FETCH 不是 HTTP 方法。',
      createdAt: '2024-01-12',
    },
  ]

  const fillQuestions: Question[] = [
    {
      id: '13',
      number: 13,
      title: 'JavaScript 中用于声明常量的关键字是？',
      description: '填写正确的关键字',
      difficulty: 'easy',
      type: 'fill',
      tags: ['JavaScript', '基础'],
      passRate: 90,
      favorites: 60,
      submissions: 250,
      answer: 'const',
      explanation: 'const 关键字用于声明一个只读的常量，声明时必须初始化。',
      createdAt: '2024-01-13',
    },
    {
      id: '14',
      number: 14,
      title: 'CSS 中用于设置元素透明度的属性是？',
      description: '填写正确的 CSS 属性名',
      difficulty: 'easy',
      type: 'fill',
      tags: ['CSS', '前端'],
      passRate: 85,
      favorites: 55,
      submissions: 220,
      answer: 'opacity',
      explanation: 'opacity 属性设置元素的透明度级别，范围从 0.0（完全透明）到 1.0（完全不透明）。',
      createdAt: '2024-01-14',
    },
    {
      id: '15',
      number: 15,
      title: 'HTML5 中用于播放视频的标签是？',
      description: '填写正确的标签名（不含尖括号）',
      difficulty: 'easy',
      type: 'fill',
      tags: ['HTML', '前端'],
      passRate: 92,
      favorites: 45,
      submissions: 180,
      answer: 'video',
      explanation: '<video> 标签用于在 HTML 或 XHTML 文档中嵌入视频内容。',
      createdAt: '2024-01-15',
    },
    {
      id: '16',
      number: 16,
      title: 'Git 中用于查看提交历史的命令是 git ____',
      description: '填写命令的剩余部分',
      difficulty: 'easy',
      type: 'fill',
      tags: ['Git', '版本控制'],
      passRate: 80,
      favorites: 50,
      submissions: 200,
      answer: 'log',
      explanation: 'git log 命令用于显示提交历史记录。',
      createdAt: '2024-01-16',
    },
    {
      id: '17',
      number: 17,
      title: 'JavaScript 中将字符串转换为整数的函数是 ____()',
      description: '填写函数名',
      difficulty: 'easy',
      type: 'fill',
      tags: ['JavaScript', '基础'],
      passRate: 82,
      favorites: 48,
      submissions: 190,
      answer: 'parseInt',
      explanation: 'parseInt() 函数解析一个字符串参数，并返回一个指定基数的整数。',
      createdAt: '2024-01-17',
    },
  ]

  const codingQuestions: Question[] = [
    {
      id: '18',
      number: 18,
      title: '两数之和',
      description: `给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。

示例：
输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1]`,
      difficulty: 'easy',
      type: 'coding',
      tags: ['数组', '哈希表'],
      passRate: 52,
      favorites: 500,
      submissions: 2000,
      codeTemplate: codingTemplates.js,
      testCases: [
        { id: '1', input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }), expected: '[0,1]' },
        { id: '2', input: JSON.stringify({ nums: [3, 2, 4], target: 6 }), expected: '[1,2]' },
        { id: '3', input: JSON.stringify({ nums: [3, 3], target: 6 }), expected: '[0,1]' },
      ],
      hints: ['可以使用暴力解法，双重循环遍历', '使用哈希表可以将时间复杂度降到 O(n)'],
      createdAt: '2024-01-18',
    },
    {
      id: '19',
      number: 19,
      title: '反转字符串',
      description: `编写一个函数，其作用是将输入的字符串反转过来。

示例 1：
输入："hello"
输出："olleh"

示例 2：
输入："A man, a plan, a canal: Panama"
输出："amanaP :lanac a ,nalp a ,nam A"`,
      difficulty: 'easy',
      type: 'coding',
      tags: ['字符串', '双指针'],
      passRate: 75,
      favorites: 300,
      submissions: 1200,
      codeTemplate: codingTemplates.js,
      testCases: [
        { id: '1', input: JSON.stringify({ s: 'hello' }), expected: '"olleh"' },
        { id: '2', input: JSON.stringify({ s: 'A man, a plan, a canal: Panama' }), expected: '"amanaP :lanac a ,nalp a ,nam A"' },
        { id: '3', input: JSON.stringify({ s: '' }), expected: '""' },
      ],
      hints: ['可以使用双指针法，一个指针从头开始，一个从尾开始', '注意处理空字符串的情况'],
      createdAt: '2024-01-19',
    },
    {
      id: '20',
      number: 20,
      title: '斐波那契数列',
      description: `斐波那契数，通常用 F(n) 表示，形成的序列称为斐波那契数列。该数列由 0 和 1 开始，后面的每一项数字都是前面两项数字的和。

也就是：
F(0) = 0，F(1) = 1
F(n) = F(n - 1) + F(n - 2)，其中 n > 1

给你 n ，请计算 F(n)。

示例：
输入：2
输出：1
解释：F(2) = F(1) + F(0) = 1 + 0 = 1`,
      difficulty: 'easy',
      type: 'coding',
      tags: ['动态规划', '递归', '数学'],
      passRate: 68,
      favorites: 250,
      submissions: 1000,
      codeTemplate: codingTemplates.js,
      testCases: [
        { id: '1', input: JSON.stringify({ n: 2 }), expected: '1' },
        { id: '2', input: JSON.stringify({ n: 10 }), expected: '55' },
        { id: '3', input: JSON.stringify({ n: 0 }), expected: '0' },
        { id: '4', input: JSON.stringify({ n: 20 }), expected: '6765' },
      ],
      hints: ['可以使用递归，但会有重复计算', '使用动态规划可以优化时间复杂度', '可以用迭代的方式，只保存前两个值'],
      createdAt: '2024-01-20',
    },
    {
      id: '21',
      number: 21,
      title: '有效的括号',
      description: `给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s ，判断字符串是否有效。

有效字符串需满足：
1. 左括号必须用相同类型的右括号闭合。
2. 左括号必须以正确的顺序闭合。
3. 每个右括号都有一个对应的相同类型的左括号。

示例：
输入：s = "()"
输出：true

输入：s = "()[]{}"
输出：true

输入：s = "(]"
输出：false`,
      difficulty: 'easy',
      type: 'coding',
      tags: ['栈', '字符串'],
      passRate: 45,
      favorites: 400,
      submissions: 1500,
      codeTemplate: codingTemplates.js,
      testCases: [
        { id: '1', input: JSON.stringify({ s: '()' }), expected: 'true' },
        { id: '2', input: JSON.stringify({ s: '()[]{}' }), expected: 'true' },
        { id: '3', input: JSON.stringify({ s: '(]' }), expected: 'false' },
        { id: '4', input: JSON.stringify({ s: '([)]' }), expected: 'false' },
        { id: '5', input: JSON.stringify({ s: '{[]}' }), expected: 'true' },
      ],
      hints: ['使用栈数据结构', '遇到左括号入栈，遇到右括号检查栈顶是否匹配'],
      createdAt: '2024-01-21',
    },
    {
      id: '22',
      number: 22,
      title: '最大子数组和',
      description: `给你一个整数数组 nums ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

子数组是数组中的一个连续部分。

示例：
输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
输出：6
解释：连续子数组 [4,-1,2,1] 的和最大，为 6`,
      difficulty: 'medium',
      type: 'coding',
      tags: ['数组', '动态规划', '分治'],
      passRate: 55,
      favorites: 350,
      submissions: 1400,
      codeTemplate: codingTemplates.js,
      testCases: [
        { id: '1', input: JSON.stringify({ nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }), expected: '6' },
        { id: '2', input: JSON.stringify({ nums: [1] }), expected: '1' },
        { id: '3', input: JSON.stringify({ nums: [5, 4, -1, 7, 8] }), expected: '23' },
      ],
      hints: ['经典的动态规划问题', 'Kadane 算法', '考虑当前元素是加入之前的子数组还是重新开始'],
      createdAt: '2024-01-22',
    },
    {
      id: '23',
      number: 23,
      title: '爬楼梯',
      description: `假设你正在爬楼梯。需要 n 阶你才能到达楼顶。

每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？

示例：
输入：n = 2
输出：2
解释：有两种方法可以爬到楼顶。
1. 1 阶 + 1 阶
2. 2 阶

输入：n = 3
输出：3
解释：有三种方法可以爬到楼顶。
1. 1 阶 + 1 阶 + 1 阶
2. 1 阶 + 2 阶
3. 2 阶 + 1 阶`,
      difficulty: 'easy',
      type: 'coding',
      tags: ['动态规划', '数学', '记忆化搜索'],
      passRate: 53,
      favorites: 380,
      submissions: 1600,
      codeTemplate: codingTemplates.js,
      testCases: [
        { id: '1', input: JSON.stringify({ n: 2 }), expected: '2' },
        { id: '2', input: JSON.stringify({ n: 3 }), expected: '3' },
        { id: '3', input: JSON.stringify({ n: 10 }), expected: '89' },
        { id: '4', input: JSON.stringify({ n: 20 }), expected: '10946' },
      ],
      hints: ['本质上是斐波那契数列', '可以用动态规划，dp[i] = dp[i-1] + dp[i-2]', '可以优化空间复杂度到 O(1)'],
      createdAt: '2024-01-23',
    },
  ]

  const additionalQuestions: Question[] = []
  for (let i = 24; i <= 55; i++) {
    const tagIndex = (i - 24) % tags.length
    const difficultyIndex = (i - 24) % 3
    const typeIndex = (i - 24) % 4
    const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard']
    const types: Array<'single' | 'multiple' | 'fill' | 'coding'> = ['single', 'multiple', 'fill', 'coding']
    
    const questionType = types[typeIndex]
    const baseQuestion: Partial<Question> = {
      id: String(i),
      number: i,
      title: `算法题目 ${i}`,
      description: `这是第 ${i} 道题的描述内容。请仔细阅读题目要求并完成解答。`,
      difficulty: difficulties[difficultyIndex],
      type: questionType,
      tags: [tags[tagIndex], tags[(tagIndex + 1) % tags.length]],
      passRate: Math.floor(Math.random() * 50) + 30,
      favorites: Math.floor(Math.random() * 500) + 50,
      submissions: Math.floor(Math.random() * 2000) + 200,
      createdAt: `2024-01-${String(i).padStart(2, '0')}`,
    }

    if (questionType === 'single') {
      additionalQuestions.push({
        ...baseQuestion,
        options: ['选项 A', '选项 B', '选项 C', '选项 D'],
        answer: '选项 A',
        explanation: '这是题目的解析内容，帮助你理解正确答案。',
      } as Question)
    } else if (questionType === 'multiple') {
      additionalQuestions.push({
        ...baseQuestion,
        options: ['选项 A', '选项 B', '选项 C', '选项 D'],
        answer: ['选项 A', '选项 B'],
        explanation: '这是题目的解析内容，帮助你理解正确答案。',
      } as Question)
    } else if (questionType === 'fill') {
      additionalQuestions.push({
        ...baseQuestion,
        answer: '答案',
        explanation: '这是题目的解析内容，帮助你理解正确答案。',
      } as Question)
    } else {
      additionalQuestions.push({
        ...baseQuestion,
        codeTemplate: codingTemplates.js,
        testCases: [
          { id: '1', input: JSON.stringify({ input: 'test' }), expected: '"result"' },
          { id: '2', input: JSON.stringify({ input: 'test2' }), expected: '"result2"' },
        ],
        hints: ['提示 1', '提示 2'],
      } as Question)
    }
  }

  return [
    ...singleChoiceQuestions,
    ...multipleChoiceQuestions,
    ...fillQuestions,
    ...codingQuestions,
    ...additionalQuestions,
  ]
}

export const questions = generateQuestions()

export const comments: Comment[] = [
  {
    id: '1',
    questionId: '18',
    userId: '2',
    username: 'algorithm_lover',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=algo',
    content: '这道题用哈希表真的很巧妙！时间复杂度从 O(n²) 降到了 O(n)',
    likes: 25,
    liked: false,
    createdAt: '2024-01-18T10:00:00Z',
    replies: [
      {
        id: '1-1',
        questionId: '18',
        userId: '3',
        username: 'newbie_coder',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=newbie',
        content: '同意！一开始我用的双重循环，后来优化了',
        likes: 8,
        liked: false,
        createdAt: '2024-01-18T11:00:00Z',
      },
    ],
  },
  {
    id: '2',
    questionId: '18',
    userId: '4',
    username: 'js_master',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jsmaster',
    content: '有人用 Map 和对象字面量对比过性能吗？',
    likes: 15,
    liked: false,
    createdAt: '2024-01-18T12:00:00Z',
  },
]
