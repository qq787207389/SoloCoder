import { Layout, Input, Menu, Dropdown, Avatar } from 'antd';
import { SearchOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';

const { Header, Content, Footer } = Layout;
const { Search } = Input;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuthStore();

  const menuItems = [
    { key: '/', label: '首页', onClick: () => navigate('/') },
    { key: '/services-personal', label: '个人办事', onClick: () => navigate('/services') },
    { key: '/services-legal', label: '法人办事', onClick: () => navigate('/services') },
    { key: '/policies', label: '信息公开', onClick: () => navigate('/policies') },
    { key: '/consultation', label: '互动交流', onClick: () => navigate('/consultation') },
    { key: '/progress', label: '进度查询', onClick: () => navigate('/progress') },
  ];

  const userMenuItems = [
    {
      key: 'center',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/user'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => logout(),
    },
  ];

  const handleSearch = (value: string) => {
    if (value) {
      navigate(`/services?keyword=${encodeURIComponent(value)}`);
    }
  };

  return (
    <Layout className="layout">
      <Header className="header">
        <div className="header-top">
          <div className="logo-section">
            <div className="emblem">国</div>
            <div className="title">
              <h1>智慧政务服务平台</h1>
              <p>让群众办事更便捷 让政务服务更高效</p>
            </div>
          </div>
          <div className="header-right">
            <Search
              className="search-box"
              placeholder="搜索服务事项..."
              enterButton={<SearchOutlined />}
              size="middle"
              onSearch={handleSearch}
            />
            <div className="user-section">
              {isLoggedIn ? (
                <Dropdown menu={{ items: userMenuItems }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <Avatar size="small" icon={<UserOutlined />} />
                    {user?.username}
                  </span>
                </Dropdown>
              ) : (
                <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
                  <UserOutlined /> 登录/注册
                </span>
              )}
            </div>
          </div>
        </div>
        <Menu
          className="nav-menu"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Header>
      <Content className="content">
        <Outlet />
      </Content>
      <Footer className="footer">
        <div className="footer-links">
          <a href="#">网站地图</a>
          <a href="#">关于我们</a>
          <a href="#">使用帮助</a>
          <a href="#">隐私政策</a>
          <a href="#">联系我们</a>
        </div>
        <p>© 2024 智慧政务服务平台 版权所有 | 备案号：京ICP备12345678号</p>
        <p style={{ marginTop: 8, fontSize: 12 }}>
          服务热线：12345 | 工作时间：周一至周五 9:00-17:00
        </p>
      </Footer>
    </Layout>
  );
};

export default AppLayout;
