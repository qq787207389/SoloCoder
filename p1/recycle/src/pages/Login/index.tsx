import { Card, Button, Space, Typography, Row, Col } from 'antd';
import { UserOutlined, UserSwitchOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { UserRole } from '@/types';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const login = useAppStore(state => state.login);

  const handleLogin = (role: UserRole) => {
    login(role);
    switch (role) {
      case UserRole.COLLECTOR:
        navigate('/collector');
        break;
      case UserRole.ADMIN:
        navigate('/admin');
        break;
      default:
        navigate('/user');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card style={{ width: '100%', maxWidth: 500, borderRadius: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>♻️</div>
          <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
            废品回收平台
          </Title>
          <Text type="secondary">绿色环保，从我做起</Text>
        </div>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Button
              type="primary"
              size="large"
              block
              icon={<UserOutlined />}
              onClick={() => handleLogin(UserRole.USER)}
              style={{
                height: 56,
                fontSize: 16,
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                border: 'none',
                borderRadius: 8
              }}
            >
              用户端登录
            </Button>
          </Col>
          <Col span={24}>
            <Button
              type="primary"
              size="large"
              block
              icon={<UserSwitchOutlined />}
              onClick={() => handleLogin(UserRole.COLLECTOR)}
              style={{
                height: 56,
                fontSize: 16,
                background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                border: 'none',
                borderRadius: 8
              }}
            >
              回收员端登录
            </Button>
          </Col>
          <Col span={24}>
            <Button
              type="primary"
              size="large"
              block
              icon={<SettingOutlined />}
              onClick={() => handleLogin(UserRole.ADMIN)}
              style={{
                height: 56,
                fontSize: 16,
                background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                border: 'none',
                borderRadius: 8
              }}
            >
              管理后台登录
            </Button>
          </Col>
        </Row>

        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Text type="secondary">
            点击任意角色即可模拟登录体验系统功能
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
