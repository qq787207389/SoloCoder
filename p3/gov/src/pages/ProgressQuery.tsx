import { useState, useEffect } from 'react';
import { Input, Button, Timeline, Alert, Card, message } from 'antd';
import { SearchOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { applicationApi } from '../api';

const ProgressQuery = () => {
  const [searchParams] = useSearchParams();
  const [applicationId, setApplicationId] = useState(searchParams.get('id') || '');
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (applicationId) {
      handleQuery();
    }
  }, []);

  const handleQuery = async () => {
    if (!applicationId.trim()) {
      message.error('请输入受理编号');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const data = await applicationApi.getApplicationById(applicationId);
      setApplication(data);
    } catch (error) {
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    submitted: 'blue',
    reviewing: 'orange',
    correction: 'red',
    completed: 'green',
  };

  const statusTexts: Record<string, string> = {
    submitted: '已提交',
    reviewing: '审核中',
    correction: '需补正',
    completed: '已办结',
  };

  return (
    <div className="page-container">
      <h1 className="page-title">办件进度查询</h1>

      <div className="progress-query">
        <Input
          placeholder="请输入受理编号"
          size="large"
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
          onPressEnter={handleQuery}
          prefix={<SearchOutlined />}
          style={{ maxWidth: 400, marginRight: 16 }}
        />
        <Button type="primary" size="large" onClick={handleQuery} loading={loading}>
          查询
        </Button>
      </div>

      {searched && !loading && (
        <>
          {application ? (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <Card title="申请基本信息" style={{ marginBottom: 24 }}>
                <p>
                  <strong>受理编号：</strong>
                  {application.id}
                </p>
                <p>
                  <strong>申请事项：</strong>
                  {application.serviceName}
                </p>
                <p>
                  <strong>申请人：</strong>
                  {application.applicantName}
                </p>
                <p>
                  <strong>联系电话：</strong>
                  {application.applicantPhone}
                </p>
                <p>
                  <strong>申请时间：</strong>
                  {application.applyDate}
                </p>
                <p>
                  <strong>当前状态：</strong>
                  <span style={{ color: statusColors[application.status], fontWeight: 500 }}>
                    {statusTexts[application.status]}
                  </span>
                </p>
              </Card>

              {application.correctionNote && (
                <Alert
                  className="correction-notice"
                  message="需要补充材料"
                  description={application.correctionNote}
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                  style={{ marginBottom: 24 }}
                />
              )}

              <Card title="办理进度">
                <div className="timeline-container">
                  <Timeline>
                    {application.timeline?.map((item: any) => (
                      <Timeline.Item
                        key={item.id}
                        color={statusColors[application.status]}
                        dot={
                          item.status === '已提交' || item.status === '已办结' ? (
                            <CheckCircleOutlined style={{ fontSize: 16 }} />
                          ) : undefined
                        }
                      >
                        <p style={{ marginBottom: 4 }}>
                          <strong>{item.status}</strong>
                          <span style={{ color: '#999', marginLeft: 12, fontSize: 12 }}>
                            {item.time}
                          </span>
                        </p>
                        <p style={{ margin: 0, color: '#666' }}>{item.description}</p>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </div>
              </Card>
            </div>
          ) : (
            <Alert
              message="未找到相关记录"
              description="请检查您输入的受理编号是否正确，如有疑问请拨打咨询热线：12345"
              type="info"
              showIcon
              style={{ maxWidth: 600, margin: '0 auto' }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ProgressQuery;
