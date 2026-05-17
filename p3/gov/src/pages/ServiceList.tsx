import { useEffect, useState } from 'react';
import { List, Select, Input, Row, Col, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { serviceApi } from '../api';


const { Option } = Select;

const ServiceList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    theme: '',
    keyword: searchParams.get('keyword') || '',
  });

  const departments = [
    '人力资源和社会保障局',
    '公安局',
    '市场监督管理局',
    '自然资源和规划局',
    '医疗保障局',
    '住房公积金管理中心',
    '教育局',
    '民政局',
  ];

  const themes = ['社保', '户政', '企业', '不动产', '医保', '公积金', '教育', '民政'];

  useEffect(() => {
    fetchServices();
  }, [filters]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await serviceApi.getGuides(filters);
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchServices();
  };

  const handleReset = () => {
    setFilters({ department: '', theme: '', keyword: '' });
  };

  return (
    <div className="page-container">
      <h1 className="page-title">办事指南</h1>

      <div className="filter-section">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="选择部门"
              style={{ width: '100%' }}
              value={filters.department || undefined}
              onChange={(value) => setFilters({ ...filters, department: value })}
              allowClear
            >
              {departments.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="选择主题"
              style={{ width: '100%' }}
              value={filters.theme || undefined}
              onChange={(value) => setFilters({ ...filters, theme: value })}
              allowClear
            >
              {themes.map((theme) => (
                <Option key={theme} value={theme}>
                  {theme}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={18} md={8}>
            <Input
              placeholder="搜索服务事项"
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Button type="primary" onClick={handleSearch} style={{ marginRight: 8 }}>
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Col>
        </Row>
      </div>

      <List
        className="service-list"
        loading={loading}
        dataSource={services}
        renderItem={(item) => (
          <List.Item
            onClick={() => navigate(`/services/${item.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <List.Item.Meta
              title={
                <span>
                  <span className="service-tag">{item.theme}</span>
                  {item.name}
                </span>
              }
              description={
                <div>
                  <p style={{ margin: 0 }}>{item.description}</p>
                  <p style={{ margin: '8px 0 0', color: '#666', fontSize: 12 }}>
                    办理部门：{item.department} | 办理时限：{item.timeLimit} | 所需材料：
                    {item.materialCount}件
                  </p>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default ServiceList;
