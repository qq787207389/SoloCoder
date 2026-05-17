import { TicketType, Seat, QueuePosition } from '@/types';
import { mockTicketTypes, mockSeats } from '@/data/mockData';

interface WebSocketMessage {
  type: string;
  payload: any;
}

interface WebSocketMock {
  onmessage?: (event: { data: string }) => void;
  onopen?: () => void;
  onclose?: () => void;
  readyState: number;
  send: (data: string) => void;
  close: () => void;
}

let ticketTypes: TicketType[] = [...mockTicketTypes];
let seats: Seat[] = [...mockSeats];
let queue: QueuePosition[] = [];
let queueCounter = 0;

const createWebSocketMock = (): WebSocketMock => {
  const mock: WebSocketMock = {
    readyState: 0,
    send: function (data: string) {
      const message: WebSocketMessage = JSON.parse(data);
      handleMessage(message, mock);
    },
    close: function () {
      this.readyState = 3;
      if (this.onclose) this.onclose();
    },
  };

  setTimeout(() => {
    mock.readyState = 1;
    if (mock.onopen) mock.onopen();
    sendStockUpdates(mock);
  }, 100);

  return mock;
};

const sendStockUpdates = (mock: WebSocketMock) => {
  setInterval(() => {
    if (mock.readyState === 1) {
      const randomTicket = ticketTypes[Math.floor(Math.random() * ticketTypes.length)];
      if (randomTicket.remainingStock > 0 && Math.random() > 0.7) {
        randomTicket.remainingStock--;
        randomTicket.salesCount++;
      }

      const message: WebSocketMessage = {
        type: 'stock_update',
        payload: { ticketTypes },
      };
      if (mock.onmessage) {
        mock.onmessage({ data: JSON.stringify(message) });
      }
    }
  }, 3000);
};

const handleMessage = (message: WebSocketMessage, mock: WebSocketMock) => {
  switch (message.type) {
    case 'join_queue': {
      const { userId } = message.payload;
      const existingUser = queue.find(q => q.userId === userId);
      if (!existingUser) {
        queueCounter++;
        queue.push({
          userId,
          position: queueCounter,
          status: 'waiting',
          createdAt: new Date(),
        });
      }

      processQueue(mock);
      break;
    }

    case 'lock_seat': {
      const { seatId, userId } = message.payload;
      const seat = seats.find(s => s.id === seatId);
      
      if (seat && seat.status === 'available') {
        seat.status = 'locked';
        seat.lockedBy = userId;
        seat.lockedAt = new Date();

        setTimeout(() => {
          if (seat.status === 'locked' && seat.lockedBy === userId) {
            seat.status = 'available';
            seat.lockedBy = undefined;
            seat.lockedAt = undefined;
            
            const unlockMsg: WebSocketMessage = {
              type: 'seat_unlocked',
              payload: { seatId: seat.id },
            };
            if (mock.onmessage) {
              mock.onmessage({ data: JSON.stringify(unlockMsg) });
            }
          }
        }, 120000);

        const lockMsg: WebSocketMessage = {
          type: 'seat_locked',
          payload: { seat },
        };
        if (mock.onmessage) {
          mock.onmessage({ data: JSON.stringify(lockMsg) });
        }
      }
      break;
    }

    case 'unlock_seat': {
      const { seatId } = message.payload;
      const seat = seats.find(s => s.id === seatId);
      
      if (seat && seat.status === 'locked') {
        seat.status = 'available';
        seat.lockedBy = undefined;
        seat.lockedAt = undefined;

        const msg: WebSocketMessage = {
          type: 'seat_unlocked',
          payload: { seatId: seat.id },
        };
        if (mock.onmessage) {
          mock.onmessage({ data: JSON.stringify(msg) });
        }
      }
      break;
    }

    case 'purchase_seats': {
      const { seatIds, userId, ticketTypeId } = message.payload;
      const success = seatIds.every((seatId: string) => {
        const seat = seats.find(s => s.id === seatId);
        return seat && (seat.status === 'available' || (seat.status === 'locked' && seat.lockedBy === userId));
      });

      if (success) {
        seatIds.forEach((seatId: string) => {
          const seat = seats.find(s => s.id === seatId);
          if (seat) {
            seat.status = 'sold';
            seat.lockedBy = undefined;
            seat.lockedAt = undefined;
          }
        });

        const ticketType = ticketTypes.find(t => t.id === ticketTypeId);
        if (ticketType) {
          ticketType.remainingStock -= seatIds.length;
          ticketType.salesCount += seatIds.length;
        }

        queue = queue.filter(q => q.userId !== userId);

        const msg: WebSocketMessage = {
          type: 'purchase_success',
          payload: { seatIds, userId },
        };
        if (mock.onmessage) {
          mock.onmessage({ data: JSON.stringify(msg) });
        }
      } else {
        const msg: WebSocketMessage = {
          type: 'purchase_failed',
          payload: { userId, reason: 'Some seats are no longer available' },
        };
        if (mock.onmessage) {
          mock.onmessage({ data: JSON.stringify(msg) });
        }
      }
      break;
    }

    case 'get_initial_data': {
      const msg: WebSocketMessage = {
        type: 'initial_data',
        payload: { ticketTypes, seats },
      };
      if (mock.onmessage) {
        mock.onmessage({ data: JSON.stringify(msg) });
      }
      break;
    }
  }
};

const processQueue = (mock: WebSocketMock) => {
  const waitingUsers = queue.filter(q => q.status === 'waiting');
  waitingUsers.forEach((user, index) => {
    setTimeout(() => {
      if (queue.find(q => q.userId === user.userId)) {
        const msg: WebSocketMessage = {
          type: 'queue_update',
          payload: { userId: user.userId, position: index + 1 },
        };
        if (mock.onmessage) {
          mock.onmessage({ data: JSON.stringify(msg) });
        }
      }
    }, index * 500);
  });

  setTimeout(() => {
    const firstUser = queue.find(q => q.status === 'waiting');
    if (firstUser) {
      firstUser.status = 'processing';
      const msg: WebSocketMessage = {
        type: 'queue_ready',
        payload: { userId: firstUser.userId },
      };
      if (mock.onmessage) {
        mock.onmessage({ data: JSON.stringify(msg) });
      }
    }
  }, waitingUsers.length * 500 + 1000);
};

export const createWebSocket = (): WebSocketMock => {
  return createWebSocketMock();
};

export { ticketTypes, seats, queue };
