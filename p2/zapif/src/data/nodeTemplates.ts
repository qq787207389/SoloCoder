import type { NodeTemplate } from '../types';

export const nodeTemplates: NodeTemplate[] = [
  {
    type: 'trigger',
    subtype: 'scheduler',
    name: '定时触发',
    icon: '⏰',
    description: '按指定时间间隔触发工作流',
    defaultInputs: [],
    defaultOutputs: [
      { id: 'out', name: '输出', type: 'output', dataType: 'object' }
    ],
    defaultParameters: [
      { id: 'interval', name: '触发间隔', type: 'select', value: '1h' },
      { id: 'cron', name: 'Cron 表达式', type: 'string', value: '0 0 * * *' }
    ],
    defaultConfig: { interval: '1h', cron: '0 0 * * *' }
  },
  {
    type: 'trigger',
    subtype: 'webhook',
    name: '收到 Webhook',
    icon: '🔗',
    description: '当接收到 HTTP 请求时触发',
    defaultInputs: [],
    defaultOutputs: [
      { id: 'out', name: '请求数据', type: 'output', dataType: 'object' }
    ],
    defaultParameters: [
      { id: 'method', name: '请求方法', type: 'select', value: 'POST' },
      { id: 'path', name: '路径', type: 'string', value: '/webhook' }
    ],
    defaultConfig: { method: 'POST', path: '/webhook' }
  },
  {
    type: 'trigger',
    subtype: 'file_created',
    name: '文件创建',
    icon: '📄',
    description: '当文件被创建时触发',
    defaultInputs: [],
    defaultOutputs: [
      { id: 'out', name: '文件信息', type: 'output', dataType: 'object' }
    ],
    defaultParameters: [
      { id: 'directory', name: '监控目录', type: 'string', value: '/' }
    ],
    defaultConfig: { directory: '/' }
  },
  {
    type: 'action',
    subtype: 'send_email',
    name: '发送邮件',
    icon: '📧',
    description: '发送电子邮件',
    defaultInputs: [
      { id: 'in', name: '输入', type: 'input', dataType: 'object' }
    ],
    defaultOutputs: [
      { id: 'out', name: '发送结果', type: 'output', dataType: 'object' }
    ],
    defaultParameters: [
      { id: 'to', name: '收件人', type: 'string', value: '' },
      { id: 'subject', name: '主题', type: 'string', value: '' },
      { id: 'body', name: '正文', type: 'text', value: '' }
    ],
    defaultConfig: {}
  },
  {
    type: 'action',
    subtype: 'write_sheet',
    name: '写入表格',
    icon: '📊',
    description: '将数据写入电子表格',
    defaultInputs: [
      { id: 'in', name: '数据', type: 'input', dataType: 'object' }
    ],
    defaultOutputs: [
      { id: 'out', name: '结果', type: 'output', dataType: 'object' }
    ],
    defaultParameters: [
      { id: 'sheetId', name: '表格ID', type: 'string', value: '' },
      { id: 'range', name: '范围', type: 'string', value: 'A1' }
    ],
    defaultConfig: {}
  },
  {
    type: 'action',
    subtype: 'http_request',
    name: 'HTTP 请求',
    icon: '🌐',
    description: '发送 HTTP 请求',
    defaultInputs: [
      { id: 'in', name: '输入', type: 'input', dataType: 'object' }
    ],
    defaultOutputs: [
      { id: 'out', name: '响应', type: 'output', dataType: 'object' }
    ],
    defaultParameters: [
      { id: 'url', name: 'URL', type: 'string', value: '' },
      { id: 'method', name: '方法', type: 'select', value: 'GET' },
      { id: 'headers', name: '请求头', type: 'json', value: '{}' }
    ],
    defaultConfig: {}
  },
  {
    type: 'action',
    subtype: 'slack_message',
    name: 'Slack 消息',
    icon: '💬',
    description: '发送 Slack 消息',
    defaultInputs: [
      { id: 'in', name: '输入', type: 'input', dataType: 'object' }
    ],
    defaultOutputs: [
      { id: 'out', name: '结果', type: 'output', dataType: 'object' }
    ],
    defaultParameters: [
      { id: 'channel', name: '频道', type: 'string', value: '' },
      { id: 'message', name: '消息', type: 'text', value: '' }
    ],
    defaultConfig: {}
  },
  {
    type: 'action',
    subtype: 'transform',
    name: '数据转换',
    icon: '🔄',
    description: '转换和处理数据',
    defaultInputs: [
      { id: 'in', name: '输入', type: 'input', dataType: 'object' }
    ],
    defaultOutputs: [
      { id: 'out', name: '输出', type: 'output', dataType: 'object' }
    ],
    defaultParameters: [
      { id: 'expression', name: '转换表达式', type: 'code', value: 'return input;' }
    ],
    defaultConfig: {}
  },
  {
    type: 'condition',
    subtype: 'if_else',
    name: '条件分支',
    icon: '🔀',
    description: '根据条件选择分支',
    defaultInputs: [
      { id: 'in', name: '输入', type: 'input', dataType: 'object' }
    ],
    defaultOutputs: [
      { id: 'true', name: '满足', type: 'output', dataType: 'object' },
      { id: 'false', name: '不满足', type: 'output', dataType: 'object' }
    ],
    defaultParameters: [
      { id: 'field', name: '字段路径', type: 'string', value: '' },
      { id: 'operator', name: '运算符', type: 'select', value: '==' },
      { id: 'value', name: '比较值', type: 'string', value: '' }
    ],
    defaultConfig: {
      conditions: [
        { id: 'true', label: '满足条件' },
        { id: 'false', label: '不满足条件' }
      ]
    }
  }
];
