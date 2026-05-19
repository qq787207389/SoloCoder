import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Statistic,
  Row,
  Col,
  DatePicker,
  QRCode,
  Modal,
  message,
  Tabs,
  List,
} from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, QrcodeOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import type { Questionnaire, QuestionnaireStats as QuestionnaireStatsType } from '../types';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

export const QuestionnaireStats = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [stats, setStats] = useState<QuestionnaireStatsType | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    fetchQuestionnaire();
    fetchStats();
  }, [id, dateRange]);

  const fetchQuestionnaire = async () => {
    try {
      const res = await fetch(`/api/questionnaires/${id}`);
      const data = await res.json();
      setQuestionnaire(data);
    } catch (error) {
      message.error('获取问卷信息失败');
    }
  };

  const fetchStats = async () => {
    try {
      let url = `/api/questionnaires/${id}/stats`;
      if (dateRange && dateRange[0] && dateRange[1]) {
        url += `?startDate=${dateRange[0].toISOString()}&endDate=${dateRange[1].toISOString()}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      message.error('获取统计数据失败');
    }
  };

  const exportCSV = () => {
    if (!questionnaire || !stats) return;

    const headers = ['提交时间'];
    questionnaire.questions.forEach((q) => headers.push(q.title));

    const rows: string[][] = [];
    for (let i = 0; i < stats.totalSubmissions; i++) {
      const row: string[] = [dayjs().format('YYYY-MM-DD HH:mm:ss')];
      questionnaire.questions.forEach((q) => {
        if (q.type === 'text') {
          const textAnswers = stats.questionStats.find((s) => s.questionId === q.id)?.textAnswers || [];
          row.push(textAnswers[i] || '');
        } else {
          row.push('');
        }
      });
      rows.push(row);
    }

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${questionnaire.title}_统计数据.csv`;
    link.click();
    message.success('导出成功');
  };

  const getChartOption = (questionId: string) => {
    if (!questionnaire || !stats) return {};

    const question = questionnaire.questions.find((q) => q.id === questionId);
    const questionStat = stats.questionStats.find((s) => s.questionId === questionId);

    if (!question || !questionStat || question.type === 'text') return {};

    const optionNames = question.options?.map((o) => o.text) || [];
    const optionValues = question.options?.map((o) => questionStat.optionCounts?.[o.id] || 0) || [];

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: '选择人数',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}: {c}人',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          data: optionNames.map((name, index) => ({
            value: optionValues[index],
            name,
          })),
        },
      ],
    };
  };

  const getBarChartOption = (questionId: string) => {
    if (!questionnaire || !stats) return {};

    const question = questionnaire.questions.find((q) => q.id === questionId);
    const questionStat = stats.questionStats.find((s) => s.questionId === questionId);

    if (!question || !questionStat || question.type === 'text') return {};

    const optionNames = question.options?.map((o) => o.text) || [];
    const optionValues = question.options?.map((o) => questionStat.optionCounts?.[o.id] || 0) || [];

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: optionNames,
        axisLabel: {
          rotate: 30,
        },
      },
      yAxis: {
        type: 'value',
        name: '人数',
      },
      series: [
        {
          name: '选择人数',
          type: 'bar',
          data: optionValues,
          itemStyle: {
            color: '#1890ff',
          },
        },
      ],
    };
  };

  if (!questionnaire || !stats) {
    return <div style={{ padding: 24, textAlign: 'center' }}>加载中...</div>;
  }

  const sortedQuestions = [...questionnaire.questions].sort((a, b) => a.order - b.order);
  const fillUrl = `${window.location.origin}/fill/${id}`;

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Space style={{ marginBottom: 24, width: '100%', justifyContent: 'space-between' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
          返回
        </Button>
        <Space>
          <Button icon={<QrcodeOutlined />} onClick={() => setQrModalVisible(true)}>
            填写二维码
          </Button>
          <Button icon={<DownloadOutlined />} onClick={exportCSV}>
            导出CSV
          </Button>
        </Space>
      </Space>

      <Card title={questionnaire.title} style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Statistic title="总填写数" value={stats.totalSubmissions} suffix="人" />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic title="题目数" value={questionnaire.questions.length} suffix="题" />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="问卷状态"
              value={questionnaire.status === 'published' ? '收集中' : questionnaire.status === 'closed' ? '已截止' : '草稿'}
              valueStyle={{ color: questionnaire.status === 'published' ? '#3f8600' : '#cf1322' }}
            />
          </Col>
        </Row>
        <div style={{ marginTop: 16 }}>
          <RangePicker
            showTime
            placeholder={['开始时间', '结束时间']}
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            style={{ width: '100%' }}
          />
        </div>
      </Card>

      <Tabs
        items={sortedQuestions.map((question, index) => ({
          key: question.id,
          label: `第${index + 1}题：${question.title.slice(0, 15)}${question.title.length > 15 ? '...' : ''}`,
          children: (
            <Card>
              <h4 style={{ marginBottom: 16 }}>
                {index + 1}. {question.title}
                <span style={{ color: '#999', fontSize: 14, marginLeft: 8 }}>
                  ({question.type === 'single' ? '单选题' : question.type === 'multiple' ? '多选题' : '简答题'})
                </span>
              </h4>

              {question.type !== 'text' && (
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title="饼图" size="small">
                      <ReactECharts
                        ref={chartRef}
                        option={getChartOption(question.id)}
                        style={{ height: 350 }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="柱状图" size="small">
                      <ReactECharts
                        option={getBarChartOption(question.id)}
                        style={{ height: 350 }}
                      />
                    </Card>
                  </Col>
                </Row>
              )}

              {question.type === 'text' && (
                <Card title="回答列表" size="small">
                  <List
                    dataSource={
                      stats.questionStats.find((s) => s.questionId === question.id)?.textAnswers || []
                    }
                    locale={{ emptyText: '暂无回答' }}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta description={item} />
                      </List.Item>
                    )}
                  />
                </Card>
              )}
            </Card>
          ),
        }))}
      />

      <Modal
        title="问卷填写二维码"
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setQrModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        <div style={{ textAlign: 'center', padding: 24 }}>
          <QRCode value={fillUrl} size={256} />
          <p style={{ marginTop: 16, color: '#666' }}>
            或访问链接：<a href={fillUrl} target="_blank" rel="noopener noreferrer">{fillUrl}</a>
          </p>
        </div>
      </Modal>
    </div>
  );
};
