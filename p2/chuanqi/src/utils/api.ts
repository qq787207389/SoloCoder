export async function simulateApiDelay<T>(data: T, minMs: number = 200, maxMs: number = 500): Promise<T> {
  const delay = Math.random() * (maxMs - minMs) + minMs
  return new Promise(resolve => setTimeout(() => resolve(data), delay))
}

export async function loginPlayer(username: string, password: string): Promise<{ success: boolean; message: string }> {
  return simulateApiDelay({
    success: username.length >= 3 && password.length >= 6,
    message: '登录成功'
  })
}

export async function fetchGuildInfo(guildId: string): Promise<any> {
  return simulateApiDelay({
    id: guildId,
    name: '沙巴克行会',
    members: 120,
    level: 5
  })
}

export async function submitEnhanceRequest(equipmentId: string, useProtect: boolean): Promise<any> {
  return simulateApiDelay({
    success: Math.random() > 0.3,
    newLevel: 5,
    broke: false
  })
}
