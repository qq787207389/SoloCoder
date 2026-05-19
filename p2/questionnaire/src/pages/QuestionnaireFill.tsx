import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input, Radio, Checkbox, message, Space, Result, Alert } from 'antd';
import type { Questionnaire, SubmissionAnswer } from '../types';
import dayjs from 'dayjs';

const { TextArea } = Input;

export const QuestionnaireFill = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    fetchQuestionnaire();
    checkSubmission();
  }, [id]);

  const fetchQuestionnaire = async () => {
    try {
      const res = await fetch(`/api/questionnaires/${id}`);
      const data = await res.json();
      setQuestionnaire(data);

      if (data.deadline && dayjs().isAfter(dayjs(data.deadline))) {
        setIsExpired(true);
      }
    } catch (error) {
      message.error('获取问卷失败');
    }
  };

  const checkSubmission = () => {
    const submittedIds = JSON.parse(localStorage.getItem('submitted_questionnaires') || '[]');
    if (submittedIds.includes(id)) {
      setSubmitted(true);
    }
  };

  const handleSingleChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleMultipleChange = (questionId: string, values: string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: values }));
  };

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const validateRequired = (): boolean => {
    if (!questionnaire) return false;

    for (const question of questionnaire.questions) {
      if (question.required) {
        const answer = answers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0) || answer === '') {
          message.error(`请回答第 ${question.order + 1} 题：${question.title}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateRequired()) return;

    setLoading(true);
    try {
      const submissionAnswers: SubmissionAnswer[] = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }));

      await fetch(`/api/questionnaires/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionAnswers),
      });

      const submittedIds = JSON.parse(localStorage.getItem('submitted_questionnaires') || '[]');
      submittedIds.push(id);
      localStorage.setItem('submitted_questionnaires', JSON.stringify(submittedIds));

      setSubmitted(true);
      message.success('提交成功');
    } catch (error) {
      message.error('提交失败');
    } finally {
      setLoading(false);
    }
  };

  if (!questionnaire) {
    return <div style={{ padding: 24, textAlign: 'center' }}>加载中...</div>;
  }

  if (isExpired) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: 600, margin: '0 auto' }}>
        <Result
          status="warning"
          title="问卷已截止"
          subTitle="该问卷已超过提交截止时间，无法继续填写。"
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              返回首页
            </Button>
          }
        />
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: 600, margin: '0 auto' }}>
        <Result
          status="success"
          title="提交成功"
          subTitle="感谢您的参与，您的回答已成功提交。"
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              返回首页
            </Button>
          }
        />
      </div>
    );
  }

  const sortedQuestions = [...questionnaire.questions].sort((a, b) => a.order - b.order);

  return (
    <div style={{ padding: '24px', maxWidth: 700, margin: '0 auto' }}>
      <Card
        title={questionnaire.title}
        extra={
          questionnaire.deadline && (
            <Alert
              message={`截止时间：${dayjs(questionnaire.deadline).format('YYYY-MM-DD HH:mm')}`}
              type="info"
              showIcon
              size="small"
            />
          )
        }
        style={{ marginBottom: 24 }}
      >
        {questionnaire.description && (
          <p style={{ color: '#666', marginBottom: 0 }}>{questionnaire.description}</p>
        )}
      </Card>

      <Space orientation="vertical" style={{ width: '100%' }} size="middle">
        {sortedQuestions.map((question) => (
          <Card key={question.id} size="small">
            <div style={{ marginBottom: 12, fontWeight: 500 }}>
              <span>{question.order + 1}. </span>
              {question.title}
              {question.required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}
            </div>

            {question.type === 'single' && (
              <Radio.Group
                value={answers[question.id] || ''}
                onChange={(e) => handleSingleChange(question.id, e.target.value)}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {question.options?.map((option) => (
                    <Radio key={option.id} value={option.id}>
                      {option.text}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            )}

            {question.type === 'multiple' && (
              <Checkbox.Group
                value={(answers[question.id] as string[]) || []}
                onChange={(values) => handleMultipleChange(question.id, values as string[])}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {question.options?.map((option) => (
                    <Checkbox key={option.id} value={option.id}>
                      {option.text}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            )}

            {question.type === 'text' && (
              <TextArea
                placeholder="请输入您的回答"
                value={(answers[question.id] as string) || ''}
                onChange={(e) => handleTextChange(question.id, e.target.value)}
                rows={3}
              />
            )}
          </Card>
        ))}
      </Space>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button type="primary" size="large" onClick={handleSubmit} loading={loading}>
          提交问卷
        </Button>
      </div>
    </div>
  );
};
