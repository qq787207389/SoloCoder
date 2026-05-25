import { useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { useGame } from "@/store/game";
import { render } from "@/game/render";
import {
  attemptLand,
  bandage,
  collectResource,
  depart,
  distillWater,
  drinkWater,
  eat,
  fish,
  InputState,
  readClue,
  repair,
  stepWorld,
} from "@/game/engine";
import { tryUpgrade } from "@/game/init";
import { RESOURCE_LABEL, UPGRADE_COST, UPGRADE_LABEL, UpgradeKey, ResourceKey } from "@/game/types";
import {
  Anchor,
  Compass,
  Droplets,
  Fish,
  Flame,
  Heart,
  MapPin,
  Moon,
  Package,
  Radio,
  Sailboat,
  Sparkles,
  Sun,
  Thermometer,
  Wind,
  Wrench,
} from "lucide-react";
import { listSaves } from "@/game/save";

export default function GamePage() {
  const { world, patch, startNew, saveSlot, currentSlot } = useGame();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<InputState>({
    left: false, right: false, up: false, down: false, row: false,
    toggleSail: false, toggleAnchor: false, interact: false,
  });
  const oneShotRef = useRef<{ sail: boolean; anchor: boolean }>({ sail: false, anchor: false });
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const [tab, setTab] = useState<"inv" | "upg" | "log">("inv");
  const [paused, setPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!world) startNew();
  }, [world, startNew]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      const k = e.key.toLowerCase();
      const i = inputRef.current;
      if (k === "a") i.left = down;
      if (k === "d") i.right = down;
      if (k === "w") i.up = down;
      if (k === "s") i.down = down;
      if (k === " ") { i.row = down; e.preventDefault(); }
      if (k === "f" && down && !oneShotRef.current.sail) {
        i.toggleSail = true;
        oneShotRef.current.sail = true;
      }
      if (k === "f" && !down) oneShotRef.current.sail = false;
      if (k === "e" && down && !oneShotRef.current.anchor) {
        i.toggleAnchor = true;
        oneShotRef.current.anchor = true;
      }
      if (k === "e" && !down) oneShotRef.current.anchor = false;
      if (k === "escape" && down) setPaused((p) => !p);
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, []);

  useEffect(() => {
    if (!world) return;
    const loop = (t: number) => {
      const last = lastTimeRef.current || t;
      const dt = Math.min(0.05, (t - last) / 1000);
      lastTimeRef.current = t;
      if (!paused) {
        const snapshot = world;
        stepWorld(snapshot, dt, inputRef.current);
        inputRef.current.toggleSail = false;
        inputRef.current.toggleAnchor = false;
        patch(() => {});
      }
      const canvas = canvasRef.current;
      if (canvas && world) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const size = resizeCanvas(canvas, containerRef.current);
          ctx.clearRect(0, 0, size.w, size.h);
          render(ctx, world, size.w, size.h, t);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [world, patch, paused]);

  useEffect(() => {
    if (!world) return;
    const t = setInterval(() => {
      saveSlot(currentSlot >= 0 ? currentSlot : 0);
    }, 30000);
    return () => clearInterval(t);
  }, [world, currentSlot, saveSlot]);

  const weatherIcon = useMemo(() => {
    if (!world) return Sun;
    switch (world.weather.type) {
      case "clear": return Sun;
      case "cloudy": return Wind;
      case "rain": return Droplets;
      case "storm": return Flame;
      case "fog": return Moon;
    }
  }, [world?.weather.type]);

  if (!world) return <div className="p-6">加载中…</div>;

  const nearby = world.nearbyIslandId ? world.islands.find((i) => i.id === world.nearbyIslandId) : null;
  const onIsland = world.onIslandId ? world.islands.find((i) => i.id === world.onIslandId) : null;

  return (
    <div ref={containerRef} className="w-screen h-screen relative overflow-hidden wave-bg">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="absolute top-4 left-4 hud-glass p-4 w-72 text-sm space-y-2">
        <div className="flex justify-between items-center">
          <span className="panel-title">漂流者</span>
          <span className="text-xs opacity-70">第 {world.day} 天</span>
        </div>
        <Stat icon={Heart} label="健康" value={100 - world.stats.injured} max={100} color="#ef476f" />
        <Stat icon={Fish} label="饥饿" value={world.stats.hunger} max={100} color="#ff8c42" />
        <Stat icon={Droplets} label="口渴" value={world.stats.thirst} max={100} color="#4cc9f0" />
        <Stat icon={Thermometer} label="体温" value={world.stats.warmth} max={100} color="#9ad5a5" />
        <Stat icon={Sparkles} label="体力" value={world.stats.stamina} max={100} color="#ffd166" />
        <Stat icon={Anchor} label="船体" value={world.ship.hull} max={world.ship.maxHull} color="#d9b382" />
      </div>

      <div className="absolute top-4 right-[220px] hud-glass p-3 w-60 text-sm">
        <div className="flex items-center gap-2">
          {weatherIcon && React.createElement(weatherIcon, { className: "w-4 h-4" })}
          <span className="panel-title">天气</span>
        </div>
        <div className="text-xs opacity-80 mt-1">
          {weatherLabel(world.weather.type)} · 风速 {world.weather.windSpeed.toFixed(1)}
        </div>
        <div className="text-xs opacity-80">
          海浪 {world.weather.waveHeight.toFixed(2)}
          {world.weather.fogDensity > 0.1 && ` · 雾 ${(world.weather.fogDensity * 100).toFixed(0)}%`}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <Compass className="w-3 h-3" />
          航向 {Math.round((world.ship.heading * 180) / Math.PI) % 360}°
        </div>
        <div className="text-xs">速度 {world.ship.speed.toFixed(2)} {world.ship.anchored && "（抛锚中）"}</div>
        <div className="text-xs">{world.ship.sail > 0.1 ? "帆张开" : "帆收起"}</div>
      </div>

      <div className="absolute bottom-4 left-4 hud-glass p-3 w-[420px] text-sm">
        <div className="flex gap-2 mb-2">
          <TabBtn active={tab === "inv"} onClick={() => setTab("inv")} icon={Package} label="背包" />
          <TabBtn active={tab === "upg"} onClick={() => setTab("upg")} icon={Wrench} label="升级" />
          <TabBtn active={tab === "log"} onClick={() => setTab("log")} icon={Radio} label="日志" />
        </div>
        <div className="max-h-56 overflow-auto scroll-y">
          {tab === "inv" && <Inventory world={world} />}
          {tab === "upg" && <Upgrades world={world} patch={patch} />}
          {tab === "log" && <Logs world={world} />}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 hud-glass p-3 w-[380px] text-sm space-y-2">
        {onIsland ? (
          <IslandPanel world={world} patch={patch} onIsland={onIsland} onDepart={() => patch((w) => depart(w))} />
        ) : nearby ? (
          <div>
            <div className="panel-title flex items-center gap-2">
              <MapPin className="w-4 h-4" /> 靠岸
            </div>
            <div className="opacity-80 text-xs mb-2">
              {nearby.biome === "reef"
                ? "暗礁区危险，船体可能受损，尝试绕行。"
                : "靠近该岛屿以登陆。"}
            </div>
            <button className="btn-sea w-full" disabled={nearby.biome === "reef"} onClick={() => patch((w) => { if (!attemptLand(w)) return; })}>
              登陆岛屿
            </button>
          </div>
        ) : (
          <div>
            <div className="panel-title flex items-center gap-2">
              <Sailboat className="w-4 h-4" /> 操作
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn-sea" onClick={() => patch((w) => { fish(w); })}>抛网捕鱼</button>
              <button className="btn-sea" onClick={() => patch((w) => { drinkWater(w); })}>喝水</button>
              <button className="btn-sea" onClick={() => patch((w) => { distillWater(w); })}>蒸馏海水</button>
              <button className="btn-sea" onClick={() => patch((w) => { eat(w, "fish"); })}>吃鱼</button>
              <button className="btn-sea" onClick={() => patch((w) => { eat(w, "coconut"); })}>吃椰子</button>
              <button className="btn-sea" onClick={() => patch((w) => { repair(w); })}>修补船体</button>
              <button className="btn-sea" onClick={() => patch((w) => { bandage(w); })}>包扎伤口</button>
              <button className="btn-sea" onClick={() => setShowHelp(true)}>帮助</button>
            </div>
          </div>
        )}
      </div>

      {world.dead && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="hud-glass p-8 text-center max-w-sm">
            <div className="text-2xl title-glow mb-3">你被大海吞没了……</div>
            <div className="text-sm opacity-80 mb-4">坚持了 {world.day} 天。</div>
            <button className="btn-sea" onClick={() => { startNew(); }}>重新漂流</button>
          </div>
        </div>
      )}

      {paused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="hud-glass p-6 text-center space-y-3">
            <div className="text-xl title-glow">已暂停</div>
            <div className="flex flex-col gap-2">
              <button className="btn-sea" onClick={() => setPaused(false)}>继续游戏</button>
              <button className="btn-sea" onClick={() => saveSlot(currentSlot >= 0 ? currentSlot : 0)}>手动存档</button>
              <button className="btn-sea danger" onClick={() => { startNew(); setPaused(false); }}>放弃当前漂流</button>
            </div>
          </div>
        </div>
      )}

      {showHelp && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="hud-glass p-6 max-w-md text-sm space-y-2">
            <div className="text-lg title-glow">操作说明</div>
            <ul className="list-disc pl-5 space-y-1 opacity-90">
              <li>A / D：左右舵转向</li>
              <li>W：加速（需引擎或风力）</li>
              <li>空格：划桨加速（消耗体力）</li>
              <li>F：升/收帆</li>
              <li>E：抛/起锚</li>
              <li>Esc：暂停</li>
            </ul>
            <button className="btn-sea mt-3" onClick={() => setShowHelp(false)}>关闭</button>
          </div>
        </div>
      )}
    </div>
  );
}

