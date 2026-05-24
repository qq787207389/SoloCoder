import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useStore } from '../store';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { Participant, CheckInRecord, PrizeLevel } from '../types';

export default function AdminPanel() {
  const { participants, setParticipants, checkIns, setCheckIns, prizeSetting, setPrizeSetting, winners, setWinners } = useStore();
  const [activeTab, setActiveTab] = useState<'participants' | 'checkins' | 'prizes' | 'winners'>('participants');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [participantsData, checkInsData, prizeData, winnersData] = await Promise.all([
        api.getParticipants(),
        api.getCheckIns(),
        api.getPrizeSetting(),
        api.getWinners(),
      ]);
      setParticipants(participantsData);
      setCheckIns(checkInsData);
      setPrizeSetting(prizeData);
      setWinners(winnersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await parseFile(file);
      await api.batchAddParticipants(data);
      await loadData();
      alert(`成功导入 ${data.length} 位参与人员`);
    } catch (error) {
      alert('导入失败，请检查文件格式');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const parseFile = (file: File): Promise<Array<{ name: string; phone: string }>> => {
    return new Promise((resolve, reject) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'csv') {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            const data = results.data as any[];
            const parsed = data
              .filter((row) => row.name && row.phone)
              .map((row) => ({ name: String(row.name).trim(), phone: String(row.phone).trim() }));
            resolve(parsed);
          },
          error: reject,
        });
      } else if (extension === 'xlsx' || extension === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];
          const parsed = jsonData
            .filter((row) => row.name && row.phone)
            .map((row) => ({ name: String(row.name).trim(), phone: String(row.phone).trim() }));
          resolve(parsed);
        };
        reader.onerror = reject;
        reader.readAsBinaryString(file);
      } else {
        reject(new Error('不支持的文件格式'));
      }
    });
  };

  const exportWinners = () => {
    const data = winners.map((w) => ({
      奖项: w.prizeLevelName,
      姓名: w.participant.name,
      手机号: w.participant.phone,
      中奖时间: new Date(w.wonAt).toLocaleString('zh-CN'),
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '中奖名单');
    XLSX.writeFile(workbook, '中奖名单.xlsx');
  };

  const handleManualCheckIn = async (participantId: string) => {
    try {
      await api.manualCheckIn(participantId);
      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : '补签失败');
    }
  };

  const handleDeleteCheckIn = async (checkInId: string) => {
    if (!confirm('确定要删除这条签到记录吗？')) return;
    try {
      await api.deleteCheckIn(checkInId);
      await loadData();
    } catch (error) {
      alert('删除失败');
    }
  };

  const handlePrizeChange = (index: number, field: keyof PrizeLevel, value: string | number) => {
    const newLevels = [...prizeSetting.levels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    setPrizeSetting({ levels: newLevels });
  };

  const addPrizeLevel = () => {
    const newLevel: PrizeLevel = {
      id: String(Date.now()),
      name: `奖项${prizeSetting.levels.length + 1}`,
      count: 1,
      color: '#FF6B6B',
    };
    setPrizeSetting({ levels: [...prizeSetting.levels, newLevel] });
  };

  const removePrizeLevel = (index: number) => {
    const newLevels = prizeSetting.levels.filter((_, i) => i !== index);
    setPrizeSetting({ levels: newLevels });
  };

  const savePrizeSetting = async () => {
    try {
      await api.updatePrizeSetting(prizeSetting);
      alert('奖项设置已保存');
    } catch (error) {
      alert('保存失败');
    }
  };

  const isCheckedIn = (participantId: string) => {
    return checkIns.some((c) => c.participantId === participantId);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">管理后台</h1>

        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b">
            {[
              { key: 'participants', label: '参与人员' },
              { key: 'checkins', label: '签到记录' },
              { key: 'prizes', label: '奖项设置' },
              { key: 'winners', label: '中奖名单' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'participants' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">共 {participants.length} 人</span>
                  <div className="flex gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {loading ? '导入中...' : '导入名单 (Excel/CSV)'}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">头像</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">姓名</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">手机号</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">签到状态</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {participants.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full" />
                          </td>
                          <td className="px-4 py-3 font-medium">{p.name}</td>
                          <td className="px-4 py-3 text-gray-600">{p.phone}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isCheckedIn(p.id) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isCheckedIn(p.id) ? '已签到' : '未签到'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {!isCheckedIn(p.id) && (
                              <button
                                onClick={() => handleManualCheckIn(p.id)}
                                className="text-purple-600 hover:text-purple-800 text-sm"
                              >
                                补签
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'checkins' && (
              <div>
                <div className="mb-4">
                  <span className="text-gray-600">已签到 {checkIns.length} 人</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">头像</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">姓名</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">手机号</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">签到时间</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {checkIns.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <img src={c.participant.avatar} alt={c.participant.name} className="w-10 h-10 rounded-full" />
                          </td>
                          <td className="px-4 py-3 font-medium">{c.participant.name}</td>
                          <td className="px-4 py-3 text-gray-600">{c.participant.phone}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(c.checkedInAt).toLocaleString('zh-CN')}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDeleteCheckIn(c.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'prizes' && (
              <div>
                <div className="space-y-4 mb-6">
                  {prizeSetting.levels.map((level, index) => (
                    <div key={level.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <input
                        type="text"
                        value={level.name}
                        onChange={(e) => handlePrizeChange(index, 'name', e.target.value)}
                        className="px-3 py-2 border rounded-lg flex-1"
                        placeholder="奖项名称"
                      />
                      <input
                        type="number"
                        value={level.count}
                        onChange={(e) => handlePrizeChange(index, 'count', parseInt(e.target.value) || 1)}
                        className="px-3 py-2 border rounded-lg w-24"
                        min="1"
                        placeholder="人数"
                      />
                      <input
                        type="color"
                        value={level.color}
                        onChange={(e) => handlePrizeChange(index, 'color', e.target.value)}
                        className="w-12 h-10 rounded-lg cursor-pointer"
                      />
                      <button
                        onClick={() => removePrizeLevel(index)}
                        className="text-red-500 hover:text-red-700 px-3"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={addPrizeLevel}
                    className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50"
                  >
                    添加奖项
                  </button>
                  <button
                    onClick={savePrizeSetting}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    保存设置
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'winners' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">共 {winners.length} 位中奖者</span>
                  <button
                    onClick={exportWinners}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    导出中奖名单
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">奖项</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">头像</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">姓名</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">手机号</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">中奖时间</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {winners.map((w) => (
                        <tr key={w.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span
                              className="px-3 py-1 rounded-full text-sm font-medium"
                              style={{ backgroundColor: `${w.prizeLevelId === '1' ? '#FEF3C7' : w.prizeLevelId === '2' ? '#F3F4F6' : '#FEF3C7'}`, color: w.prizeLevelId === '1' ? '#D97706' : w.prizeLevelId === '2' ? '#4B5563' : '#92400E' }}
                            >
                              {w.prizeLevelName}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <img src={w.participant.avatar} alt={w.participant.name} className="w-10 h-10 rounded-full" />
                          </td>
                          <td className="px-4 py-3 font-medium">{w.participant.name}</td>
                          <td className="px-4 py-3 text-gray-600">{w.participant.phone}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(w.wonAt).toLocaleString('zh-CN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
