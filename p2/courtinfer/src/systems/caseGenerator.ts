import type { Case, CaseType, Character, Evidence, Testimony, Witness, Location } from '../types';
import { getRandomCase } from '../data/caseTemplates';

export interface GeneratedCase extends Case {
  randomSeed: number;
}

const characterNames = [
  '张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十',
  '陈明', '刘华', '杨强', '黄军', '林峰', '徐静', '朱红', '马超'
];

const locations = [
  { id: 'loc_crime_scene', name: '案发现场', type: 'crime_scene', cost: 2 },
  { id: 'loc_police_archive', name: '警局档案室', type: 'police_archive', cost: 1 },
  { id: 'loc_forensics_lab', name: '法医实验室', type: 'forensics_lab', cost: 2 },
  { id: 'loc_witness_home', name: '证人住所', type: 'witness_home', cost: 1 }
];

const evidenceTypes = ['physical', 'testimony', 'forensic'] as const;

const motiveOptions = [
  '金钱利益', '感情纠纷', '仇恨报复', '掩盖罪行', '嫉妒心理', '自卫过当', '被胁迫'
];

export const generateRandomCase = (): GeneratedCase => {
  const randomSeed = Math.floor(Math.random() * 1000000);
  
  const baseCase = getRandomCase();
  
  const modifiedCase: GeneratedCase = {
    ...baseCase,
    id: `case_${randomSeed}`,
    randomSeed,
    characters: baseCase.characters.map(char => ({
      ...char,
      id: `char_${randomSeed}_${char.id.split('_').pop()}`
    })),
    evidence: baseCase.evidence.map(ev => ({
      ...ev,
      id: `ev_${randomSeed}_${ev.id.split('_').pop()}`
    })),
    witnesses: baseCase.witnesses.map(witness => ({
      ...witness,
      characterId: `char_${randomSeed}_${witness.characterId.split('_').pop()}`,
      testimony: witness.testimony.map(test => ({
        ...test,
        id: `test_${randomSeed}_${test.id.split('_').pop()}`,
        contradictedBy: test.contradictedBy.map(evId => `ev_${randomSeed}_${evId.split('_').pop()}`)
      }))
    })),
    truth: {
      ...baseCase.truth,
      realCulprit: `char_${randomSeed}_${baseCase.truth.realCulprit.split('_').pop()}`,
      keyEvidenceChain: baseCase.truth.keyEvidenceChain.map(evId => `ev_${randomSeed}_${evId.split('_').pop()}`)
    },
    locations: baseCase.locations.map(loc => ({
      ...loc,
      id: `loc_${randomSeed}_${loc.id.split('_').pop()}`,
      evidenceIds: loc.evidenceIds.map(evId => `ev_${randomSeed}_${evId.split('_').pop()}`)
    }))
  };

  modifiedCase.evidence = modifiedCase.evidence.map(ev => {
    if (ev.canContradict.length > 0) {
      ev.canContradict = ev.canContradict.map(testId => 
        modifiedCase.witnesses.flatMap(w => w.testimony).find(t => 
          t.id.includes(testId.split('_').pop())
        )?.id || testId
      );
    }
    return ev;
  });

  return modifiedCase;
};

export const generateCaseOfType = (type: CaseType): GeneratedCase | null => {
  const randomSeed = Math.floor(Math.random() * 1000000);
  
  const caseTemplates = [
    generateMurderCase,
    generateTheftCase,
    generateFraudCase,
    generateArsonCase
  ];

  const generators: Record<CaseType, () => GeneratedCase> = {
    murder: generateMurderCase,
    theft: generateTheftCase,
    fraud: generateFraudCase,
    arson: generateArsonCase
  };

  const generator = generators[type];
  if (generator) {
    return generator();
  }
  return null;
};

