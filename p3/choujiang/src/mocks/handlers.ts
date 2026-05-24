import { http, HttpResponse } from 'msw';
import type {
  Participant,
  CheckInRecord,
  Winner,
  Danmaku,
  Activity,
  PrizeSetting,
} from '../types';
import { generateId, generateAvatar, getRandomDanmakuColor } from '../utils';

let participants: Participant[] = [];
let checkIns: CheckInRecord[] = [];
let winners: Winner[] = [];
let danmakus: Danmaku[] = [];
let activity: Activity | null = null;
let prizeSetting: PrizeSetting = {
  levels: [
    { id: '1', name: '一等奖', count: 1, color: '#FFD700' },
    { id: '2', name: '二等奖', count: 3, color: '#C0C0C0' },
    { id: '3', name: '三等奖', count: 5, color: '#CD7F32' },
  ],
};

const sampleNames = [
  '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十',
  '郑一', '冯二', '陈三', '楚四', '魏五', '蒋六', '沈七', '韩八',
  '杨九', '朱十', '秦一', '尤二', '许三', '何四', '吕五', '施六'
];

for (let i = 0; i < 15; i++) {
  const name = sampleNames[i];
  const phone = `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`;
  const participant: Participant = {
    id: generateId(),
    name,
    phone,
    phoneLastFour: phone.slice(-4),
    avatar: generateAvatar(name),
    createdAt: new Date().toISOString(),
  };
  participants.push(participant);
  
  if (i < 10) {
    checkIns.push({
      id: generateId(),
      participantId: participant.id,
      participant,
      checkedInAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    });
  }
}

activity = {
  id: generateId(),
  name: '2024 年会盛典',
  code: 'PARTY2024',
  status: 'ongoing',
  createdAt: new Date().toISOString(),
};

const sampleDanmakus = [
  '新年快乐！', '恭喜发财！', '万事如意！', '抽奖我要中大奖！',
  '活动太棒了！', '今年一定中！', '好运来！', '一等奖是我的！',
  '大家新年快乐！', '祝福大家身体健康！', '工作顺利！', '家庭幸福！'
];

for (let i = 0; i < 8; i++) {
  danmakus.push({
    id: generateId(),
    participantId: participants[i % participants.length].id,
    participantName: participants[i % participants.length].name,
    content: sampleDanmakus[i],
    color: getRandomDanmakuColor(),
    sentAt: new Date(Date.now() - Math.random() * 600000).toISOString(),
  });
}

