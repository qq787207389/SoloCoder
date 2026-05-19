import React from 'react';
import { Card, Input, Checkbox, Button, Space, Radio, Flex } from 'antd';
import { DeleteOutlined, PlusOutlined, HolderOutlined } from '@ant-design/icons';
import type { Question } from '../types';
import { useQuestionnaireStore } from '../store/questionnaireStore';

interface QuestionEditorProps {
  question: Question;
  index: number;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, index }) => {
  const { updateQuestion, deleteQuestion, addOption, updateOption, deleteOption } = useQuestionnaireStore();

  return (
    <Card
      size="small"
      style={{ marginBottom: 16 }}
      extra={
        <Space>
          <HolderOutlined style={{ cursor: 'grab', color: '#999' }} />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteQuestion(question.id)}
          />
        </Space>
      }
    >
      <div style={{ marginBottom: 12 }}>
        <Flex gap="small" align="center">
          <span style={{ color: '#999', width: 24 }}>{index + 1}.</span>
          <Input
            placeholder="请输入题目标题"
            value={question.title}
            onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
            style={{ flex: 1 }}
          />
        </Flex>
      </div>

      <div style={{ marginBottom: 12, paddingLeft: 28 }}>
        <Checkbox
          checked={question.required}
          onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
        >
          必填
        </Checkbox>
      </div>

      {(question.type === 'single' || question.type === 'multiple') && (
        <div style={{ paddingLeft: 28 }}>
          <Space orientation="vertical" style={{ width: '100%' }} size="small">
            {question.options?.map((option) => (
              <Flex key={option.id} gap="small" align="center">
                {question.type === 'single' ? (
                  <Radio disabled />
                ) : (
                  <Checkbox disabled />
                )}
                <Input
                  placeholder="选项内容"
                  value={option.text}
                  onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => deleteOption(question.id, option.id)}
                  disabled={question.options && question.options.length <= 1}
                />
              </Flex>
            ))}
            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={() => addOption(question.id)}
            >
              添加选项
            </Button>
          </Space>
        </div>
      )}

      {question.type === 'text' && (
        <div style={{ paddingLeft: 28 }}>
          <Input.TextArea placeholder="用户将在此输入文本答案" disabled rows={2} />
        </div>
      )}
    </Card>
  );
};
