import { useEffect, useState } from 'react';
import { Button, Card, Space, Tag, Modal, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, BarChartOutlined, DeleteOutlined, CopyOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Questionnaire } from '../types';
import dayjs from 'dayjs';

const { confirm } = Modal;

const statusColors: Record<string, string> = {
  draft: 'default',
  published: 'green',
  closed: 'red',
};

const statusLabels: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  closed: '已截止',
};

export const QuestionnaireList = () => {
  const navigate = useNavigate();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [templates, setTemplates] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuestionnaires();
    fetchTemplates();
  }, []);

  const fetchQuestionnaires = async () => {
    try {
      const res = await fetch('/api/questionnaires');
      const data = await res.json();
      setQuestionnaires(data);
    } catch (error) {
      message.error('获取问卷列表失败');
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      setTemplates(data);
    } catch (error) {
      message.error('获取模板列表失败');
    }
  };

  const handleCreate = () => {
    navigate('/editor/new');
  };

  const handleUseTemplate = async (template: Questionnaire) => {
    setLoading(true);
    try {
      const copyRes = await fetch(`/api/questionnaires/${template.id}/copy`, {
        method: 'POST',
      });
      const newQn = await copyRes.json();
      navigate(`/editor/${newQn.id}`);
      message.success('使用模板成功');
    } catch (error) {
      message.error('使用模板失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/editor/${id}`);
  };

  const handleStats = (id: string) => {
    navigate(`/stats/${id}`);
  };

  const handleCopy = async (id: string) => {
    setLoading(true);
    try {
      await fetch(`/api/questionnaires/${id}/copy`, {
        method: 'POST',
      });
      fetchQuestionnaires();
      message.success('复制成功');
    } catch (error) {
      message.error('复制失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: '确认删除',
      content: '删除后无法恢复，确认要删除该问卷吗？',
      onOk: async () => {
        try {
          await fetch(`/api/questionnaires/${id}`, {
            method: 'DELETE',
          });
          fetchQuestionnaires();
          message.success('删除成功');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>问券星</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="large">
          创建问卷
        </Button>
      </div>

      <Card title="问卷模板" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {templates.map((template) => (
            <Col xs={24} sm={12} md={8} key={template.id}>
              <Card
                hoverable
                size="small"
                title={template.templateName}
                actions={[
                  <Button type="link" onClick={() => handleUseTemplate(template)} loading={loading}>
                    使用模板
                  </Button>,
                ]}
              >
                <p style={{ color: '#666', fontSize: 14, marginBottom: 0 }}>{template.title}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="我的问卷">
        <Space orientation="vertical" style={{ width: '100%' }} size="middle">
          {questionnaires.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              <FileTextOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <p>暂无问卷，点击上方按钮创建</p>
            </div>
          ) : (
            questionnaires.map((qn) => (
              <Card
                key={qn.id}
                size="small"
                extra={
                  <Space>
                    <Tag color={statusColors[qn.status]}>{statusLabels[qn.status]}</Tag>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(qn.id)}
                    >
                      编辑
                    </Button>
                    <Button
                      type="text"
                      icon={<BarChartOutlined />}
                      onClick={() => handleStats(qn.id)}
                      disabled={qn.status === 'draft'}
                    >
                      统计
                    </Button>
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopy(qn.id)}
                      loading={loading}
                    >
                      复制
                    </Button>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(qn.id)}
                    >
                      删除
                    </Button>
                  </Space>
                }
              >
                <Card.Meta
                  title={qn.title}
                  description={
                    <div>
                      <p style={{ margin: '4px 0', color: '#666' }}>
                        {qn.description || '暂无描述'}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
                        创建于 {dayjs(qn.createdAt).format('YYYY-MM-DD HH:mm')}
                        {qn.deadline && ` · 截止 ${dayjs(qn.deadline).format('YYYY-MM-DD')}`}
                      </p>
                    </div>
                  }
                />
              </Card>
            ))
          )}
        </Space>
      </Card>
    </div>
  );
};
