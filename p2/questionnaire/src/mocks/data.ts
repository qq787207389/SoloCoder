import type { Questionnaire, Submission } from '../types';
import dayjs from 'dayjs';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const mockTemplates: Questionnaire[] = [
  {
    id: 'template1',
    title: '客户满意度调查问卷',
    description: '感谢您参与本次调查，您的反馈对我们非常重要！',
    status: 'published',
    isTemplate: true,
    templateName: '满意度调查',
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '您对我们的服务整体满意度如何？',
        required: true,
        order: 0,
        options: [
          { id: 'o1', text: '非常满意' },
          { id: 'o2', text: '满意' },
          { id: 'o3', text: '一般' },
          { id: 'o4', text: '不满意' },
        ],
      },
      {
        id: 'q2',
        type: 'multiple',
        title: '您认为我们哪些方面需要改进？（可多选）',
        required: false,
        order: 1,
        options: [
          { id: 'o5', text: '服务态度' },
          { id: 'o6', text: '响应速度' },
          { id: 'o7', text: '产品质量' },
          { id: 'o8', text: '价格合理性' },
        ],
      },
      {
        id: 'q3',
        type: 'text',
        title: '您有其他建议或意见吗？',
        required: false,
        order: 2,
      },
    ],
    createdAt: dayjs().subtract(7, 'day').toISOString(),
    updatedAt: dayjs().subtract(5, 'day').toISOString(),
  },
  {
    id: 'template2',
    title: '活动报名登记表',
    description: '请填写以下信息完成活动报名',
    status: 'published',
    isTemplate: true,
    templateName: '活动报名',
    questions: [
      {
        id: 'q1',
        type: 'text',
        title: '您的姓名',
        required: true,
        order: 0,
      },
      {
        id: 'q2',
        type: 'text',
        title: '联系电话',
        required: true,
        order: 1,
      },
      {
        id: 'q3',
        type: 'single',
        title: '参与人数',
        required: true,
        order: 2,
        options: [
          { id: 'o1', text: '1人' },
          { id: 'o2', text: '2人' },
          { id: 'o3', text: '3-5人' },
          { id: 'o4', text: '5人以上' },
        ],
      },
    ],
    createdAt: dayjs().subtract(10, 'day').toISOString(),
    updatedAt: dayjs().subtract(8, 'day').toISOString(),
  },
  {
    id: 'template3',
    title: '员工培训反馈表',
    description: '请对本次培训进行评价',
    status: 'published',
    isTemplate: true,
    templateName: '培训反馈',
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '培训内容是否有帮助？',
        required: true,
        order: 0,
        options: [
          { id: 'o1', text: '非常有帮助' },
          { id: 'o2', text: '有一定帮助' },
          { id: 'o3', text: '一般' },
          { id: 'o4', text: '没有帮助' },
        ],
      },
      {
        id: 'q2',
        type: 'text',
        title: '您最喜欢的培训内容是什么？',
        required: false,
        order: 1,
      },
    ],
    createdAt: dayjs().subtract(14, 'day').toISOString(),
    updatedAt: dayjs().subtract(12, 'day').toISOString(),
  },
];

export const mockQuestionnaires: Questionnaire[] = [
  {
    id: 'qn1',
    title: '2024年度员工满意度调查',
    description: '请认真填写，帮助我们改善工作环境',
    status: 'published',
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '您对当前工作环境的满意程度？',
        required: true,
        order: 0,
        options: [
          { id: 'o1', text: '非常满意' },
          { id: 'o2', text: '满意' },
          { id: 'o3', text: '一般' },
          { id: 'o4', text: '不满意' },
        ],
      },
      {
        id: 'q2',
        type: 'multiple',
        title: '您希望公司哪些福利最满意？（可多选）',
        required: false,
        order: 1,
        options: [
          { id: 'o5', text: '薪资待遇' },
          { id: 'o6', text: '假期制度' },
          { id: 'o7', text: '团队氛围' },
          { id: 'o8', text: '晋升机会' },
        ],
      },
      {
        id: 'q3',
        type: 'text',
        title: '您对公司有什么建议？',
        required: false,
        order: 2,
      },
    ],
    deadline: dayjs().add(30, 'day').toISOString(),
    createdAt: dayjs().subtract(3, 'day').toISOString(),
    updatedAt: dayjs().subtract(1, 'day').toISOString(),
  },
  {
    id: 'qn2',
    title: '产品使用体验调查',
    description: '了解您对我们新产品的使用感受',
    status: 'published',
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '您是否喜欢我们的产品吗？',
        required: true,
        order: 0,
        options: [
          { id: 'o1', text: '非常喜欢' },
          { id: 'o2', text: '喜欢' },
          { id: 'o3', text: '一般' },
          { id: 'o4', text: '不喜欢' },
        ],
      },
      {
        id: 'q2',
        type: 'text',
        title: '您认为产品哪些功能需要改进？',
        required: false,
        order: 1,
      },
    ],
    deadline: dayjs().add(15, 'day').toISOString(),
    createdAt: dayjs().subtract(5, 'day').toISOString(),
    updatedAt: dayjs().subtract(2, 'day').toISOString(),
  },
  {
    id: 'qn3',
    title: '未完成的市场调研问卷',
    description: '',
    status: 'draft',
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '您的年龄段是？',
        required: true,
        order: 0,
        options: [
          { id: 'o1', text: '18岁以下' },
          { id: 'o2', text: '18-25岁' },
          { id: 'o3', text: '26-35岁' },
          { id: 'o4', text: '36岁以上' },
        ],
      },
    ],
    createdAt: dayjs().subtract(1, 'day').toISOString(),
    updatedAt: dayjs().subtract(1, 'day').toISOString(),
  },
  {
    id: 'qn4',
    title: '已截止的用户反馈调查',
    description: '感谢您的参与',
    status: 'closed',
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '您是否会向朋友推荐我们的服务？',
        required: true,
        order: 0,
        options: [
          { id: 'o1', text: '一定会' },
          { id: 'o2', text: '可能会' },
          { id: 'o3', text: '不确定' },
          { id: 'o4', text: '不会' },
        ],
      },
      {
        id: 'q2',
        type: 'text',
        title: '其他反馈',
        required: false,
        order: 1,
      },
    ],
    deadline: dayjs().subtract(5, 'day').toISOString(),
    createdAt: dayjs().subtract(20, 'day').toISOString(),
    updatedAt: dayjs().subtract(10, 'day').toISOString(),
  },
  {
    id: 'qn5',
    title: '新功能用户调研',
    description: '帮助我们了解您的需求',
    status: 'published',
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '您使用我们产品的频率？',
        required: true,
        order: 0,
        options: [
          { id: 'o1', text: '每天' },
          { id: 'o2', text: '每周几次' },
          { id: 'o3', text: '每月几次' },
          { id: 'o4', text: '很少使用' },
        ],
      },
      {
        id: 'q2',
        type: 'multiple',
        title: '您希望新增哪些功能？（可多选）',
        required: false,
        order: 1,
        options: [
          { id: 'o5', text: '数据导出' },
          { id: 'o6', text: '团队协作' },
          { id: 'o7', text: '自定义报告' },
          { id: 'o8', text: '移动端APP' },
        ],
      },
    ],
    deadline: dayjs().add(45, 'day').toISOString(),
    createdAt: dayjs().subtract(2, 'day').toISOString(),
    updatedAt: dayjs().subtract(1, 'day').toISOString(),
  },
];

