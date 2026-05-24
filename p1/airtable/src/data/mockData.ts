import { v4 as uuidv4 } from 'uuid';
import type { Table, TableRecord, Column, User } from '../store/types';

const STATUS_OPTIONS = [
  { id: 'status-1', name: '未开始', color: '#94a3b8' },
  { id: 'status-2', name: '进行中', color: '#3b82f6' },
  { id: 'status-3', name: '已完成', color: '#10b981' },
  { id: 'status-4', name: '已阻塞', color: '#ef4444' },
];

const PRIORITY_OPTIONS = [
  { id: 'priority-1', name: '低', color: '#22c55e' },
  { id: 'priority-2', name: '中', color: '#f59e0b' },
  { id: 'priority-3', name: '高', color: '#ef4444' },
];

const TASK_NAMES = [
  '设计用户界面原型',
  '编写技术规格文档',
  '实现用户认证模块',
  '优化数据库查询性能',
  '编写单元测试用例',
  '修复登录页面 Bug',
  '添加国际化支持',
  '实现实时通知功能',
  '重构状态管理逻辑',
  '编写 API 文档',
  '配置 CI/CD 流水线',
  '添加安全审计功能',
  '实现数据导出功能',
  '优化移动端体验',
  '添加搜索功能',
  '实现文件上传功能',
  '修复内存泄漏问题',
  '添加错误边界处理',
  '实现权限控制系统',
  '优化首屏加载时间',
];

const projectTableId = 'table-projects';
const taskTableId = 'table-tasks';

export const mockUsers: User[] = [
  { id: 'user-1', name: '张三', avatar: '👨‍💻', color: '#3b82f6' },
  { id: 'user-2', name: '李四', avatar: '👩‍🎨', color: '#10b981' },
  { id: 'user-3', name: '王五', avatar: '👨‍🔬', color: '#f59e0b' },
];

export function createMockTables(): Record<string, Table> {
  const projectColumns: Column[] = [
    { id: 'col-p-name', name: '项目名称', type: 'text', width: 200, order: 0 },
    { id: 'col-p-status', name: '状态', type: 'select', width: 120, order: 1, options: { selectOptions: STATUS_OPTIONS } },
    { id: 'col-p-desc', name: '描述', type: 'text', width: 300, order: 2 },
    { id: 'col-p-date', name: '截止日期', type: 'date', width: 140, order: 3 },
  ];

  const taskColumns: Column[] = [
    { id: 'col-t-name', name: '任务名称', type: 'text', width: 220, order: 0 },
    { id: 'col-t-status', name: '状态', type: 'select', width: 120, order: 1, options: { selectOptions: STATUS_OPTIONS } },
    { id: 'col-t-priority', name: '优先级', type: 'select', width: 100, order: 2, options: { selectOptions: PRIORITY_OPTIONS } },
    { id: 'col-t-project', name: '所属项目', type: 'linkRecord', width: 180, order: 3, options: { linkTableId: projectTableId, linkDisplayColumnId: 'col-p-name' } },
    { id: 'col-t-date', name: '截止日期', type: 'date', width: 140, order: 4 },
    { id: 'col-t-tags', name: '标签', type: 'multiSelect', width: 200, order: 5, options: { selectOptions: [
      { id: 'tag-frontend', name: '前端', color: '#06b6d4' },
      { id: 'tag-backend', name: '后端', color: '#8b5cf6' },
      { id: 'tag-design', name: '设计', color: '#ec4899' },
      { id: 'tag-docs', name: '文档', color: '#84cc16' },
      { id: 'tag-testing', name: '测试', color: '#f97316' },
    ]}},
    { id: 'col-t-estimate', name: '预估工时', type: 'number', width: 120, order: 6, options: { numberPrecision: 1 } },
  ];

  return {
    [projectTableId]: {
      id: projectTableId,
      name: '项目表',
      columns: projectColumns,
      createdAt: Date.now(),
    },
    [taskTableId]: {
      id: taskTableId,
      name: '任务表',
      columns: taskColumns,
      createdAt: Date.now(),
    },
  };
}

export function createMockRecords(): { [tableId: string]: { [recordId: string]: TableRecord } } {
  const now = Date.now();
  const baseDate = new Date();

  const projectRecords: { [key: string]: TableRecord } = {};
  const projectIds: string[] = [];

  for (let i = 0; i < 8; i++) {
    const id = uuidv4();
    projectIds.push(id);
    projectRecords[id] = {
      id,
      tableId: projectTableId,
      data: {
        'col-p-name': `项目 ${String.fromCharCode(65 + i)} - ${['官网改版', '移动端 App', '数据分析平台', '内部管理系统', '电商平台', '社交应用', 'AI 助手', '云存储服务'][i]}`,
        'col-p-status': STATUS_OPTIONS[i % 4].id,
        'col-p-desc': ['企业官网全新升级改版项目，包含设计和开发', 'iOS 和 Android 双端原生应用开发', '业务数据可视化分析平台', '公司内部运营管理后台系统', 'B2C 电商平台，支持多种支付方式', '基于兴趣的社交网络应用', '智能对话助手，集成多种 AI 模型', '企业级云存储和文件协作服务'][i],
        'col-p-date': new Date(baseDate.getTime() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      createdAt: now - i * 1000,
      updatedAt: now - i * 500,
    };
  }

  const taskRecords: { [key: string]: TableRecord } = {};
  for (let i = 0; i < 100; i++) {
    const id = uuidv4();
    const tags = [];
    if (i % 3 === 0) tags.push('tag-frontend');
    if (i % 4 === 0) tags.push('tag-backend');
    if (i % 5 === 0) tags.push('tag-design');
    if (i % 6 === 0) tags.push('tag-docs');
    if (i % 7 === 0) tags.push('tag-testing');

    taskRecords[id] = {
      id,
      tableId: taskTableId,
      data: {
        'col-t-name': TASK_NAMES[i % TASK_NAMES.length] + (i >= TASK_NAMES.length ? ` #${Math.floor(i / TASK_NAMES.length) + 1}` : ''),
        'col-t-status': STATUS_OPTIONS[i % 4].id,
        'col-t-priority': PRIORITY_OPTIONS[i % 3].id,
        'col-t-project': projectIds[i % projectIds.length],
        'col-t-date': new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        'col-t-tags': tags,
        'col-t-estimate': Math.round((Math.random() * 40 + 2) * 10) / 10,
      },
      createdAt: now - i * 100,
      updatedAt: now - i * 50,
    };
  }

  return {
    [projectTableId]: projectRecords,
    [taskTableId]: taskRecords,
  };
}

export const initialTableId = taskTableId;
