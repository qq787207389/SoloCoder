import { DiagnosticIssue } from '../types';

const ACTION_VERBS = [
  '主导', '负责', '开发', '设计', '优化', '实现', '建立', '指导',
  '构建', '集成', '支持', '管理', '分析', '创建', '改进', '参与'
];

const CONTACT_PATTERNS = [
  /\b[\w.-]+@[\w.-]+\.\w{2,}\b/,
  /\b1[3-9]\d{9}\b/,
  /https?:\/\/[^\s]+/
];

export const diagnoseResume = (markdown: string): DiagnosticIssue[] => {
  const issues: DiagnosticIssue[] = [];
  
  const hasContactInfo = CONTACT_PATTERNS.some(pattern => pattern.test(markdown));
  if (!hasContactInfo) {
    issues.push({
      type: 'warning',
      message: '缺少联系方式',
      suggestion: '建议添加邮箱、电话或社交媒体链接，方便招聘方联系您'
    });
  }

  const hasH1 = markdown.startsWith('# ') || markdown.includes('\n# ');
  if (!hasH1) {
    issues.push({
      type: 'warning',
      message: '缺少姓名标题',
      suggestion: '建议在简历开头使用 # 姓名 格式添加您的姓名'
    });
  }

  const experienceMatch = markdown.match(/##.*(经历|经验|工作|项目)/i);
  if (!experienceMatch) {
    issues.push({
      type: 'warning',
      message: '缺少工作或项目经历',
      suggestion: '建议添加工作经历或项目经历，展示您的实践经验'
    });
  }

  const lines = markdown.split('\n');
  let listItems: string[] = [];
  lines.forEach(line => {
    if (line.trim().startsWith('- ') || line.trim().match(/^\d+\.\s/)) {
      listItems.push(line.trim());
    }
  });

  let hasActionVerb = false;
  listItems.forEach(item => {
    if (ACTION_VERBS.some(verb => item.includes(verb))) {
      hasActionVerb = true;
    }
  });

  if (listItems.length > 0 && !hasActionVerb) {
    issues.push({
      type: 'info',
      message: '建议使用动作动词',
      suggestion: '在描述经历时使用"主导"、"负责"、"开发"、"优化"等动作动词开头'
    });
  }

  const dates = markdown.match(/(\d{4}年)(\s*[-至~]\s*)(\d{4}年|至今)/g) || [];
  if (dates.length >= 2) {
    const dateOrder = dates.map(d => {
      const startYear = parseInt(d.match(/\d{4}/)?.[0] || '0');
      return startYear;
    });
    const isDescending = dateOrder.every((year, i) => i === 0 || year <= dateOrder[i - 1]);
    if (!isDescending) {
      issues.push({
        type: 'warning',
        message: '经历可能未按时间倒序',
        suggestion: '建议工作经历按时间倒序排列，最新的经历放在最前面'
      });
    }
  }

  const wordCount = markdown.replace(/[#*\-]/g, '').split(/\s+/).length;
  if (wordCount < 100) {
    issues.push({
      type: 'info',
      message: '简历内容较短',
      suggestion: '建议丰富简历内容，详细描述您的技能和经历'
    });
  } else if (wordCount > 800) {
    issues.push({
      type: 'info',
      message: '简历内容较长',
      suggestion: '建议精简简历内容，突出重点，保持在1-2页A4纸'
    });
  }

  return issues;
};