export const mockSubmissions: Submission[] = [
  {
    id: 's1',
    questionnaireId: 'qn1',
    answers: [
      { questionId: 'q1', value: 'o1' },
      { questionId: 'q2', value: ['o5', 'o7'] },
      { questionId: 'q3', value: '希望增加更多培训机会' },
    ],
    submittedAt: dayjs().subtract(2, 'day').toISOString(),
  },
  {
    id: 's2',
    questionnaireId: 'qn1',
    answers: [
      { questionId: 'q1', value: 'o2' },
      { questionId: 'q2', value: ['o6', 'o8'] },
      { questionId: 'q3', value: '' },
    ],
    submittedAt: dayjs().subtract(1, 'day').toISOString(),
  },
  {
    id: 's3',
    questionnaireId: 'qn1',
    answers: [
      { questionId: 'q1', value: 'o2' },
      { questionId: 'q2', value: ['o5'] },
      { questionId: 'q3', value: '工作环境很好' },
    ],
    submittedAt: dayjs().subtract(12, 'hour').toISOString(),
  },
  {
    id: 's4',
    questionnaireId: 'qn1',
    answers: [
      { questionId: 'q1', value: 'o3' },
      { questionId: 'q2', value: ['o5', 'o6', 'o7'] },
      { questionId: 'q3', value: '希望薪资能再提高一些' },
    ],
    submittedAt: dayjs().subtract(6, 'hour').toISOString(),
  },
  {
    id: 's5',
    questionnaireId: 'qn1',
    answers: [
      { questionId: 'q1', value: 'o1' },
      { questionId: 'q2', value: ['o7', 'o8'] },
      { questionId: 'q3', value: '' },
    ],
    submittedAt: dayjs().subtract(2, 'hour').toISOString(),
  },
  {
    id: 's6',
    questionnaireId: 'qn2',
    answers: [
      { questionId: 'q1', value: 'o2' },
      { questionId: 'q2', value: '界面可以更美观' },
    ],
    submittedAt: dayjs().subtract(3, 'day').toISOString(),
  },
  {
    id: 's7',
    questionnaireId: 'qn2',
    answers: [
      { questionId: 'q1', value: 'o1' },
      { questionId: 'q2', value: '功能很强大' },
    ],
    submittedAt: dayjs().subtract(1, 'day').toISOString(),
  },
  {
    id: 's8',
    questionnaireId: 'qn4',
    answers: [
      { questionId: 'q1', value: 'o2' },
      { questionId: 'q2', value: '服务很好' },
    ],
    submittedAt: dayjs().subtract(10, 'day').toISOString(),
  },
  {
    id: 's9',
    questionnaireId: 'qn4',
    answers: [
      { questionId: 'q1', value: 'o1' },
      { questionId: 'q2', value: '' },
    ],
    submittedAt: dayjs().subtract(8, 'day').toISOString(),
  },
  {
    id: 's10',
    questionnaireId: 'qn5',
    answers: [
      { questionId: 'q1', value: 'o2' },
      { questionId: 'q2', value: ['o5', 'o6'] },
    ],
    submittedAt: dayjs().subtract(1, 'day').toISOString(),
  },
];
