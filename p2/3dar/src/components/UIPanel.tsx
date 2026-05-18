import { useState } from 'react';
import type { ShoeConfig, ShoeColors, PartVisibility } from '../types';
import { COLOR_PRESETS } from '../types';

interface UIPanelProps {
  config: ShoeConfig;
  onConfigChange: (config: ShoeConfig) => void;
  onScreenshot: () => void;
  onToggleFullscreen: () => void;
  onOpenAR: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  arSupported: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const colorLabels: Record<keyof ShoeColors, string> = {
  upper: '鞋面',
  laces: '鞋带',
  sole: '鞋底',
  logo: 'Logo',
};

const partLabels: Record<keyof PartVisibility, string> = {
  laces: '鞋带',
  logo: 'Logo',
  badge: '徽章',
};

export function UIPanel({
  config,
  onConfigChange,
  onScreenshot,
  onToggleFullscreen,
  onOpenAR,
  autoRotate,
  onToggleAutoRotate,
  arSupported,
  isOpen,
  onToggleOpen,
}: UIPanelProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'parts' | 'texture'>('colors');

  const handleColorChange = (part: keyof ShoeColors, color: string) => {
    onConfigChange({
      ...config,
      colors: { ...config.colors, [part]: color },
    });
  };

  const handleVisibilityChange = (part: keyof PartVisibility) => {
    onConfigChange({
      ...config,
      visibility: { ...config.visibility, [part]: !config.visibility[part] },
    });
  };

  const handlePresetChange = (preset: string) => {
    onConfigChange({
      ...config,
      colors: COLOR_PRESETS[preset],
    });
  };

  const handleTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onConfigChange({
          ...config,
          customTexture: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveTexture = () => {
    onConfigChange({
      ...config,
      customTexture: null,
    });
  };

  return (
    <>
      <button
        onClick={onToggleOpen}
        className="fixed top-4 right-4 z-40 lg:hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-4 shadow-2xl border border-white/20 hover:from-blue-600 hover:to-purple-700 transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          )}
        </svg>
      </button>

      <div
        className={`fixed z-50 transition-all duration-300 ease-out
          ${isOpen 
            ? 'right-4 top-20 bottom-4 w-full max-w-sm opacity-100 translate-x-0' 
            : 'right-0 top-20 bottom-4 w-full max-w-sm opacity-0 translate-x-full lg:translate-x-0 lg:opacity-100 lg:right-4'
          }`}
      >
        <div className="h-full bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/20">
          <div className="relative p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex-shrink-0">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">鞋款定制</h2>
                <p className="text-xs text-white/70 mt-0.5">设计您的专属运动鞋</p>
              </div>
              <button
                onClick={onToggleOpen}
                className="lg:hidden p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex bg-slate-50/50 px-3 pt-2 flex-shrink-0">
            {(['colors', 'parts', 'texture'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-semibold transition-all rounded-t-xl relative ${
                  activeTab === tab
                    ? 'text-blue-600 bg-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  {tab === 'colors' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  )}
                  {tab === 'parts' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )}
                  {tab === 'texture' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  {tab === 'colors' ? '配色' : tab === 'parts' ? '部件' : '纹理'}
                </span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'colors' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    预设配色
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(COLOR_PRESETS).map(([key, colors]) => (
                      <button
                        key={key}
                        onClick={() => handlePresetChange(key)}
                        className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all transform hover:scale-105 shadow-md"
                        style={{
                          background: `linear-gradient(135deg, ${colors.upper} 0%, ${colors.upper} 50%, ${colors.sole} 50%, ${colors.sole} 100%)`,
                        }}
                        title={key}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    自定义颜色
                  </label>
                  <div className="space-y-2">
                    {(Object.keys(colorLabels) as Array<keyof ShoeColors>).map((part) => (
                      <div
                        key={part}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <span className="text-xs font-medium text-slate-700">
                          {colorLabels[part]}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <input
                              type="color"
                              value={config.colors[part]}
                              onChange={(e) => handleColorChange(part, e.target.value)}
                              className="w-10 h-8 rounded-lg cursor-pointer border-0 shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'parts' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  切换鞋款部件的显示状态
                </p>
                <div className="space-y-2">
                  {(Object.keys(partLabels) as Array<keyof PartVisibility>).map(
                    (part) => (
                      <div
                        key={part}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <span className="text-xs font-semibold text-slate-700">
                          {partLabels[part]}
                        </span>
                        <button
                          onClick={() => handleVisibilityChange(part)}
                          className={`relative w-12 h-6 rounded-full transition-all shadow-inner ${
                            config.visibility[part]
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                              : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                              config.visibility[part]
                                ? 'translate-x-7'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {activeTab === 'texture' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  上传图片作为鞋面纹理
                </p>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group">
                  <div className="flex flex-col items-center justify-center py-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-slate-600">点击上传图片</p>
                    <p className="text-xs text-slate-400 mt-0.5">支持 JPG、PNG</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleTextureUpload}
                  />
                </label>

                {config.customTexture && (
                  <div className="relative">
                    <img
                      src={config.customTexture}
                      alt="Custom texture"
                      className="w-full h-28 object-cover rounded-xl shadow-md"
                    />
                    <button
                      onClick={handleRemoveTexture}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-gradient-to-b from-white to-slate-50 flex-shrink-0">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={onToggleAutoRotate}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  autoRotate
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  {autoRotate ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {autoRotate ? '停止旋转' : '自动旋转'}
                </span>
              </button>
              <button
                onClick={onToggleFullscreen}
                className="py-2.5 px-3 bg-white border-2 border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
              >
                <span className="flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  全屏
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onScreenshot}
                className="py-2.5 px-3 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white rounded-xl text-xs font-semibold hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all shadow-md shadow-purple-500/30"
              >
                <span className="flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  截图保存
                </span>
              </button>
              <button
                onClick={onOpenAR}
                disabled={!arSupported}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  arSupported
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  AR预览
                </span>
              </button>
            </div>

            {!arSupported && (
              <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs text-amber-700 text-center flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  当前浏览器不支持WebXR AR功能
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
