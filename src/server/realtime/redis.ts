import Redis from 'ioredis';

let publisher: Redis | null = null;
let subscriber: Redis | null = null;

export function getPublisher(): Redis {
  if (!publisher) {
    publisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    publisher.on('error', (err) => console.error('[Redis Publisher]', err.message));
  }
  return publisher;
}

export function getSubscriber(): Redis {
  if (!subscriber) {
    subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    subscriber.on('error', (err) => console.error('[Redis Subscriber]', err.message));
  }
  return subscriber;
}

export enum RedisChannel {
  Motion = 'f1:motion',
  Telemetry = 'f1:telemetry',
  LapData = 'f1:lapdata',
  CarStatus = 'f1:carstatus',
  CarDamage = 'f1:cardamage',
  Session = 'f1:session',
  Participants = 'f1:participants',
  Event = 'f1:event',
  FinalClassification = 'f1:classification',
  CarSetups = 'f1:carsetups',
  LapHistory = 'f1:laphistory',
  PositionHistory = 'f1:positionhistory',
}

export function publish(channel: RedisChannel, data: unknown): void {
  try {
    getPublisher().publish(channel, JSON.stringify(data, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (err) {
    console.error(`[Redis] Failed to publish to ${channel}:`, err);
  }
}
