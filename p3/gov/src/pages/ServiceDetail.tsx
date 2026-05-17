import { useEffect, useState } from 'react';
import { Button, Checkbox, Steps, Card } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceApi } from '../api';


const { Step } = Steps;

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkedMaterials, setCheckedMaterials] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchServiceDetail();
    }
  }, [id]);

  const fetchServiceDetail = async () => {
    setLoading(true);
    try {
      const data = await serviceApi.getGuideById(id!);
      setService(data);
    } catch (error) {
      console.error('Failed to fetch service detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialChange = (materialId: string) => {
    setCheckedMaterials((prev) =>
      prev.includes(materialId)
        ? prev.filter((m) => m !== materialId)
        : [...prev, materialId]
    );
  };

  if (loading || !service) {
    return <div className="page-container">加载中...</div>;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">{service.name}</h1>

      <div className="detail-section">
        <h3>基本信息</h3>
        <Card size="small">
          <p>
            <strong>办理部门：</strong>
            {service.department}
          </p>
          <p>
            <strong>服务主题：</strong>
            {service.theme}
          </p>
          <p>
            <strong>办理时限：</strong>
            {service.timeLimit}
          </p>
          <p>
            <strong>服务描述：</strong>
            {service.description}
          </p>
        </Card>
      </div>

      <div className="detail-section">
        <h3>办理条件</h3>
        <Card size="small">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {service.conditions.map((condition, index) => (
              <li key={index}>{condition}</li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="detail-section">
        <h3>所需材料清单（可勾选自查）</h3>
        <Card size="small">
          {service.materials.map((material) => (
            <div key={material.id} className="material-check">
              <Checkbox
                checked={checkedMaterials.includes(material.id)}
                onChange={() => handleMaterialChange(material.id)}
              >
                <strong>
                  {material.name}
                  {material.required && <span style={{ color: '#ff4d4f' }}>（必需）</span>}
                </strong>
              </Checkbox>
              <p style={{ margin: '8px 0 0 24px', color: '#666', fontSize: 14 }}>
                {material.description}
              </p>
            </div>
          ))}
        </Card>
      </div>

      <div className="detail-section">
        <h3>办理流程</h3>
        <div className="steps-container">
          <Steps direction="vertical" current={-1}>
            {service.steps.map((step, index) => (
              <Step key={step.id} title={step.title} description={step.description} />
            ))}
          </Steps>
        </div>
      </div>

      <div className="detail-section">
        <h3>办理窗口信息</h3>
        <div className="window-info">
          <p>
            <strong>办理窗口：</strong>
            {service.window}
          </p>
          <p>
            <strong>咨询电话：</strong>
            {service.phone}
          </p>
          <p style={{ margin: 0 }}>
            <strong>工作时间：</strong>
            周一至周五 9:00-17:00（法定节假日除外）
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Button type="primary" size="large" onClick={() => navigate(`/apply/${id}`)}>
          在线办理
        </Button>
        <Button size="large" style={{ marginLeft: 16 }} onClick={() => navigate('/services')}>
          返回列表
        </Button>
      </div>
    </div>
  );
};

export default ServiceDetail;