function resizeCanvas(canvas: HTMLCanvasElement, container: HTMLDivElement | null) {
  const w = container?.clientWidth || window.innerWidth;
  const h = container?.clientHeight || window.innerHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

function weatherLabel(t: string) {
  return { clear: "晴朗", cloudy: "多云", rain: "降雨", storm: "暴风雨", fog: "浓雾" }[t as "clear"] || t;
}

function Stat({ icon: Icon, label, value, max, color }: any) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-xs opacity-90">
        <span className="flex items-center gap-1"><Icon className="w-3 h-3" /> {label}</span>
        <span>{Math.round(value)}/{max}</span>
      </div>
      <div className="bar mt-1"><span style={{ width: pct + "%", background: color }} /></div>
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button className={`btn-sea !py-1 !px-3 text-xs flex items-center gap-1 ${active ? "accent" : ""}`} onClick={onClick}>
      <Icon className="w-3 h-3" /> {label}
    </button>
  );
}

function Inventory({ world }: { world: any }) {
  const entries = (Object.keys(world.inventory) as ResourceKey[]).filter((k) => (world.inventory[k] || 0) > 0);
  if (entries.length === 0) return <div className="opacity-70 text-xs">背包空空如也。</div>;
  return (
    <div className="grid grid-cols-3 gap-2">
      {entries.map((k) => (
        <div key={k} className="px-2 py-1 rounded border border-cyan-500/30 bg-black/30 text-xs flex justify-between">
          <span>{RESOURCE_LABEL[k]}</span>
          <span className="opacity-80">x{world.inventory[k]}</span>
        </div>
      ))}
    </div>
  );
}

