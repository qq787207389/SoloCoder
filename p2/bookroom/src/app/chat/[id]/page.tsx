'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Smile, Paperclip, Image, Check, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useWebSocket } from '@/hooks/useWebSocket'

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  timestamp: Date
  read: boolean
  type: 'text' | 'image'
}

export default function ChatPage() {
  const params = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isOnline, setIsOnline] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { send, isConnected } = useWebSocket(`ws://localhost:3000/api/ws?userId=1`, {
    onMessage: (data) => {
      if (data.type === 'chat') {
        setMessages((prev) => [...prev, data.payload])
      }
    }
  })

  useEffect(() => {
    setMessages([
      {
        id: '1',
        content: '你好！我看到你也喜欢科幻小说，想聊聊最近读的《三体》吗？',
        senderId: '2',
        receiverId: '1',
        timestamp: new Date(Date.now() - 3600000),
        read: true,
        type: 'text'
      },
      {
        id: '2',
        content: '当然可以！我非常喜欢这本书，特别是对黑暗森林法则的设定。',
        senderId: '1',
        receiverId: '2',
        timestamp: new Date(Date.now() - 3000000),
        read: true,
        type: 'text'
      },
      {
        id: '3',
        content: '是啊，刘慈欣的想象力真的太惊人了。你有没有读过他的其他作品？',
        senderId: '2',
        receiverId: '1',
        timestamp: new Date(Date.now() - 2400000),
        read: false,
        type: 'text'
      }
    ])
  }, [params.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: '1',
      receiverId: params.id as string,
      timestamp: new Date(),
      read: false,
      type: 'text'
    }

    setMessages((prev) => [...prev, message])
    setNewMessage('')
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
          <Link href="/discover" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
            <span className="text-gray-500 font-medium">书</span>
          </div>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">读书小王子</h1>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm text-gray-500">{isOnline ? '在线' : '离线'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <span className="text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-full">
              {new Date(messages[0]?.timestamp || Date.now()).toLocaleDateString('zh-CN', {
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {messages.map((message) => {
            const isMe = message.senderId === '1'
            return (
              <div
                key={message.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-500 text-sm">书</span>
                  </div>
                )}
                <div className={`max-w-[70%] ${isMe ? 'order-first' : ''}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isMe
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <div
                    className={`flex items-center gap-1 mt-1 text-xs ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span className="text-gray-400">{formatTime(message.timestamp)}</span>
                    {isMe && (
                      message.read ? (
                        <CheckCheck className="w-4 h-4 text-primary-500" />
                      ) : (
                        <Check className="w-4 h-4 text-gray-400" />
                      )
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" type="button">
            <Smile className="w-6 h-6 text-gray-500" />
          </Button>
          <Button variant="ghost" size="sm" type="button">
            <Image className="w-6 h-6 text-gray-500" />
          </Button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}