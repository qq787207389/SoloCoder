import type { Case, CaseType } from '../types';

export const caseTemplates: Case[] = [
  {
    id: 'case_murder_001',
    type: 'murder',
    title: '深夜画廊谋杀案',
    description: '著名画家陈明辉在画廊中被发现死亡，嫌疑人是画廊被发现死在自己的画室中，死前似乎是他的助手。表面上看像是自杀，但现场疑点重重。',
    truth: {
      realCulprit: 'char_li_weibo',
      motive: '嫉妒受害者发现了嫌疑人的伪造画作骗局',
      keyEvidenceChain: ['ev_brush', 'ev_letter', 'ev_forgery_report', 'ev_time_contradiction'],
      hiddenDetails: [
        '嫌疑人长期伪造受害者的画作并出售',
        '受害者发现后威胁要报警',
        '嫌疑人在案发当晚确实在现场',
        '嫌疑人用安眠药迷晕受害者后伪装自杀'
      ]
    },
    timeline: [
      { time: '18:00', location: 'gallery', characterId: 'char_chen_minghui', action: '在画室工作', isTruth: true },
      { time: '20:00', location: 'gallery', characterId: 'char_li_weibo', action: '送咖啡给受害者', isTruth: true },
      { time: '21:00', location: 'gallery', characterId: 'char_chen_minghui', action: '与嫌疑人离开画室', isTruth: false },
      { time: '22:00', location: 'gallery', characterId: 'char_chen_minghui', action: '被发现死亡', isTruth: true }
    ],
    characters: [
      {
        id: 'char_chen_minghui',
        name: '辉',
        role: 'victim',
        description: '著名画家，以山水画闻名，性格孤僻但为人正直',
        alibi: '',
        motives: [],
        relationships: [
          { targetId: 'char_li_weibo', type: 'colleague', description: '师徒关系，关系紧张' },
          { targetId: 'char_wang_agent', type: 'colleague', description: '经纪人，合作多年' }
        ]
      },
      {
        id: 'char_li_weibo',
        name: '李微博',
        role: 'culprit',
        description: '受害者的助手，跟随受害者学习绘画，有才华但急功近利',
        alibi: '案发当晚在自己家中',
        motives: ['掩盖伪造画作的罪行被发现'],
        relationships: [
          { targetId: 'char_chen_minghui', type: 'colleague', description: '师徒关系，表面恭敬' },
          { targetId: 'char_wang_agent', type: 'stranger', description: '仅有工作关系' }
        ]
      },
      {
        id: 'char_wang_agent',
        name: '王经纪',
        role: 'witness',
        description: '画廊经纪人，负责销售受害者的画作',
        alibi: '案发当晚在参加拍卖会',
        motives: [],
        relationships: [
          { targetId: 'char_chen_minghui', type: 'colleague', description: '长期合作伙伴' }
        ]
      },
      {
        id: 'char_zhang_guard',
        name: '张保安',
        role: 'witness',
        description: '画廊保安，值班时间在画廊值班',
        alibi: '在保安室',
        motives: [],
        relationships: []
      }
    ],
    evidence: [
      {
        id: 'ev_brush',
        name: '带血的画笔',
        type: 'physical',
        reliability: 90,
        description: '在画室的画笔，上面有受害者的血迹和嫌疑人的指纹',
        location: 'crime_scene',
        discovered: false,
        canContradict: ['test_li_alibi'],
        contradictions: ['嫌疑人说案发当晚在家']
      },
      {
        id: 'ev_letter',
        name: '未完成的信件',
        type: 'physical',
        reliability: 85,
        description: '受害者写给律师的信，提到发现有人伪造他的画作',
        location: 'crime_scene',
        discovered: false,
        canContradict: ['test_li_relation'],
        contradictions: ['嫌疑人说与受害者关系良好']
      },
      {
        id: 'ev_forgery_report',
        name: '鉴定报告',
        type: 'forensic',
        reliability: 95,
        description: '鉴定报告显示近期出售的多幅画作是伪造的',
        location: 'forensics_lab',
        discovered: false,
        canContradict: ['test_li_innocent'],
        contradictions: ['嫌疑人说自己清白无辜']
      },
      {
        id: 'ev_time_contradiction',
        name: '监控录像',
        type: 'physical',
        reliability: 88,
        description: '画廊监控显示嫌疑人21:30还在画廊',
        location: 'police_archive',
        discovered: false,
        canContradict: ['test_li_alibi'],
        contradictions: ['嫌疑人说20:00就离开了']
      },
      {
        id: 'ev_sedative',
        name: '安眠药残留',
        type: 'forensic',
        reliability: 92,
        description: '受害者体内检测出安眠药成分',
        location: 'forensics_lab',
        discovered: false,
        canContradict: ['test_suicide'],
        contradictions: ['受害者是自杀的']
      }
    ],
    witnesses: [
      {
        characterId: 'char_wang_agent',
        isHostile: false,
        hiddenAgenda: '害怕被，想保护生意',
        testimony: [
          {
            id: 'test_wang_1',
            statement: '案发当晚我在参加一个艺术拍卖会，很多人可以作证。',
            isTrue: true,
            canBeContradicted: false,
            contradictedBy: [],
            revealed: false
          },
          {
            id: 'test_wang_2',
            statement: '最近受害者最近精神状态不好，压力很大。',
            isTrue: false,
            canBeContradicted: false,
            contradictedBy: [],
            revealed: false
          }
        ]
      },
      {
        characterId: 'char_zhang_guard',
        isHostile: false,
        hiddenAgenda: '',
        testimony: [
          {
            id: 'test_zhang_1',
            statement: '我看到李微博在20:00左右进入画廊，之后没看到他出来。',
            isTrue: true,
            canBeContradicted: false,
            contradictedBy: [],
            revealed: false
          },
          {
            id: 'test_zhang_2',
            statement: '当晚很安静，没有听到争吵声。',
            isTrue: false,
            canBeContradicted: false,
            contradictedBy: [],
            revealed: false
          }
        ]
      },
      {
        characterId: 'char_li_weibo',
        isHostile: true,
        hiddenAgenda: '掩盖自己的罪行',
        testimony: [
          {
            id: 'test_li_alibi',
            statement: '我当晚8点就离开了画廊，之后一直在家中。',
            isTrue: false,
            canBeContradicted: true,
            contradictedBy: ['ev_brush', 'ev_time_contradiction'],
            revealed: false
          },
          {
            id: 'test_li_relation',
            statement: '我和陈老师关系很好，他很尊敬他。',
            isTrue: false,
            canBeContradicted: true,
            contradictedBy: ['ev_letter'],
            revealed: false
          },
          {
            id: 'test_li_innocent',
            statement: '我是清白的，我没有理由害他。',
            isTrue: false,
            canBeContradicted: true,
            contradictedBy: ['ev_forgery_report'],
            revealed: false
          },
          {
            id: 'test_suicide',
            statement: '陈老师是自杀的，他最近压力很大。',
            isTrue: false,
            canBeContradicted: true,
            contradictedBy: ['ev_sedative'],
            revealed: false
          }
        ]
      }
    ],
    locations: [
      {
        id: 'loc_crime_scene',
        name: '画室',
        type: 'crime_scene',
        description: '受害者的画室，地上有掉落的画笔和散落的颜料',
        evidenceIds: ['ev_brush', 'ev_letter'],
        characterIds: ['char_chen_minghui'],
        actionPointCost: 2
      },
      {
        id: 'loc_police_archive',
        name: '警局档案室',
        type: 'police_archive',
        description: '存放案件相关档案和监控录像',
        evidenceIds: ['ev_time_contradiction'],
        characterIds: [],
        actionPointCost: 1
      },
      {
        id: 'loc_forensics_lab',
        name: '法医实验室',
        type: 'forensics_lab',
        description: '进行物证鉴定和法医检验',
        evidenceIds: ['ev_forgery_report', 'ev_sedative'],
        characterIds: [],
        actionPointCost: 2
      },
      {
        id: 'loc_wang_home',
        name: '王经纪的家',
        type: 'witness_home',
        description: '王的住所',
        evidenceIds: [],
        characterIds: ['char_wang_agent'],
        actionPointCost: 1
      }
    ],
    difficulty: 2
  },
  {
    id: 'case_theft_001',
    type: 'theft',
    title: '珠宝店钻石失窃案',
    description: '市中心珠宝店一颗名贵钻石在夜间被盗，监控被砸碎，嫌疑人是当晚值班的保安。',
    truth: {
      realCulprit: 'char_zhao_thief',
      motive: '欠下巨额赌债',
      keyEvidenceChain: ['ev_gloves', 'ev_debt', 'ev_safe_fingerprint'],
      hiddenDetails: [
        '嫌疑人是内应，与保安公司派来的',
        '嫌疑人知道保安当晚值班的规律',
        '钻石已被转移到别处'
      ]
    },
    timeline: [
      { time: '22:00', location: 'jewelry_store', characterId: 'char_sun_security', action: '开始值班', isTruth: true },
      { time: '01:00', location: 'jewelry_store', characterId: 'char_zhao_thief', action: '破窗进入', isTruth: true },
      { time: '01:30', location: 'jewelry_store', characterId: 'char_zhao_thief', action: '保险柜', isTruth: true },
      { time: '02:00', location: 'jewelry_store', characterId: 'char_zhao_thief', action: '离开现场', isTruth: true },
      { time: '08:00', location: 'jewelry_store', characterId: 'char_li_owner', action: '发现盗窃', isTruth: true }
    ],
    characters: [
      {
        id: 'char_sun_security',
        name: '孙保安',
        role: 'suspect',
        description: '珠宝店保安，当晚值班',
        alibi: '在保安室睡觉',
        motives: [],
        relationships: [
          { targetId: 'char_li_owner', type: 'colleague', description: '雇主关系' }
        ]
      },
      {
        id: 'char_zhao_thief',
        name: '赵小偷',
        role: 'culprit',
        description: '有盗窃前科，欠下赌债',
        alibi: '在家中睡觉',
        motives: ['偿还巨额赌债'],
        relationships: []
      },
      {
        id: 'char_li_owner',
        name: '李老板',
        role: 'witness',
        description: '珠宝店老板',
        alibi: '在家中',
        motives: [],
        relationships: []
      },
      {
        id: 'char_zhou_neighbor',
        name: '周邻居',
        role: 'witness',
        description: '珠宝店隔壁的居民',
        alibi: '在家中',
        motives: [],
        relationships: []
      }
    ],
    evidence: [
      {
        id: 'ev_gloves',
        name: '丢弃的手套',
        type: 'physical',
        reliability: 80,
        description: '在现场附近找到的手套，内侧有嫌疑人DNA',
        location: 'crime_scene',
        discovered: false,
        canContradict: ['test_sun_alibi'],
        contradictions: ['保安说在睡觉']
      },
      {
        id: 'ev_debt',
        name: '赌债欠条',
        type: 'physical',
        reliability: 75,
        description: '在嫌疑人家中找到的巨额赌债欠条',
        location: 'witness_home',
        discovered: false,
        canContradict: ['test_sun_innocent'],
        contradictions: ['嫌疑人说没有动机']
      },
      {
        id: 'ev_safe_fingerprint',
        name: '保险柜指纹',
        type: 'forensic',
        reliability: 95,
        description: '保险柜上的部分指纹',
        location: 'forensics_lab',
        discovered: false,
        canContradict: ['test_sun_alibi'],
        contradictions: ['保安说没碰过保险柜']
      },
      {
        id: 'ev_broken_window',
        name: '破碎窗户碎片',
        type: 'physical',
        reliability: 85,
        description: '被砸碎的窗户，从外部打破',
        location: 'crime_scene',
        discovered: false,
        canContradict: [],
        contradictions: []
      },
      {
        id: 'ev_witness_report',
        name: '邻居证词记录',
        type: 'testimony',
        reliability: 70,
        description: '邻居听到玻璃破碎的声音',
        location: 'police_archive',
        discovered: false,
        canContradict: [],
        contradictions: []
      }
    ],
    witnesses: [
      {
        characterId: 'char_sun_security',
        isHostile: true,
        hiddenAgenda: '掩盖自己的玩忽职守',
        testimony: [
          {
            id: 'test_sun_alibi',
            statement: '我一整晚都在保安室，没有离开过。',
            isTrue: false,
            canBeContradicted: true,
            contradictedBy: ['ev_gloves'],
            revealed: false
          },
          {
            id: 'test_sun_innocent',
            statement: '我没有动机偷东西。',
            isTrue: false,
            canBeContradicted: true,
            contradictedBy: ['ev_debt'],
            revealed: false
          }
        ]
      },
      {
        characterId: 'char_li_owner',
        isHostile: false,
        hiddenAgenda: '',
        testimony: [
          {
            id: 'test_li_1',
            statement: '这颗钻石价值连城，我投了巨额保险。',
            isTrue: true,
            canBeContradicted: false,
            contradictedBy: [],
            revealed: false
          },
          {
            id: 'test_li_2',
            statement: '孙保安工作一直很可靠。',
            isTrue: false,
            canBeContradicted: false,
            contradictedBy: [],
            revealed: false
          }
        ]
      },
      {
        characterId: 'char_zhou_neighbor',
        isHostile: false,
        hiddenAgenda: '',
        testimony: [
          {
            id: 'test_zhou_1',
            statement: '我在凌晨1点左右听到了玻璃破碎的声音。',
            isTrue: true,
            canBeContradicted: false,
            contradictedBy: [],
            revealed: false
          },
          {
            id: 'test_zhou_2',
            statement: '之后看到一个黑影从珠宝店方向跑走。',
            isTrue: true,
            canBeContradicted: false,
            contradictedBy: [],
            revealed: false
          }
        ]
      }
    ],
    locations: [
      {
        id: 'loc_crime_scene',
        name: '珠宝店',
        type: 'crime_scene',
        description: '被砸碎的窗户和被的保险柜',
        evidenceIds: ['ev_gloves', 'ev_broken_window'],
        characterIds: [],
        actionPointCost: 2
      },
      {
        id: 'loc_police_archive',
        name: '警局档案室',
        type: 'police_archive',
        description: '案件档案和证人询问记录',
        evidenceIds: ['ev_witness_report'],
        characterIds: [],
        actionPointCost: 1
      },
      {
        id: 'loc_forensics_lab',
        name: '法医实验室',
        type: 'forensics_lab',
        description: '指纹鉴定',
        evidenceIds: ['ev_safe_fingerprint'],
        characterIds: [],
        actionPointCost: 2
      },
      {
        id: 'loc_sun_home',
        name: '孙保安的家',
        type: 'witness_home',
        description: '孙保安的住所',
        evidenceIds: ['ev_debt'],
        characterIds: ['char_sun_security'],
        actionPointCost: 1
      }
    ],
    difficulty: 1
  }
];

export const getRandomCase = (): Case => {
  return caseTemplates[Math.floor(Math.random() * caseTemplates.length)];
};

export const getCaseByType = (type: CaseType): Case | null => {
  const filtered = caseTemplates.filter(c => c.type === type);
  if (filtered.length > 0) {
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
  return null;
};
