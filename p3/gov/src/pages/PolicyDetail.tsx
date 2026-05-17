import { useEffect, useState } from 'react';
import { Button, Card, Tag, Divider } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { policyApi } from '../api';


const PolicyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPolicyDetail();
    }
  }, [id]);

  const fetchPolicyDetail = async () => {
    setLoading(true);
    try {
      const data = await policyApi.getPolicyById(id!);
      setPolicy(data);
    } catch (error) {
      console.error('Failed to fetch policy detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !policy) {
    return <div className="page-container">加载中...</div>;
  }

  return (
    <div className="page-container">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/policies')}
        style={{ marginBottom: 24 }}
      >
        返回列表
      </Button>

      <Card className="policy-detail">
        <h1 style={{ textAlign: 'center', marginBottom: 24 }}>{policy.title}</h1>

        <div className="policy-meta">
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            <Tag color="blue">{policy.department}</Tag>
            <Tag color="green">{policy.publishDate}</Tag>
            {policy.documentNumber && <Tag color="orange">{policy.documentNumber}</Tag>}
          </div>
        </div>

        <Divider />

        <div
          className="policy-content"
          dangerouslySetInnerHTML={{ __html: policy.content }}
        />

        {policy.attachments && policy.attachments.length > 0 && (
          <>
            <Divider />
            <div className="attachment-list">
              <h3 style={{ marginBottom: 16 }}>附件下载</h3>
              {policy.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: '#fafafa',
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                >
                  <span>{attachment.name}</span>
                  <div>
                    <span style={{ color: '#999', marginRight: 16, fontSize: 12 }}>
                      {attachment.type} {attachment.size}
                    </span>
                    <Button
                      type="link"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => alert('下载功能：' + attachment.name)}
                    >
                      下载
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default PolicyDetail;
