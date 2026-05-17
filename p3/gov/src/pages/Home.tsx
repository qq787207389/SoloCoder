import { useEffect, useState } from 'react';
import { Carousel } from 'antd';
import {
  UserOutlined,
  IdcardOutlined,
  BuildOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  WalletOutlined,
  GlobalOutlined,
  CarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { commonApi } from '../api';


const iconMap: Record<string, React.ReactNode> = {
  UserOutlined: <UserOutlined />,
  IdcardOutlined: <IdcardOutlined />,
  BuildOutlined: <BuildOutlined />,
  HomeOutlined: <HomeOutlined />,
  MedicineBoxOutlined: <MedicineBoxOutlined />,
  WalletOutlined: <WalletOutlined />,
  GlobalOutlined: <GlobalOutlined />,
  CarOutlined: <CarOutlined />,
};

const Home = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<any[]>([]);
  const [quickServices, setQuickServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannerData, serviceData] = await Promise.all([
          commonApi.getBanners(),
          commonApi.getQuickServices(),
        ]);
        setBanners(bannerData);
        setQuickServices(serviceData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const notices = [
    { id: 1, title: '关于2024年国庆节放假安排的通知', date: '2024-09-20' },
    { id: 2, title: '政务服务大厅作息时间调整通知', date: '2024-09-15' },
    { id: 3, title: '关于暂停办理社保业务的通知', date: '2024-09-10' },
    { id: 4, title: '政务服务"好差评"制度实施通知', date: '2024-09-01' },
  ];

  const hotServices = [
    { id: 1, name: '社会保险查询', department: '人力资源和社会保障局' },
    { id: 2, name: '身份证办理', department: '公安局' },
    { id: 3, name: '企业注册登记', department: '市场监督管理局' },
    { id: 4, name: '不动产登记', department: '自然资源和规划局' },
  ];

  return (
    <div>
      <div className="banner-carousel">
        <Carousel autoplay effect="fade">
          {banners.map((banner) => (
            <div key={banner.id}>
              <img src={banner.image} alt={banner.title} />
            </div>
          ))}
        </Carousel>
      </div>

      <div className="quick-services">
        <h2>常用服务</h2>
        <div className="service-grid">
          {quickServices.map((service) => (
            <div
              key={service.id}
              className="service-card"
              onClick={() => navigate(service.link)}
            >
              {iconMap[service.icon] || <UserOutlined />}
              <span>{service.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-row">
        <div className="section-card">
          <h2>
            通知公告
            <a href="#!" onClick={(e) => { e.preventDefault(); navigate('/policies'); }}>更多 &gt;</a>
          </h2>
          <ul className="notice-list">
            {notices.map((notice) => (
              <li key={notice.id}>
                <a href="#!" onClick={(e) => e.preventDefault()}>{notice.title}</a>
                <span className="date">{notice.date}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="section-card">
          <h2>
            热门服务
            <a href="#!" onClick={(e) => { e.preventDefault(); navigate('/services'); }}>更多 &gt;</a>
          </h2>
          <ul className="notice-list">
            {hotServices.map((service) => (
              <li key={service.id}>
                <a href="#!" onClick={(e) => { e.preventDefault(); navigate(`/services/${service.id}`); }}>
                  {service.name}
                </a>
                <span className="date" style={{ fontSize: 12 }}>{service.department}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
