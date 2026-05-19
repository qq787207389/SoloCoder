import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '✏️',
      title: 'Markdown 编辑',
      description: '使用熟悉的 Markdown 语法编写简历，简单高效'
    },
    {
      icon: '👁️',
      title: '实时预览',
      description: '左侧编辑右侧预览，所见即所得'
    },
    {
      icon: '🎨',
      title: '多主题支持',
      description: '经典、现代、简洁三种主题风格随心切换'
    },
    {
      icon: '📄',
      title: 'PDF 导出',
      description: '一键导出高品质 PDF 简历，便于投递'
    },
    {
      icon: '💾',
      title: '自动保存',
      description: '所有更改自动保存到本地，不怕意外关闭'
    },
    {
      icon: '🔍',
      title: '智能诊断',
      description: '智能检查简历常见问题，提供改进建议'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">MarkCV</h1>
          <button
            onClick={() => navigate('/editor')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            开始编辑
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            用 Markdown 打造你的专属简历
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            简单、高效、美观的在线简历编辑器，让你的简历脱颖而出
          </p>
          <button
            onClick={() => navigate('/editor')}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold shadow-lg hover:shadow-xl"
          >
            立即开始，免费使用
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            为什么选择 Markdown 编辑简历？
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Markdown 是一种轻量级标记语言，让你专注于内容本身，而不是复杂的格式调整。
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="flex items-start space-x-4">
            <div className="text-2xl">✅</div>
            <div>
              <h4 className="font-semibold text-gray-800">简单易学</h4>
              <p className="text-gray-600 text-sm">只需几分钟就能掌握基本语法</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="text-2xl">✅</div>
            <div>
              <h4 className="font-semibold text-gray-800">版本控制友好</h4>
              <p className="text-gray-600 text-sm">纯文本格式，便于 Git 管理</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="text-2xl">✅</div>
            <div>
              <h4 className="font-semibold text-gray-800">跨平台兼容</h4>
              <p className="text-gray-600 text-sm">任何编辑器都能打开</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="text-2xl">✅</div>
            <div>
              <h4 className="font-semibold text-gray-800">格式统一</h4>
              <p className="text-gray-600 text-sm">避免各种编辑器的格式差异</p>
            </div>
          </div>
        </div>
      </div>
    </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            MarkCV - 让简历制作更简单
          </p>
          <p className="text-gray-500 text-sm mt-2">
            使用 React + TypeScript + CodeMirror 构建
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
