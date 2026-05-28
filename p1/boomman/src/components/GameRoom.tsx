import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Room {
  id: string
  name: string
  host: string
  players: number
  maxPlayers: number
  mode: string
  hasPassword: boolean
}

const mockRooms: Room[] = [
  { id: '1', name: '新手练习房', host: 'Player1', players: 2, maxPlayers: 4, mode: '经典模式', hasPassword: false },
  { id: '2', name: '高手对决', host: 'ProGamer', players: 3, maxPlayers: 4, mode: '团队对战', hasPassword: true },
  { id: '3', name: '欢乐夺旗', host: 'FunPlayer', players: 1, maxPlayers: 6, mode: '夺旗模式', hasPassword: false },
]

export default function GameRoom() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>(mockRooms)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [password, setPassword] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)

  const createRoom = () => {
    const newRoom: Room = {
      id: Date.now().toString(),
      name: roomName || '我的房间',
      host: '你',
      players: 1,
      maxPlayers,
      mode: '经典模式',
      hasPassword: !!password,
    }
    setRooms([...rooms, newRoom])
    setShowCreateModal(false)
    setRoomName('')
    setPassword('')
  }

  const joinRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId)
    if (room && room.players < room.maxPlayers) {
      navigate('/game')
    }
  }

  return (
    <div className="menu-container">
      <button
        className="pixel-btn pixel-btn-secondary back-btn"
        onClick={() => navigate('/')}
      >
        ← 返回
      </button>

      <h1 className="pixel-text game-title" style={{ fontSize: '36px' }}>房间大厅</h1>

      <div style={{ width: '80%', maxWidth: '800px', marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px' }}>在线房间: {rooms.length}</span>
          <button
            className="pixel-btn pixel-btn-green"
            style={{ fontSize: '10px', padding: '8px 16px' }}
            onClick={() => setShowCreateModal(true)}
          >
            创建房间
          </button>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', border: '3px solid #000', padding: '16px' }}>
          {rooms.map((room) => (
            <div
              key={room.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                marginBottom: '8px',
                background: selectedRoom === room.id ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${selectedRoom === room.id ? '#4ecdc4' : '#333'}`,
                cursor: 'pointer',
              }}
              onClick={() => setSelectedRoom(room.id)}
            >
              <div>
                <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                  {room.name} {room.hasPassword && '🔒'}
                </div>
                <div style={{ fontSize: '10px', color: '#888' }}>
                  房主: {room.host} | 模式: {room.mode}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '12px', color: room.players >= room.maxPlayers ? '#ff6b6b' : '#95e1a3' }}>
                  {room.players}/{room.maxPlayers}
                </span>
                <button
                  className="pixel-btn"
                  style={{ fontSize: '10px', padding: '8px 16px' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    joinRoom(room.id)
                  }}
                  disabled={room.players >= room.maxPlayers}
                >
                  加入
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#1a1a2e',
            border: '4px solid #000',
            padding: '32px',
            minWidth: '400px',
          }}>
            <h2 className="pixel-text" style={{ fontSize: '20px', marginBottom: '24px', textAlign: 'center' }}>
              创建房间
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '10px', display: 'block', marginBottom: '8px' }}>房间名称</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="输入房间名称"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0a0a1e',
                  border: '2px solid #333',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '10px', display: 'block', marginBottom: '8px' }}>
                最大玩家数: {maxPlayers}
              </label>
              <input
                type="range"
                min="2"
                max="8"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '10px', display: 'block', marginBottom: '8px' }}>密码 (可选)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="留空表示公开"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0a0a1e',
                  border: '2px solid #333',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                className="pixel-btn pixel-btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowCreateModal(false)}
              >
                取消
              </button>
              <button
                className="pixel-btn pixel-btn-green"
                style={{ flex: 1 }}
                onClick={createRoom}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
