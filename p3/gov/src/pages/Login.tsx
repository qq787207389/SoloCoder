import { useState } from 'react';
import { Form, Input, Button, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      setTimeout(() => {
        login({
          id: Date.now().toString(),
          username: values.username,
          phone: values.phone || '13800138000',
        });
        message.success('登录成功！');
        navigate('/user');
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('登录失败，请重试');
      setLoading(false);
    }
  };

  const handleRegister = (values: any) => {
    message.success('注册成功，请登录');
    setActiveTab('login');
  };

  return (
    <div className="page-container">
      <div className="login-container">
        <h1 className="login-title">智慧政务服务平台</h1>

        <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
          <Tabs.TabPane tab="登录" key="login">
            <Form name="login" onFinish={handleLogin}>
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名/手机号' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用户名/手机号"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                  登录
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
                <p>测试账号：任意用户名/密码即可登录</p>
              </div>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="注册" key="register">
            <Form name="register" onFinish={handleRegister}>
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用户名"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input
                  prefix={<MobileOutlined />}
                  placeholder="手机号"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6位' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="设置密码（至少6位）"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="确认密码"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block>
                  注册
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
