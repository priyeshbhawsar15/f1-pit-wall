import { PacketId, MAX_CARS_2025, MAX_CARS_2026 } from '../../lib/constants';
import type { PacketHeader } from './header';

export type TelemetryFormat = 2025 | 2026;

type PacketSizes = Partial<Record<TelemetryFormat, number>>;

const PACKET_SIZES: Partial<Record<PacketId, PacketSizes>> = {
  [PacketId.Motion]: { 2025: 1349, 2026: 1325 },
  [PacketId.Session]: { 2025: 753, 2026: 926 },
  [PacketId.LapData]: { 2025: 1285, 2026: 1399 },
  [PacketId.Event]: { 2025: 45, 2026: 45 },
  [PacketId.Participants]: { 2025: 1284, 2026: 1470 },
  [PacketId.CarSetups]: { 2025: 1133, 2026: 1233 },
  [PacketId.CarTelemetry]: { 2025: 1352, 2026: 1448 },
  [PacketId.CarStatus]: { 2025: 1239, 2026: 1445 },
  [PacketId.FinalClassification]: { 2025: 1042, 2026: 1134 },
  [PacketId.LobbyInfo]: { 2025: 954, 2026: 1062 },
  [PacketId.CarDamage]: { 2025: 1041, 2026: 1133 },
  [PacketId.SessionHistory]: { 2025: 1460, 2026: 1460 },
  [PacketId.TyreSets]: { 2025: 231, 2026: 231 },
  [PacketId.MotionEx]: { 2025: 273, 2026: 273 },
  [PacketId.TimeTrial]: { 2025: 101, 2026: 104 },
  [PacketId.LapPositions]: { 2025: 1131, 2026: 1231 },
  [PacketId.CarTelemetry2]: { 2026: 269 },
};

export function getExpectedPacketSize(packetId: number, format: TelemetryFormat): number | undefined {
  return PACKET_SIZES[packetId as PacketId]?.[format];
}

export function getCarCount(format: TelemetryFormat): number {
  return format === 2026 ? MAX_CARS_2026 : MAX_CARS_2025;
}

export function resolveTelemetryFormat(
  header: PacketHeader,
  packetLength: number,
  sessionFormat?: TelemetryFormat,
): TelemetryFormat | null {
  if (header.packetFormat === 2026 || header.gameYear === 26) return 2026;

  const sizes = PACKET_SIZES[header.packetId as PacketId];
  if (!sizes) return null;

  if (sizes[2026] !== undefined && sizes[2026] !== sizes[2025] && packetLength === sizes[2026]) {
    return 2026;
  }

  if (sizes[2025] === sizes[2026] && sessionFormat) return sessionFormat;

  if (header.packetFormat === 2025 || header.gameYear === 25) return 2025;
  if (packetLength === sizes[2025]) return 2025;
  if (packetLength === sizes[2026]) return 2026;

  return sessionFormat ?? null;
}

export function hasValidPacketSize(packetId: number, format: TelemetryFormat, packetLength: number): boolean {
  return getExpectedPacketSize(packetId, format) === packetLength;
}
