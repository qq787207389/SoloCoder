import { useMemo, useState } from "react";
import { useGame } from "@/store/game";
import { listSaves } from "@/game/save";
import { Play, RefreshCcw, Trash2, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const { startNew, loadSlot, deleteSlot } = useGame();
  const nav = useNavigate();
  const [, force] = useState(0);
  const saves = useMemo(() => listSaves(), [useGame.getState().currentSlot]);

  return (
    <div className="w-screen h-screen relative overflow-hidden wave-bg">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 20%, rgba(76,201,240,0.15), transparent 60%)",
      }} />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        <div className="text-center mb-10">
          <div className="text-5xl md:text-6xl font-bold title-glow tracking-widest mb-2">漂 · 流</div>
          <div className="text-lg opacity-70 tracking-widest">Solo Sailor · 单人海洋生存</div>
        </div>

        <div className="hud-glass p-6 w-full max-w-xl space-y-4">
          <div className="panel-title">选择起点</div>
          <button
            className="btn-sea accent w-full flex items-center justify-center gap-2 !py-3"
            onClick={() => { startNew(); nav("/game"); }}
          >
            <Play className="w-4 h-4" /> 开始新的漂流
          </button>

          <div className="panel-title mt-4">继续漂流（本地存档）</div>
          <div className="space-y-2">
            {saves.slots.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 border border-cyan-500/20 rounded p-3">
                <div>
                  <div className="text-sm">存档槽 {s.id + 1}</div>
                  <div className="text-xs opacity-70">
                    {s.hasSave ? `第 ${s.day} 天 · ${Math.floor(s.time / 60)} 分` : "空槽位"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn-sea !py-1 !px-3 text-xs flex items-center gap-1"
                    disabled={!s.hasSave}
                    onClick={() => { if (loadSlot(s.id)) nav("/game"); }}
                  >
                    <RefreshCcw className="w-3 h-3" /> 读取
                  </button>
                  <button
                    className="btn-sea danger !py-1 !px-3 text-xs flex items-center gap-1"
                    disabled={!s.hasSave}
                    onClick={() => { deleteSlot(s.id); force((x) => x + 1); }}
                  >
                    <Trash2 className="w-3 h-3" /> 删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs opacity-70 border-t border-cyan-500/20 pt-3 space-y-1">
            <div className="flex items-center gap-1"><Info className="w-3 h-3" /> WASD 操作方向，空格划桨，F 收/升帆，E 抛锚，Esc 暂停。</div>
            <div>目标：在孤寂的海上存活，拼凑线索抵达信号塔，重返文明。</div>
          </div>
        </div>

        <div className="absolute bottom-4 text-xs opacity-40">Canvas 2D · TypeScript · 单机</div>
      </div>
    </div>
  );
}
