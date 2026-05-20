import type { CanvasElement, LayoutScore, ColorPalette } from '@/types';
import { getContrastRatio, generateColorPalette } from './colorUtils';

export function analyzeLayout(
  elements: CanvasElement[],
  canvasWidth: number,
  canvasHeight: number
): LayoutScore {
  let balanceScore = 100;
  let contrastScore = 100;
  let alignmentScore = 100;
  const suggestions: string[] = [];

  if (elements.length === 0) {
    return {
      balance: 100,
      contrast: 100,
      alignment: 100,
      suggestions: ['画布为空，添加一些元素开始设计'],
      total: 100,
    };
  }

  let leftWeight = 0;
  let rightWeight = 0;
  let topWeight = 0;
  let bottomWeight = 0;
  let totalWeight = 0;

  elements.forEach(element => {
    if (!element.visible) return;

    const elementWeight = element.width * element.height * element.opacity;
    const centerX = element.left + element.width / 2;
    const centerY = element.top + element.height / 2;

    totalWeight += elementWeight;

    if (centerX < canvasWidth / 2) {
      leftWeight += elementWeight;
    } else {
      rightWeight += elementWeight;
    }

    if (centerY < canvasHeight / 2) {
      topWeight += elementWeight;
    } else {
      bottomWeight += elementWeight;
    }

    if (element.left < -20 || element.left + element.width > canvasWidth + 20) {
      alignmentScore -= 10;
      suggestions.push(`元素 "${element.name}" 超出画布水平边界`);
    }
    if (element.top < -20 || element.top + element.height > canvasHeight + 20) {
      alignmentScore -= 10;
      suggestions.push(`元素 "${element.name}" 超出画布垂直边界`);
    }
  });

  if (totalWeight > 0) {
    const horizontalBalance = Math.abs(leftWeight - rightWeight) / totalWeight;
    const verticalBalance = Math.abs(topWeight - bottomWeight) / totalWeight;

    balanceScore -= Math.round((horizontalBalance + verticalBalance) * 50);

    if (horizontalBalance > 0.3) {
      suggestions.push('元素在水平方向上分布不均匀，考虑调整位置');
    }
    if (verticalBalance > 0.3) {
      suggestions.push('元素在垂直方向上分布不均匀，考虑调整位置');
    }
  }

  const textElements = elements.filter(e => e.type === 'text');
  const otherElements = elements.filter(e => e.type !== 'text');

  textElements.forEach(textEl => {
    otherElements.forEach(otherEl => {
      const overlap = checkOverlap(textEl, otherEl);
      if (overlap > 0.5) {
        contrastScore -= 5;
      }
    });
  });

  if (elements.length < 2) {
    suggestions.push('考虑添加更多元素使设计更丰富');
  }

  if (elements.length > 15) {
    suggestions.push('元素较多，考虑简化设计或编组相关元素');
  }

  balanceScore = Math.max(0, Math.min(100, balanceScore));
  contrastScore = Math.max(0, Math.min(100, contrastScore));
  alignmentScore = Math.max(0, Math.min(100, alignmentScore));

  const total = Math.round((balanceScore + contrastScore + alignmentScore) / 3);

  return {
    balance: balanceScore,
    contrast: contrastScore,
    alignment: alignmentScore,
    suggestions: suggestions.length > 0 ? suggestions : ['布局良好！'],
    total,
  };
}

function checkOverlap(el1: CanvasElement, el2: CanvasElement): number {
  const overlapX = Math.max(0, 
    Math.min(el1.left + el1.width, el2.left + el2.width) - 
    Math.max(el1.left, el2.left)
  );
  const overlapY = Math.max(0, 
    Math.min(el1.top + el1.height, el2.top + el2.height) - 
    Math.max(el1.top, el2.top)
  );

  const overlapArea = overlapX * overlapY;
  const el1Area = el1.width * el1.height;

  return el1Area > 0 ? overlapArea / el1Area : 0;
}

export function generateAICopy(keywords: string): string[] {
  const templates = [
    `{keywords} - 品质之选，值得信赖`,
    `发现 {keywords} 的魅力所在`,
    `全新 {keywords}，焕新登场`,
    `精选 {keywords}，为您呈现`,
    `{keywords} - 让生活更美好`,
    `探索 {keywords} 的无限可能`,
    `{keywords}，匠心打造`,
    `选择 {keywords}，选择品质`,
  ];

  return templates
    .map(template => template.replace('{keywords}', keywords))
    .slice(0, 3);
}

export function suggestLayout(
  elements: CanvasElement[],
  canvasWidth: number,
  canvasHeight: number
): { type: string; description: string }[] {
  const suggestions: { type: string; description: string }[] = [];

  if (elements.length === 0) {
    suggestions.push({
      type: 'empty',
      description: '从左侧面板拖入元素开始设计',
    });
    return suggestions;
  }

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const allCentered = elements.every(el => {
    const elCenterX = el.left + el.width / 2;
    const elCenterY = el.top + el.height / 2;
    return Math.abs(elCenterX - centerX) < 50 && Math.abs(elCenterY - centerY) < 50;
  });

  if (allCentered && elements.length > 1) {
    suggestions.push({
      type: 'layout',
      description: '尝试分散元素，创造更有层次的布局',
    });
  }

  const images = elements.filter(e => e.type === 'image');
  const texts = elements.filter(e => e.type === 'text');

  if (images.length > 0 && texts.length > 0) {
    const hasOverlap = texts.some(text => 
      images.some(img => checkOverlap(text, img) > 0.3)
    );
    if (hasOverlap) {
      suggestions.push({
        type: 'contrast',
        description: '考虑调整文字位置或添加文字阴影提高可读性',
      });
    }
  }

  const sortedByZ = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const bottomElement = sortedByZ[0];
  const topElement = sortedByZ[sortedByZ.length - 1];

  if (bottomElement?.type === 'text' && elements.length > 1) {
    suggestions.push({
      type: 'layer',
      description: '文字元素建议置于顶层以确保可读性',
    });
  }

  return suggestions;
}

export function generateColorSuggestions(
  existingColors: string[]
): { palette: ColorPalette; description: string }[] {
  const suggestions: { palette: ColorPalette; description: string }[] = [];

  if (existingColors.length === 0) {
    const palettes = [
      { primary: '#3b82f6', name: '海洋蓝' },
      { primary: '#10b981', name: '自然绿' },
      { primary: '#f59e0b', name: '琥珀金' },
      { primary: '#ef4444', name: '热情红' },
      { primary: '#8b5cf6', name: '优雅紫' },
    ];

    palettes.forEach(({ primary, name }) => {
      suggestions.push({
        palette: generateColorPalette(primary),
        description: `${name}配色方案`,
      });
    });
  } else {
    existingColors.slice(0, 3).forEach(color => {
      suggestions.push({
        palette: generateColorPalette(color),
        description: '基于主色的协调配色',
      });
    });
  }

  return suggestions;
}
