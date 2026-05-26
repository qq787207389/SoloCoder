import type { Evidence, Testimony } from '../types';

export interface ContradictionResult {
  canContradict: boolean;
  confidence: number;
  explanation: string;
}

export interface ContradictionRule {
  id: string;
  name: string;
  description: string;
  check: (evidence: Evidence, testimony: Testimony) => ContradictionResult;
}

const rules: ContradictionRule[] = [
  {
    id: 'rule_direct_contradiction',
    name: '直接矛盾',
    description: '证据直接与证词内容矛盾',
    check: (evidence, testimony) => {
      const contradictions = evidence.contradictions;
      const statement = testimony.statement;
      
      for (const contradiction of contradictions) {
        const keywords = extractKeywords(contradiction);
        let matchCount = 0;
        
        for (const keyword of keywords) {
          if (statement.includes(keyword)) {
            matchCount++;
          }
        }
        
        if (matchCount >= keywords.length * 0.5) {
          return {
            canContradict: true,
            confidence: Math.min(0.9, evidence.reliability / 100 * 0.9),
            explanation: `证据"${evidence.name}"与证词"${statement}"存在直接矛盾`
          };
        }
      }
      
      return {
        canContradict: false,
        confidence: 0,
        explanation: '未发现直接矛盾'
      };
    }
  },
  {
    id: 'rule_evidence_chain',
    name: '证据链反驳',
    description: '通过证据链反驳证词',
    check: (evidence, testimony) => {
      if (evidence.canContradict.includes(testimony.id)) {
        return {
          canContradict: true,
          confidence: evidence.reliability / 100,
          explanation: `证据"${evidence.name}"可反驳证词"${testimony.statement}"`
        };
      }
      
      return {
        canContradict: false,
        confidence: 0,
        explanation: '证据不在可反驳列表中'
      };
    }
  },
  {
    id: 'rule_semantic_match',
    name: '语义匹配',
    description: '基于语义的矛盾检测',
    check: (evidence, testimony) => {
      const evidenceDesc = evidence.description.toLowerCase();
      const statement = testimony.statement.toLowerCase();
      
      const contradictionIndicators = [
        { evidenceWords: ['在家', '不在'], testimonyWords: ['现场', '出现'] },
        { evidenceWords: ['没有', '从未'], testimonyWords: ['有', '曾经'] },
        { evidenceWords: ['清白', '无辜'], testimonyWords: ['有罪', '作案'] }
      ];
      
      for (const indicator of contradictionIndicators) {
        const hasEvidenceWords = indicator.evidenceWords.some(w => evidenceDesc.includes(w));
        const hasTestimonyWords = indicator.testimonyWords.some(w => statement.includes(w));
        
        if (hasEvidenceWords && hasTestimonyWords) {
          return {
            canContradict: true,
            confidence: 0.6 * (evidence.reliability / 100),
            explanation: `证据描述与证词存在语义矛盾`
          };
        }
      }
      
      return {
        canContradict: false,
        confidence: 0,
        explanation: '语义分析未发现矛盾'
      };
    }
  },
  {
    id: 'rule_time_contradiction',
    name: '时间矛盾',
    description: '检测时间相关的矛盾',
    check: (evidence, testimony) => {
      const timePattern = /(\d{1,2}):(\d{2})|(上午|下午|晚上|凌晨)/g;
      const evidenceTimes = evidence.description.match(timePattern) || [];
      const testimonyTimes = testimony.statement.match(timePattern) || [];
      
      if (evidenceTimes.length > 0 && testimonyTimes.length > 0) {
        return {
          canContradict: true,
          confidence: 0.7 * (evidence.reliability / 100),
          explanation: '时间点存在矛盾'
        };
      }
      
      return {
        canContradict: false,
        confidence: 0,
        explanation: '未检测到时间矛盾'
      };
    }
  }
];

function extractKeywords(text: string): string[] {
  const stopWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];
  
  const words = text.split(/[\s,，。！？、；：""'（）\[\]【】…—]+/);
  const keywords = words.filter(word => word.length > 1 && !stopWords.includes(word));
  
  return keywords.length > 0 ? keywords : [text];
}

export const checkContradiction = (evidence: Evidence, testimony: Testimony): ContradictionResult => {
  if (!testimony.canBeContradicted) {
    return {
      canContradict: false,
      confidence: 0,
      explanation: '该证词不可被反驳'
    };
  }
  
  let bestResult: ContradictionResult = {
    canContradict: false,
    confidence: 0,
    explanation: '未找到矛盾'
  };
  
  for (const rule of rules) {
    const result = rule.check(evidence, testimony);
    if (result.canContradict && result.confidence > bestResult.confidence) {
      bestResult = result;
    }
  }
  
  return bestResult;
};

export const findContradictingEvidence = (
  testimony: Testimony,
  evidenceList: Evidence[]
): { evidence: Evidence; result: ContradictionResult }[] => {
  const results: { evidence: Evidence; result: ContradictionResult }[] = [];
  
  for (const evidence of evidenceList) {
    if (!evidence.discovered) continue;
    
    const result = checkContradiction(evidence, testimony);
    if (result.canContradict) {
      results.push({ evidence, result });
    }
  }
  
  return results.sort((a, b) => b.result.confidence - a.result.confidence);
};

export const getContradictionExplanation = (
  evidence: Evidence,
  testimony: Testimony
): string => {
  const result = checkContradiction(evidence, testimony);
  
  if (result.canContradict) {
    return `异议成立！证据"${evidence.name}"与证词"${testimony.statement}"存在矛盾。${result.explanation}`;
  }
  
  return `异议无效。证据"${evidence.name}"无法反驳该证词。`;
};

export const calculateObjectionImpact = (
  result: ContradictionResult,
  currentJuryInclination: number,
  judgeTrust: number
): { juryChange: number; judgeChange: number } => {
  const baseJuryChange = 15;
  const baseJudgeChange = -10;
  
  const juryChange = result.canContradict
    ? Math.round(baseJuryChange * result.confidence * (1 + judgeTrust / 200))
    : -5;
  
  const judgeChange = result.canContradict
    ? Math.round(baseJudgeChange * (1 - result.confidence))
    : -15;
  
  return {
    juryChange: Math.max(-20, Math.min(20, juryChange)),
    judgeChange: Math.max(-20, Math.min(5, judgeChange))
  };
};
