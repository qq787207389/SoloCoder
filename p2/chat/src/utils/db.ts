import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Message } from '../types';

interface ChatDB extends DBSchema {
  messages: {
    key: string;
    value: Message;
    indexes: {
      'by-channel': string;
      'by-timestamp': number;
    };
  };
}

const DB_NAME = 'LightChatDB';
const STORE_NAME = 'messages';
const DB_VERSION = 1;

let db: IDBPDatabase<ChatDB> | null = null;

export async function initDB() {
  if (db) return db;
  
  db = await openDB<ChatDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: 'id',
      });
      store.createIndex('by-channel', 'channelId');
      store.createIndex('by-timestamp', 'timestamp');
    },
  });
  
  return db;
}

export async function saveMessage(message: Message) {
  const database = await initDB();
  await database.put(STORE_NAME, message);
}

export async function getMessagesByChannel(channelId: string, limit: number = 100): Promise<Message[]> {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, 'readonly');
  const index = tx.store.index('by-timestamp');
  
  const allMessages: Message[] = [];
  let cursor = await index.openCursor(null, 'prev');
  
  while (cursor && allMessages.length < limit) {
    if (cursor.value.channelId === channelId) {
      allMessages.push(cursor.value);
    }
    cursor = await cursor.continue();
  }
  
  await tx.done;
  return allMessages.reverse();
}

export async function searchMessages(channelId: string, keyword: string): Promise<Message[]> {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, 'readonly');
  const index = tx.store.index('by-channel');
  
  const results: Message[] = [];
  let cursor = await index.openCursor(channelId);
  
  const lowerKeyword = keyword.toLowerCase();
  while (cursor) {
    if (cursor.value.content.toLowerCase().includes(lowerKeyword)) {
      results.push(cursor.value);
    }
    cursor = await cursor.continue();
  }
  
  await tx.done;
  return results;
}

export async function clearMessages() {
  const database = await initDB();
  await database.clear(STORE_NAME);
}
