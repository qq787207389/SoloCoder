import { Card, Row, Col, Typography, Button, Space, InputNumber, message } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Category } from '@/types';
import { useState } from 'react';

const { Title, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const categories = useAppStore(state => state.categories);
  const setSelectedCategory = useAppStore(state => state.setSelectedCategory);
  const setSelectedWeight = useAppStore(state => state.setSelectedWeight);
  const [weights, setWeights] = useState<Record<string, number>>({});

  const handleSelectCategory = (category: Category) => {
    const weight = weights[category.id] || 1;
    setSelectedCategory(category);
    setSelectedWeight(weight);
    navigate('/user/order-create');
    message.success(`已选择 ${category.name}，预估 ${weight} 公斤`);
  };

  const handleWeightChange = (categoryId: string, value: number | null) => {
    setWeights(prev => ({
      ...prev,
      [categoryId]: value || 1
    }));
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
          选择回收品类
        </Title>
        <Text type="secondary">选择您要回收的物品类型，填写预估重量</Text>
      </div>

      <Row gutter={[16, 16]}>
        {categories.map(category => (
          <Col xs={24} sm={12} md={8} key={category.id}>
            <Card
              hoverable
              style={{ borderRadius: 12 }}
              bodyStyle={{ padding: 20 }}
              onClick={() => handleSelectCategory(category)}
              actions={[
                <Space key="action" style={{ width: '100%', justifyContent: 'center' }}>
                  <span>预估重量:</span>
                  <InputNumber
                    min={0.5}
                    max={1000}
                    step={0.5}
                    value={weights[category.id] || 1}
                    onChange={(v) => handleWeightChange(category.id, v)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: 100 }}
                  />
                  <span>公斤</span>
                </Space>
              ]}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>
                  {category.icon}
                </div>
                <Title level={4} style={{ margin: '0 0 8px 0' }}>
                  {category.name}
                </Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  {category.description}
                </Text>
                <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                  {category.price} {category.unit}
                </Text>
              </div>
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Button type="primary" icon={<ArrowRightOutlined />}>
                  立即预约
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;
