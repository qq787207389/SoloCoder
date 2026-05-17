import { useEffect, useState } from 'react';
import { Tabs, List, Card, Avatar, Tag, Empty, Button, Form, Input, message } from 'antd';
import { UserOutlined, FileTextOutlined, MessageOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { applicationApi, consultationApi } from '../api';

const { TabPane } = Tabs;

const UserCenter = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, updateUser } = useAuthStore();
  const [applications, setApplications] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isLoggedIn, navigate]);

  const fetchData = async () => {
    try {
      const [appsData, consultsData] = await Promise.all([
        applicationApi.getUserApplications(),
        consultationApi.getUserConsultations(),
      ]);
      setApplications(appsData);
      setConsultations(consultsData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const handleUpdateProfile = async (values: any) => {
    try {
      updateUser(values);
      message.success('信息更新成功！');
    } catch (error) {
      message.error('更新失败，请重试');
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

  const typeTexts: Record<string, string> = {
    consult: '咨询',
    complaint: '投诉',
    suggestion: '建议',
  };

  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">个人中心</h1>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, padding: 24, background: '#fafafa', borderRadius: 8 }}>
        <Avatar size={64} icon={<UserOutlined />} style={{ marginRight: 24 }} />
        <div>
          <h2 style={{ margin: 0 }}>{user.username}</h2>
          <p style={{ margin: '8px 0 0', color: '#666' }}>联系电话：{user.phone}</p>
        </div>
      </div>

      <Tabs defaultActiveKey="applications" className="user-tabs">
        <TabPane tab={<span><FileTextOutlined />我的办件</span>} key="applications">
          <Card>
            {applications.length > 0 ? (
              <List
                dataSource={applications}
                renderItem={(item) => (
                  <List.Item
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/progress?id=${item.id}`)}
                  >
                    <List.Item.Meta
                      title={
                        <span>
                          {item.serviceName}
                          <Tag color={statusColors[item.status]} style={{ marginLeft: 12 }}>
                            {statusTexts[item.status]}
                          </Tag>
                        </span>
                      }
                      description={
                        <div>
                          <span>受理编号：{item.id}</span>
                          <span style={{ marginLeft: 24 }}>申请时间：{item.applyDate}</span>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无办件记录" />
            )}
          </Card>
        </TabPane>

        <TabPane tab={<span><MessageOutlined />我的咨询</span>} key="consultations">
          <Card>
            {consultations.length > 0 ? (
              <List
                dataSource={consultations}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <span>
                          <Tag color={item.status === 'replied' ? 'green' : 'orange'}>
                            {item.status === 'replied' ? '已回复' : '处理中'}
                          </Tag>
                          <Tag>{typeTexts[item.type]}</Tag>
                          {item.title}
                        </span>
                      }
                      description={
                        <div>
                          <p style={{ margin: '4px 0' }}>{item.content}</p>
                          <p style={{ margin: 0, color: '#999', fontSize: 12 }}>
                            提交时间：{item.createDate}
                          </p>
                          {item.reply && (
                            <div style={{ marginTop: 12, padding: 12, background: '#f6ffed', borderRadius: 4 }}>
                              <p style={{ margin: '0 0 4px', color: '#52c41a', fontWeight: 500 }}>
                                官方回复 ({item.replyDate})
                              </p>
                              <p style={{ margin: 0 }}>{item.reply}</p>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无咨询记录" />
            )}
          </Card>
        </TabPane>

        <TabPane tab={<span><SettingOutlined />个人信息</span>} key="profile">
          <Card title="修改个人信息">
            <Form
              form={form}
              layout="vertical"
              initialValues={user}
              onFinish={handleUpdateProfile}
              style={{ maxWidth: 500 }}
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="phone"
                label="联系电话"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="email"
                label="电子邮箱"
                rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default UserCenter;
