import { X, Info, ExternalLink } from 'lucide-react';

interface MapTokenPromptProps {
  onClose: () => void;
}

export const MapTokenPrompt = ({ onClose }: MapTokenPromptProps) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-slide-in">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl max-w-md">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white">使用演示地图模式</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              当前使用简化版世界地图。如需使用 Mapbox 真实地图，请按以下步骤配置：
            </p>
            <ol className="text-xs text-slate-500 space-y-1 mb-3 list-decimal list-inside">
              <li>访问 mapbox.com 注册账号获取 access token</li>
              <li>在项目根目录创建 .env 文件</li>
              <li>添加 VITE_MAPBOX_TOKEN=你的token</li>
            </ol>
            <a
              href="https://www.mapbox.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              获取 Mapbox Token
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
