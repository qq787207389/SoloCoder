import { useState, useEffect } from 'react';
import { Steps, Form, Input, DatePicker, Upload, Button, message, Card } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceApi, applicationApi } from '../api';

import type { UploadProps } from 'antd';

const { Step } = Steps;
const { Dragger } = Upload;
const { TextArea } = Input;

const ApplicationForm = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [service, setService] = useState<any | null>(null);
  const [fileList, setFileList] = useState<UploadProps['fileList']>([]);
  const [applicationId, setApplicationId] = useState('');

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetail();
    }
  }, [serviceId]);

  const fetchServiceDetail = async () => {
    try {
      const data = await serviceApi.getGuideById(serviceId!);
      setService(data);
    } catch (error) {
      console.error('Failed to fetch service detail:', error);
    }
  };

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(['name', 'idCard', 'phone', 'address', 'applyDate']);
        setCurrentStep(1);
      } else if (currentStep === 1) {
        setCurrentStep(2);
      }
    } catch {
      message.error('请完善必填信息');
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const result = await applicationApi.createApplication({
        serviceId,
        serviceName: service?.name,
        ...values,
      });
      setApplicationId(result.id);
      message.success('申请提交成功！');
      navigate('/apply/success', { state: { applicationId: result.id } });
    } catch (error) {
      message.error('提交失败，请重试');
    }
  };

  const uploadProps: UploadProps = {
    fileList,
    onChange: ({ fileList: newFileList }) => setFileList(newFileList),
    beforeUpload: () => false,
  };

  if (!service) {
    return <div className="page-container">加载中...</div>;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">在线办理 - {service.name}</h1>

      <div className="form-steps">
        <Steps current={currentStep}>
          <Step title="填写基本信息" />
          <Step title="上传材料" />
          <Step title="确认提交" />
        </Steps>
      </div>

      <div className="form-section">
        <Form form={form} layout="vertical">
          {currentStep === 0 && (
            <Card title="申请人基本信息">
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入真实姓名" />
              </Form.Item>

              <Form.Item
                name="idCard"
                label="身份证号"
                rules={[
                  { required: true, message: '请输入身份证号' },
                  { pattern: /^\d{17}[\dXx]$/, message: '请输入正确的身份证号' },
                ]}
              >
                <Input placeholder="请输入18位身份证号" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="联系电话"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input placeholder="请输入手机号码" />
              </Form.Item>

              <Form.Item
                name="address"
                label="居住地址"
                rules={[{ required: true, message: '请输入居住地址' }]}
              >
                <TextArea rows={2} placeholder="请输入详细居住地址" />
              </Form.Item>

              <Form.Item
                name="applyDate"
                label="预约办理日期"
                rules={[{ required: true, message: '请选择预约日期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择预约办理日期" />
              </Form.Item>
            </Card>
          )}

          {currentStep === 1 && (
            <Card title="上传申请材料">
              <p style={{ marginBottom: 16, color: '#666' }}>
                请上传以下材料的扫描件或清晰照片（支持 jpg、png、pdf 格式）：
              </p>
              {service.materials.map((material) => (
                <div key={material.id} style={{ marginBottom: 24 }}>
                  <p style={{ marginBottom: 8 }}>
                    <strong>{material.name}</strong>
                    {material.required && <span style={{ color: '#ff4d4f' }}>（必需）</span>}
                  </p>
                  <Dragger {...uploadProps} multiple>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
                    <p className="ant-upload-hint">{material.description}</p>
                  </Dragger>
                </div>
              ))}
            </Card>
          )}

          {currentStep === 2 && (
            <Card title="确认申请信息">
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginBottom: 16 }}>申请事项：{service.name}</h4>
                <p>
                  <strong>姓名：</strong>
                  {form.getFieldValue('name')}
                </p>
                <p>
                  <strong>身份证号：</strong>
                  {form.getFieldValue('idCard')}
                </p>
                <p>
                  <strong>联系电话：</strong>
                  {form.getFieldValue('phone')}
                </p>
                <p>
                  <strong>居住地址：</strong>
                  {form.getFieldValue('address')}
                </p>
                <p>
                  <strong>预约日期：</strong>
                  {form.getFieldValue('applyDate')?.format('YYYY-MM-DD')}
                </p>
                <p>
                  <strong>已上传材料：</strong>
                  {fileList?.length || 0} 件
                </p>
              </div>

              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(new Error('请阅读并同意服务协议')),
                  },
                ]}
              >
                <div style={{ padding: 16, background: '#fafafa', borderRadius: 4 }}>
                  <p style={{ marginBottom: 8, fontWeight: 500 }}>服务协议与承诺</p>
                  <p style={{ fontSize: 12, color: '#666', lineHeight: 1.8 }}>
                    本人承诺所提供的信息真实、完整、有效，所提交的材料真实合法。如有不实，
                    本人愿承担相应的法律责任和后果。同意按照政务服务相关规定办理本事项。
                  </p>
                  <div style={{ marginTop: 12 }}>
                    <Input.Checkbox>我已阅读并同意上述服务协议</Input.Checkbox>
                  </div>
                </div>
              </Form.Item>
            </Card>
          )}

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            {currentStep > 0 && (
              <Button onClick={handlePrev} style={{ marginRight: 16 }}>
                上一步
              </Button>
            )}
            {currentStep < 2 && (
              <Button type="primary" onClick={handleNext}>
                下一步
              </Button>
            )}
            {currentStep === 2 && (
              <Button type="primary" onClick={handleSubmit}>
                提交申请
              </Button>
            )}
            <Button onClick={() => navigate('/services')} style={{ marginLeft: 16 }}>
              取消
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ApplicationForm;
