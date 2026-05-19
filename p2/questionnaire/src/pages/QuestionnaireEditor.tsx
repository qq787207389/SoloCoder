import { useEffect, useCallback } from 'react';
import { Button, Card, Input, Space, message, DatePicker, FloatButton } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, SaveOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useQuestionnaireStore } from '../store/questionnaireStore';
import { SortableQuestionEditor } from '../components/SortableQuestionEditor';
import dayjs, { Dayjs } from 'dayjs';

const { TextArea } = Input;

export const QuestionnaireEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    currentQuestionnaire,
    setCurrentQuestionnaire,
    createNewQuestionnaire,
    addQuestion,
    updateQuestionnaireInfo,
    reorderQuestions,
    saveDraft,
    loadDraft,
  } = useQuestionnaireStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id === 'new') {
      const draftStr = localStorage.getItem('questionnaire_draft');
      if (draftStr) {
        loadDraft();
      } else {
        createNewQuestionnaire();
      }
    } else {
      fetchQuestionnaire();
    }

    const interval = setInterval(() => {
      if (currentQuestionnaire) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentQuestionnaire) {
        saveDraft();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentQuestionnaire]);

  const fetchQuestionnaire = async () => {
    try {
      const res = await fetch(`/api/questionnaires/${id}`);
      const data = await res.json();
      setCurrentQuestionnaire(data);
    } catch (error) {
      message.error('获取问卷信息失败');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const questions = currentQuestionnaire?.questions || [];
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderQuestions(oldIndex, newIndex);
      }
    }
  };

  const handleSave = async () => {
    if (!currentQuestionnaire) return;

    try {
      const method = id === 'new' ? 'POST' : 'PUT';
      const url = id === 'new' ? '/api/questionnaires' : `/api/questionnaires/${id}`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentQuestionnaire),
      });
      const data = await res.json();
      localStorage.removeItem('questionnaire_draft');
      message.success('保存成功');
      navigate('/');
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handlePublish = async () => {
    if (!currentQuestionnaire) return;
    if (!currentQuestionnaire.title) {
      message.error('请输入问卷标题');
      return;
    }
    if (currentQuestionnaire.questions.length === 0) {
      message.error('请至少添加一个题目');
      return;
    }

    try {
      const method = id === 'new' ? 'POST' : 'PUT';
      const url = id === 'new' ? '/api/questionnaires' : `/api/questionnaires/${id}`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentQuestionnaire, status: 'published' }),
      });
      const data = await res.json();
      localStorage.removeItem('questionnaire_draft');
      message.success('发布成功');
      navigate('/');
    } catch (error) {
      message.error('发布失败');
    }
  };

  const handleDeadlineChange = (date: Dayjs | null) => {
    updateQuestionnaireInfo({ deadline: date?.toISOString() });
  };

  const sortedQuestions = currentQuestionnaire?.questions
    ? [...currentQuestionnaire.questions].sort((a, b) => a.order - b.order)
    : [];

  return (
    <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      <Space style={{ marginBottom: 24, width: '100%', justifyContent: 'space-between' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
          返回
        </Button>
        <Space>
          <Button icon={<SaveOutlined />} onClick={handleSave}>
            保存草稿
          </Button>
          <Button type="primary" icon={<ShareAltOutlined />} onClick={handlePublish}>
            发布问卷
          </Button>
        </Space>
      </Space>

      <Card title="问卷基本信息" style={{ marginBottom: 24 }}>
        <Space orientation="vertical" style={{ width: '100%' }} size="middle">
          <Input
            placeholder="问卷标题"
            value={currentQuestionnaire?.title || ''}
            onChange={(e) => updateQuestionnaireInfo({ title: e.target.value })}
            size="large"
          />
          <TextArea
            placeholder="问卷描述（可选）"
            value={currentQuestionnaire?.description || ''}
            onChange={(e) => updateQuestionnaireInfo({ description: e.target.value })}
            rows={3}
          />
          <DatePicker
            showTime
            placeholder="设置截止时间（可选）"
            value={currentQuestionnaire?.deadline ? dayjs(currentQuestionnaire.deadline) : null}
            onChange={handleDeadlineChange}
            style={{ width: '100%' }}
            minDate={dayjs()}
          />
        </Space>
      </Card>

      <Card
        title="题目编辑"
        extra={
          <Space>
            <Button type="dashed" icon={<PlusOutlined />} onClick={() => addQuestion('single')}>
              单选题
            </Button>
            <Button type="dashed" icon={<PlusOutlined />} onClick={() => addQuestion('multiple')}>
              多选题
            </Button>
            <Button type="dashed" icon={<PlusOutlined />} onClick={() => addQuestion('text')}>
              简答题
            </Button>
          </Space>
        }
      >
        {sortedQuestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            <p>暂无题目，点击上方按钮添加</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedQuestions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedQuestions.map((question, index) => (
                <SortableQuestionEditor
                  key={question.id}
                  question={question}
                  index={index}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </Card>

      <FloatButton.BackTop />
    </div>
  );
};
