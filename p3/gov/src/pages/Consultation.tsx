import { useState } from 'react';
import { Form, Input, Radio, Upload, Button, message, Card, Alert } from 'antd';
import { InboxOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { consultationApi } from '../api';

const { TextArea } = Input;
const { Dragger } = Upload;

const Consultation = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadProps['fileList']>([]);
  const [submitted, setSubmitted] = useState(false);

  const uploadProps: UploadProps = {
    fileList,
    onChange: ({ fileList: newFileList }) => setFileList(newFileList),
    beforeUpload: () => false,
    maxCount: 5,
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await consultationApi.createConsultation(values);
      setSubmitted(true);
      message.success('提交成功！');
    } catch (error) {
      message.error('提交失败，请重试');
    }
  };

  if (submitted) {
    return (
      <div className="page-container">
        <div className="success-container">
          <CheckCircleOutlined className="success-icon" style={{ color: '#52c41a' }} />
          <h2>提交成功！</h2>
          <p style={{ color: '#666', marginBottom: 24 }}>
            感谢您的反馈，我们将在3个工作日内给您回复
          </p>
          <Alert
            message="温馨提示"
            description="您可以在个人中心查看咨询记录和回复状态"
            type="info"
            showIcon
            style={{ maxWidth: 500, margin: '0 auto 32px' }}
          />
          <Button type="primary" size="large" onClick={() => setSubmitted(false)}>
            继续提交
          </Button>
          <Button size="large" style={{ marginLeft: 16 }} onClick={() => window.history.back()}>
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">咨询投诉</h1>

      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Card>
          <Alert
            message="温馨提示"
            description="请如实填写您的咨询内容，我们将严格保护您的个人信息。虚假或恶意投诉将承担相应法律责任。"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form form={form} layout="vertical">
            <Form.Item
              name="type"
              label="类型"
              rules={[{ required: true, message: '请选择类型' }]}
              initialValue="consult"
            >
              <Radio.Group>
                <Radio value="consult">咨询</Radio>
                <Radio value="complaint">投诉</Radio>
                <Radio value="suggestion">建议</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="title"
              label="标题"
              rules={[{ required: true, message: '请输入标题' }]}
            >
              <Input placeholder="请简要描述您的问题或建议" maxLength={100} showCount />
            </Form.Item>

            <Form.Item
              name="content"
              label="内容详情"
              rules={[{ required: true, message: '请输入详细内容' }]}
            >
              <TextArea
                rows={6}
                placeholder="请详细描述您的问题、情况或建议，以便我们更好地为您服务"
                maxLength={1000}
                showCount
              />
            </Form.Item>

            <Form.Item name="contactPhone" label="联系电话" rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}>
              <Input placeholder="请输入您的手机号码，方便我们联系您" />
            </Form.Item>

            <Form.Item label="上传图片（可选，最多5张）">
              <Dragger {...uploadProps} listType="picture" accept="image/*">
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽图片到此处上传</p>
                <p className="ant-upload-hint">支持 JPG、PNG 格式，单张不超过 10MB</p>
              </Dragger>
            </Form.Item>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Button type="primary" size="large" onClick={handleSubmit}>
                提交
              </Button>
              <Button size="large" style={{ marginLeft: 16 }} onClick={() => form.resetFields()}>
                重置
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Consultation;