function Upgrades({ world, patch }: { world: any; patch: (fn: (w: any) => void) => void }) {
  const keys = Object.keys(UPGRADE_COST) as UpgradeKey[];
  return (
    <div className="space-y-2">
      {keys.map((k) => {
        const done = world.ship.upgrades[k];
        const cost = UPGRADE_COST[k];
        const canAfford = Object.entries(cost).every(([res, n]) => (world.inventory[res] || 0) >= (n || 0));
        return (
          <div key={k} className="flex items-center justify-between gap-2 border border-cyan-500/20 rounded p-2 text-xs">
            <div>
              <div className="font-semibold">{UPGRADE_LABEL[k]}{done && " ✓"}</div>
              <div className="opacity-70">
                {Object.entries(cost).map(([res, n]) => `${RESOURCE_LABEL[res as ResourceKey]} x${n}`).join("，")}
              </div>
            </div>
            <button className="btn-sea !py-1 !px-3 text-xs" disabled={done || !canAfford} onClick={() => patch((w) => { tryUpgrade(w, k); })}>
              {done ? "已安装" : "安装"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function Logs({ world }: { world: any }) {
  return (
    <div className="space-y-1 text-xs">
      {world.logs.map((l: any, i: number) => (
        <div key={i} className={`opacity-90 ${l.tone === "warn" ? "text-amber-300" : l.tone === "good" ? "text-emerald-300" : l.tone === "bad" ? "text-rose-300" : "text-sky-200"}`}>
          · {l.msg}
        </div>
      ))}
    </div>
  );
}

function IslandPanel({ world, patch, onIsland, onDepart }: any) {
  const resKeys = (Object.keys(onIsland.resources) as ResourceKey[]).filter((k) => (onIsland.resources[k] || 0) > 0);
  return (
    <div>
      <div className="panel-title flex items-center gap-2">
        <MapPin className="w-4 h-4" /> 已登陆：{islandLabel(onIsland.biome)}
      </div>
      {onIsland.hasClue && (
        <button className="btn-sea accent w-full mb-2" onClick={() => patch((w: any) => { readClue(w); })}>
          阅读前人日记 / 线索
        </button>
      )}
      <div className="text-xs opacity-80 mb-2">可采集资源：</div>
      {resKeys.length === 0 && <div className="opacity-60 text-xs">这里已无可采集资源。</div>}
      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto scroll-y">
        {resKeys.map((k) => (
          <button key={k} className="btn-sea !py-1 !px-2 text-xs" onClick={() => patch((w: any) => { collectResource(w, k, 1); })}>
            {RESOURCE_LABEL[k]} x{onIsland.resources[k]}
          </button>
        ))}
      </div>
      <button className="btn-sea danger w-full mt-3" onClick={onDepart}>驶离岛屿</button>
      <div className="text-[11px] opacity-60 mt-2">
        在岛上你可以休息恢复体力、生火烹饪、安全地蒸馏海水。
      </div>
    </div>
  );
}

function islandLabel(b: string) {
  return ({ palm: "棕榈树岛", volcano: "火山岛", reef: "暗礁区", iceberg: "浮冰山", wreck: "沉船残骸", tower: "废弃瞭望塔", lagoon: "环礁" } as any)[b] || b;
}
