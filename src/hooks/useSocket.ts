'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTelemetryStore } from '@/stores/telemetryStore';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const store = useTelemetryStore();

  useEffect(() => {
    const configuredUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
    const url = configuredUrl || window.location.origin;
    const socket = io(url, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      store.setConnected(true);
      console.log('[Socket] Connected', { url, transport: socket.io.engine.transport.name });
    });

    socket.on('connect_error', (error) => {
      store.setConnected(false);
      console.error('[Socket] Connection error', {
        url,
        origin: window.location.origin,
        message: error.message,
        description: (error as any).description,
        context: (error as any).context,
      });
    });

    socket.on('disconnect', (reason) => {
      store.setConnected(false);
      console.log('[Socket] Disconnected', { url, reason });
    });

    socket.on('motion', (data: any) => {
      store.setMotion(data.cars);
    });

    socket.on('session', (data: any) => {
      store.setSession(data);
    });

    socket.on('lapdata', (data: any) => {
      store.setLapData(data.cars);
    });

    socket.on('telemetry', (data: any) => {
      store.setTelemetry(data.cars);
    });

    socket.on('carstatus', (data: any) => {
      store.setCarStatus(data.cars);
    });

    socket.on('cardamage', (data: any) => {
      store.setCarDamage(data.cars);
    });

    socket.on('participants', (data: any) => {
      store.setDrivers(data.drivers);
    });

    socket.on('event', (data: any) => {
      store.addEvent(data);
    });

    socket.on('carsetups', (data: any) => {
      store.setCarSetups(data.cars);
    });

    socket.on('laphistory', (data: any) => {
      if (data.entries) store.addLapHistory(data.entries);
    });

    socket.on('positionhistory', (data: any) => {
      if (data.entries) store.addPositionHistory(data.entries);
    });

    socket.on('cartelemetry2', (data: any) => {
      if (data.cars) store.setCarTelemetry2(data.cars);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socketRef;
}
