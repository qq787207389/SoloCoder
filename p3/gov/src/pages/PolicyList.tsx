import { useEffect, useState } from 'react';
import { List, Pagination, Input, Button, Card } from 'antd';
import { SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { policyApi } from '../api';


const PolicyList = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchPolicies();
  }, [page, pageSize]);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data = await policyApi.getPolicies({ page, pageSize, keyword });
      setPolicies(data.list);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchPolicies();
  };

  return (
    <div className="page-container">
      <h1 className="page-title">政策文件</h1>

      <div className="filter-section">
        <Input
          placeholder="搜索政策标题或发布部门"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          prefix={<SearchOutlined />}
          style={{ maxWidth: 400, marginRight: 16 }}
        />
        <Button type="primary" onClick={handleSearch} loading={loading}>
          搜索
        </Button>
      </div>

      <Card>
        <List
          loading={loading}
          dataSource={policies}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/policies/${item.id}`)}
            >
              <List.Item.Meta
                avatar={<FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                title={
                  <span>
                    {item.title}
                    {item.documentNumber && (
                      <span style={{ color: '#999', marginLeft: 12, fontSize: 12 }}>
                        [{item.documentNumber}]
                      </span>
                    )}
                  </span>
                }
                description={
                  <div>
                    <span>发布部门：{item.department}</span>
                    <span style={{ marginLeft: 24 }}>发布日期：{item.publishDate}</span>
                  </div>
                }
              />
            </List.Item>
          )}
        />

        {total > 0 && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={(p) => setPage(p)}
              showSizeChanger={false}
              showQuickJumper
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default PolicyList;
