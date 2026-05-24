import { useState } from 'react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const menuItems = [
    {
      id: 'checkin',
      title: '活动签到',
      description: '参与者扫码或输入信息完成签到',
      icon: '📝',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'bigscreen',
      title: '大屏幕',
      description: '头像墙、抽奖、弹幕墙，氛围感拉满',
      icon: '📺',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'admin',
      title: '管理后台',
      description: '导入名单、管理签到、设置奖项',
      icon: '⚙️',
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'danmaku',
      title: '发送弹幕',
      description: '手机端发送祝福语和弹幕',
      icon: '💬',
      color: 'from-green-500 to-teal-500',
    },
  ];

  return (
    <div className="min-h-screen festival-bg flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🎉 活动签到抽奖系统 🎉
          </h1>
          <p className="text-2xl text-white/80">
            中小型活动签到、互动、抽奖的完美解决方案
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`bg-gradient-to-br ${item.color} p-8 rounded-3xl shadow-2xl text-white text-left transition-all transform hover:scale-[1.02] hover:shadow-3xl group overflow-hidden`}
            >
              <div className="text-6xl mb-4 group-hover:animate-bounce">
                {item.icon}
              </div>
              <h2 className="text-3xl font-bold mb-2 break-words">{item.title}</h2>
              <p className="text-white/80 text-lg break-words">{item.description}</p>
              <div className="mt-4 flex items-center text-white/60">
                <span>点击进入</span>
                <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-full px-8 py-4 text-white">
            <span className="text-lg">💡 提示：建议使用大屏幕设备展示"大屏幕"页面，参与者使用手机进行签到和发送弹幕</span>
          </div>
        </div>
      </div>
    </div>
  );
}
