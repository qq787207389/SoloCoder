import { useGameStore } from '@/store/gameStore'
import { useEffect, useRef } from 'react'

export function ActionLog() {
  const { actionLogs, phase } = useGameStore()
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [actionLogs])

  if (phase === 'menu') {
    return null
  }

  const getLogColor = (type: string) => {
    switch (type) {
      case 'damage':
        return 'text-red-400'
      case 'heal':
        return 'text-green-400'
      case 'move':
        return 'text-blue-400'
      case 'kill':
        return 'text-purple-400'
      default:
        return 'text-slate-300'
    }
  }

  return (
    <div className="fixed bottom-20 left-4 w-80 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-700 overflow-hidden z-40">
      <div className="p-3 bg-slate-800 border-b border-slate-700">
        <h3 className="text-white font-bold flex items-center gap-2">
          <span>📜</span>
          战斗日志
        </h3>
      </div>
      <div className="h-40 overflow-y-auto p-3 space-y-1">
        {actionLogs.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">暂无战斗记录</p>
        ) : (
          actionLogs.slice(-20).map((log) => (
            <div key={log.id} className={`text-sm ${getLogColor(log.type)}`}>
              <span className="text-slate-500 text-xs mr-2">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              {log.message}
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  )
}