export const handlers = [
  http.get('/api/activity', () => {
    return HttpResponse.json({
      success: true,
      data: activity,
    });
  }),

  http.post('/api/activity', async ({ request }) => {
    const body = await request.json() as { name: string };
    activity = {
      id: generateId(),
      name: body.name,
      code: generateId().slice(0, 6).toUpperCase(),
      status: 'preparing',
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: activity });
  }),

  http.get('/api/participants', () => {
    return HttpResponse.json({
      success: true,
      data: participants,
    });
  }),

  http.post('/api/participants', async ({ request }) => {
    const body = await request.json() as { name: string; phone: string };
    const participant: Participant = {
      id: generateId(),
      name: body.name,
      phone: body.phone,
      phoneLastFour: body.phone.slice(-4),
      avatar: generateAvatar(body.name),
      createdAt: new Date().toISOString(),
    };
    participants.push(participant);
    return HttpResponse.json({ success: true, data: participant });
  }),

  http.post('/api/participants/batch', async ({ request }) => {
    const body = await request.json() as { participants: Array<{ name: string; phone: string }> };
    const newParticipants: Participant[] = body.participants.map((p) => ({
      id: generateId(),
      name: p.name,
      phone: p.phone,
      phoneLastFour: p.phone.slice(-4),
      avatar: generateAvatar(p.name),
      createdAt: new Date().toISOString(),
    }));
    participants = [...participants, ...newParticipants];
    return HttpResponse.json({ success: true, data: newParticipants });
  }),

  http.get('/api/checkins', () => {
    return HttpResponse.json({
      success: true,
      data: checkIns,
    });
  }),

  http.post('/api/checkins', async ({ request }) => {
    const body = await request.json() as { name?: string; phoneLastFour?: string };
    
    let participant: Participant | undefined;
    
    if (body.name) {
      participant = participants.find(
        (p) => p.name === body.name && p.phoneLastFour === body.phoneLastFour
      );
    }
    
    if (!participant) {
      return HttpResponse.json({
        success: false,
        message: '未找到参与人员，请检查信息是否正确',
      });
    }

    const existingCheckIn = checkIns.find(
      (c) => c.participantId === participant!.id
    );
    if (existingCheckIn) {
      return HttpResponse.json({
        success: false,
        message: '您已经签到过了',
      });
    }

    const checkIn: CheckInRecord = {
      id: generateId(),
      participantId: participant.id,
      participant,
      checkedInAt: new Date().toISOString(),
    };
    checkIns.push(checkIn);

    return HttpResponse.json({ success: true, data: checkIn });
  }),

  http.post('/api/checkins/manual', async ({ request }) => {
    const body = await request.json() as { participantId: string };
    const participant = participants.find((p) => p.id === body.participantId);
    
    if (!participant) {
      return HttpResponse.json({
        success: false,
        message: '未找到参与人员',
      });
    }

    const checkIn: CheckInRecord = {
      id: generateId(),
      participantId: participant.id,
      participant,
      checkedInAt: new Date().toISOString(),
    };
    checkIns.push(checkIn);

    return HttpResponse.json({ success: true, data: checkIn });
  }),

  http.delete('/api/checkins/:id', ({ params }) => {
    const { id } = params;
    checkIns = checkIns.filter((c) => c.id !== id);
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/prize-setting', () => {
    return HttpResponse.json({
      success: true,
      data: prizeSetting,
    });
  }),

  http.post('/api/prize-setting', async ({ request }) => {
    const body = await request.json() as PrizeSetting;
    prizeSetting = body;
    return HttpResponse.json({ success: true, data: prizeSetting });
  }),

  http.get('/api/winners', () => {
    return HttpResponse.json({
      success: true,
      data: winners,
    });
  }),

  http.post('/api/lottery/draw', async ({ request }) => {
    const body = await request.json() as { prizeLevelId: string; count: number };
    
    const checkedInParticipantIds = checkIns.map((c) => c.participantId);
    const winnerIds = winners.map((w) => w.participantId);
    
    const eligibleParticipants = participants.filter(
      (p) => checkedInParticipantIds.includes(p.id) && !winnerIds.includes(p.id)
    );

    if (eligibleParticipants.length < body.count) {
      return HttpResponse.json({
        success: false,
        message: '可抽奖人数不足',
      });
    }

    const shuffled = [...eligibleParticipants].sort(() => Math.random() - 0.5);
    const selectedWinners = shuffled.slice(0, body.count);

    const prizeLevel = prizeSetting.levels.find((l) => l.id === body.prizeLevelId);

    const newWinners: Winner[] = selectedWinners.map((p) => ({
      id: generateId(),
      participantId: p.id,
      participant: p,
      prizeLevelId: body.prizeLevelId,
      prizeLevelName: prizeLevel?.name || '未知奖项',
      wonAt: new Date().toISOString(),
    }));

    winners = [...winners, ...newWinners];

    return HttpResponse.json({ success: true, data: newWinners });
  }),

  http.get('/api/danmakus', () => {
    return HttpResponse.json({
      success: true,
      data: danmakus,
    });
  }),

  http.post('/api/danmakus', async ({ request }) => {
    const body = await request.json() as { participantId: string; content: string };
    const participant = participants.find((p) => p.id === body.participantId);
    
    if (!participant) {
      return HttpResponse.json({
        success: false,
        message: '未找到参与人员',
      });
    }

    const danmaku: Danmaku = {
      id: generateId(),
      participantId: body.participantId,
      participantName: participant.name,
      content: body.content,
      color: getRandomDanmakuColor(),
      sentAt: new Date().toISOString(),
    };
    danmakus.push(danmaku);

    return HttpResponse.json({ success: true, data: danmaku });
  }),
];