function generateMurderCase(): GeneratedCase {
  const seed = Math.floor(Math.random() * 1000000);
  
  const characters: Character[] = [
    {
      id: `char_${seed}_victim`,
      name: characterNames[Math.floor(Math.random() * characterNames.length)],
      role: 'victim',
      description: '受害者',
      alibi: '',
      motives: [],
      relationships: []
    },
    {
      id: `char_${seed}_culprit`,
      name: characterNames[Math.floor(Math.random() * characterNames.length)],
      role: 'culprit',
      description: '嫌疑人，有充分的作案动机',
      alibi: '案发当晚独自在家',
      motives: [motiveOptions[Math.floor(Math.random() * motiveOptions.length)]],
      relationships: []
    },
    {
      id: `char_${seed}_witness1`,
      name: characterNames[Math.floor(Math.random() * characterNames.length)],
      role: 'witness',
      description: '目击者',
      alibi: '在家中',
      motives: [],
      relationships: []
    }
  ];

  const evidence: Evidence[] = [
    {
      id: `ev_${seed}_weapon`,
      name: '作案凶器',
      type: 'physical',
      reliability: 90,
      description: '在现场发现的带有指纹的凶器',
      location: 'crime_scene',
      discovered: false,
      canContradict: [`test_${seed}_culprit_alibi`],
      contradictions: ['嫌疑人说案发当晚在家']
    },
    {
      id: `ev_${seed}_motive`,
      name: '动机证据',
      type: 'physical',
      reliability: 85,
      description: '能证明嫌疑人有作案动机的证据',
      location: 'witness_home',
      discovered: false,
      canContradict: [`test_${seed}_culprit_innocent`],
      contradictions: ['嫌疑人说没有动机']
    },
    {
      id: `ev_${seed}_time`,
      name: '时间证据',
      type: 'forensic',
      reliability: 80,
      description: '能证明嫌疑人在案发时间在场的证据',
      location: 'police_archive',
      discovered: false,
      canContradict: [`test_${seed}_culprit_alibi`],
      contradictions: ['嫌疑人说不在现场']
    }
  ];

  const witnesses: Witness[] = [
    {
      characterId: `char_${seed}_culprit`,
      isHostile: true,
      hiddenAgenda: '掩盖罪行',
      testimony: [
        {
          id: `test_${seed}_culprit_alibi`,
          statement: '我案发当晚一直在家，没有出去过。',
          isTrue: false,
          canBeContradicted: true,
          contradictedBy: [`ev_${seed}_weapon`, `ev_${seed}_time`],
          revealed: false
        },
        {
          id: `test_${seed}_culprit_innocent`,
          statement: '我和受害者关系很好，没有理由伤害他。',
          isTrue: false,
          canBeContradicted: true,
          contradictedBy: [`ev_${seed}_motive`],
          revealed: false
        }
      ]
    },
    {
      characterId: `char_${seed}_witness1`,
      isHostile: false,
      hiddenAgenda: '',
      testimony: [
        {
          id: `test_${seed}_witness1_1`,
          statement: '我在案发时间看到一个可疑的人影。',
          isTrue: true,
          canBeContradicted: false,
          contradictedBy: [],
          revealed: false
        }
      ]
    }
  ];

  const caseLocations: Location[] = locations.map((loc, index) => ({
    id: `loc_${seed}_${loc.id.split('_').slice(-1)}`,
    name: loc.name,
    type: loc.type as any,
    description: `${loc.name}的相关调查地点`,
    evidenceIds: evidence.filter(ev => ev.location === loc.type).map(ev => ev.id),
    characterIds: [],
    actionPointCost: loc.cost
  }));

  return {
    id: `case_${seed}`,
    type: 'murder',
    title: `谋杀案 #${seed}`,
    description: '一起谋杀案件，需要找出真凶。',
    truth: {
      realCulprit: `char_${seed}_culprit`,
      motive: motiveOptions[Math.floor(Math.random() * motiveOptions.length)],
      keyEvidenceChain: [`ev_${seed}_weapon`, `ev_${seed}_motive`, `ev_${seed}_time`],
      hiddenDetails: ['嫌疑人用某种手段作案，试图掩盖证据']
    },
    timeline: [],
    characters,
    evidence,
    witnesses,
    locations: caseLocations,
    difficulty: 1,
    randomSeed: seed
  };
}

