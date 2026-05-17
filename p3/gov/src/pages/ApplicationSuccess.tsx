import { Button } from 'antd';
import { CheckCircleOutlined, CopyOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const ApplicationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const applicationId = location.state?.applicationId || 'APP' + Date.now();

  const handleCopy = () => {
    navigator.clipboard.writeText(applicationId);
    // 简单提示复制成功
  };

  return (
    <div className="page-container">
      <div className="success-container">
        <CheckCircleOutlined className="success-icon" style={{ color: '#52c41a' }} />
        <h2>申请提交成功！</h2>
        <p style={{ color: '#666', marginBottom: 24 }}>
          您的申请已成功提交，请妥善保存以下受理编号
        </p>

        <div style={{ padding: 24, background: '#f6ffed', borderRadius: 8, marginBottom: 24 }}>
          <p style={{ marginBottom: 8 }}>受理编号：</p>
          <div className="application-number" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <code style={{ fontSize: 20, background: '#fff', padding: '8px 16px', borderRadius: 4 }}>
              {applicationId}
            </code>
            <Button
              icon={<CopyOutlined />}
              onClick={handleCopy}
              size="small"
            >
              复制
            </Button>
          </div>
        </div>

        <div className="qr-code">
          <QRCodeSVG value={applicationId} size={150} />
          <p style={{ marginTop: 12, color: '#999', fontSize: 12 }}>
            扫描二维码可查询办理进度
          </p>
        </div>

        <div style={{ textAlign: 'left', padding: 24, background: '#fafafa', borderRadius: 8 }}>
          <h4 style={{ marginBottom: 16 }}>温馨提示：</h4>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>请牢记您的受理编号，用于查询办理进度</li>
            <li style={{ marginBottom: 8 }}>工作人员将在1-3个工作日内审核您的申请</li>
            <li style={{ marginBottom: 8 }}>如需补充材料，我们将通过短信通知您</li>
            <li>如有疑问，请拨打咨询热线：12345</li>
          </ul>
        </div>

        <div style={{ marginTop: 32 }}>
          <Button type="primary" size="large" onClick={() => navigate(`/progress?id=${applicationId}`)}>
            查询办理进度
          </Button>
          <Button size="large" style={{ marginLeft: 16 }} onClick={() => navigate('/services')}>
            返回服务列表
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccess;