function generateTheftCase(): GeneratedCase {
  const seed = Math.floor(Math.random() * 1000000);
  
  const characters: Character[] = [
    {
      id: `char_${seed}_victim`,
      name: characterNames[Math.floor(Math.random() * characterNames.length)],
      role: 'victim',
      description: '受害者，丢失了贵重物品',
      alibi: '',
      motives: [],
      relationships: []
    },
    {
      id: `char_${seed}_culprit`,
      name: characterNames[Math.floor(Math.random() * characterNames.length)],
      role: 'culprit',
      description: '有盗窃嫌疑的人员',
      alibi: '案发时在其他地方',
      motives: ['经济困难'],
      relationships: []
    },
    {
      id: `char_${seed}_witness1`,
      name: characterNames[Math.floor(Math.random() * characterNames.length)],
      role: 'witness',
      description: '现场附近的目击者',
      alibi: '在家中',
      motives: [],
      relationships: []
    }
  ];

  const evidence: Evidence[] = [
    {
      id: `ev_${seed}_fingerprint`,
      name: '指纹证据',
      type: 'forensic',
      reliability: 95,
      description: '在现场发现的嫌疑人指纹',
      location: 'crime_scene',
      discovered: false,
      canContradict: [`test_${seed}_culprit_alibi`],
      contradictions: ['嫌疑人说没到过现场']
    },
    {
      id: `ev_${seed}_stolen`,
      name: '赃物',
      type: 'physical',
      reliability: 90,
      description: '在嫌疑人处发现的部分赃物',
      location: 'witness_home',
      discovered: false,
      canContradict: [`test_${seed}_culprit_innocent`],
      contradictions: ['嫌疑人说没有偷窃']
    },
    {
      id: `ev_${seed}_motive`,
      name: '动机证据',
      type: 'physical',
      reliability: 80,
      description: '显示嫌疑人经济困难的证据',
      location: 'police_archive',
      discovered: false,
      canContradict: [`test_${seed}_culprit_innocent`],
      contradictions: ['嫌疑人说没有动机']
    }
  ];

  const witnesses: Witness[] = [
    {
      characterId: `char_${seed}_culprit`,
      isHostile: true,
      hiddenAgenda: '掩盖盗窃行为',
      testimony: [
        {
          id: `test_${seed}_culprit_alibi`,
          statement: '我案发时根本不在现场附近。',
          isTrue: false,
          canBeContradicted: true,
          contradictedBy: [`ev_${seed}_fingerprint`],
          revealed: false
        },
        {
          id: `test_${seed}_culprit_innocent`,
          statement: '我没有偷任何东西，这是诬告。',
          isTrue: false,
          canBeContradicted: true,
          contradictedBy: [`ev_${seed}_stolen`, `ev_${seed}_motive`],
          revealed: false
        }
      ]
    },
    {
      characterId: `char_${seed}_witness1`,
      isHostile: false,
      hiddenAgenda: '',
      testimony: [
        {
          id: `test_${seed}_witness1_1`,
          statement: '我看到一个人影在案发时间出现在现场附近。',
          isTrue: true,
          canBeContradicted: false,
          contradictedBy: [],
          revealed: false
        }
      ]
    }
  ];

  const caseLocations: Location[] = locations.map((loc, index) => ({
    id: `loc_${seed}_${loc.id.split('_').slice(-1)}`,
    name: loc.name,
    type: loc.type as any,
    description: `${loc.name}的相关调查地点`,
    evidenceIds: evidence.filter(ev => ev.location === loc.type).map(ev => ev.id),
    characterIds: [],
    actionPointCost: loc.cost
  }));

  return {
    id: `case_${seed}`,
    type: 'theft',
    title: `盗窃案 #${seed}`,
    description: '一起贵重物品被盗案件，需要找出真凶。',
    truth: {
      realCulprit: `char_${seed}_culprit`,
      motive: '经济困难',
      keyEvidenceChain: [`ev_${seed}_fingerprint`, `ev_${seed}_stolen`, `ev_${seed}_motive`],
      hiddenDetails: ['嫌疑人经济困难，铤而走险']
    },
    timeline: [],
    characters,
    evidence,
    witnesses,
    locations: caseLocations,
    difficulty: 1,
    randomSeed: seed
  };
}

function generateFraudCase(): GeneratedCase {
  const seed = Math.floor(Math.random() * 1000000);
  
  return {
    ...generateTheftCase(),
    id: `case_${seed}`,
    type: 'fraud',
    title: `诈骗案 #${seed}`,
    description: '一起金融诈骗案件，需要找出真凶。',
    truth: {
      realCulprit: `char_${seed}_culprit`,
      motive: '获取非法利益',
      keyEvidenceChain: [`ev_${seed}_fingerprint`, `ev_${seed}_stolen`, `ev_${seed}_motive`],
      hiddenDetails: ['嫌疑人伪造文件进行诈骗'],
    },
    randomSeed: seed
  };
}

function generateArsonCase(): GeneratedCase {
  const seed = Math.floor(Math.random() * 1000000);
  
  return {
    ...generateTheftCase(),
    id: `case_${seed}`,
    type: 'arson',
    title: `纵火案 #${seed}`,
    description: '一起纵火案件，需要找出真凶。',
    truth: {
      realCulprit: `char_${seed}_culprit`,
      motive: '报复或掩盖其他罪行',
      keyEvidenceChain: [`ev_${seed}_fingerprint`, `ev_${seed}_stolen`, `ev_${seed}_motive`],
      hiddenDetails: ['嫌疑人纵火以掩盖其他罪行'],
    },
    randomSeed: seed
  };
}

export const initializeCaseForGame = (caseData: GeneratedCase): GeneratedCase => {
  return {
    ...caseData,
    evidence: caseData.evidence.map(ev => ({
      ...ev,
      discovered: false
    })),
    witnesses: caseData.witnesses.map(w => ({
      ...w,
      testimony: w.testimony.map(t => ({
        ...t,
        revealed: false
      }))
    }))
  };
};
