const test = require('node:test');
const assert = require('node:assert/strict');

const { PacketId } = require('../src/lib/constants.ts');
const {
  getExpectedPacketSize,
  hasValidPacketSize,
  resolveTelemetryFormat,
} = require('../src/server/parser/format.ts');
const { parseMotionData } = require('../src/server/parser/motion.ts');
const { parseSessionData } = require('../src/server/parser/session.ts');
const { parseLapData } = require('../src/server/parser/lap-data.ts');
const { parseParticipantsData } = require('../src/server/parser/participants.ts');
const { parseCarSetupData } = require('../src/server/parser/car-setup.ts');
const { parseCarTelemetryData } = require('../src/server/parser/car-telemetry.ts');
const { parseCarStatusData } = require('../src/server/parser/car-status.ts');
const { parseFinalClassificationData } = require('../src/server/parser/final-classification.ts');
const { parseCarDamageData } = require('../src/server/parser/car-damage.ts');
const { parseLapPositionsData } = require('../src/server/parser/lap-positions.ts');
const { parseTimeTrialData } = require('../src/server/parser/time-trial.ts');
const { parseEventData } = require('../src/server/parser/event.ts');
const { parseCarTelemetry2Data } = require('../src/server/parser/car-telemetry2.ts');

function header(packetId, format = 2025, gameYear = format === 2026 ? 26 : 25) {
  return {
    packetFormat: format,
    gameYear,
    gameMajorVersion: 1,
    gameMinorVersion: 0,
    packetVersion: 1,
    packetId,
    sessionUID: 1n,
    sessionTime: 0,
    frameIdentifier: 1,
    overallFrameIdentifier: 1,
    playerCarIndex: 0,
    secondaryPlayerCarIndex: 255,
  };
}

function packet(packetId, format) {
  return Buffer.alloc(getExpectedPacketSize(packetId, format));
}

test('matches the official packet sizes for both formats', () => {
  const expected = {
    [PacketId.Motion]: [1349, 1325],
    [PacketId.Session]: [753, 926],
    [PacketId.LapData]: [1285, 1399],
    [PacketId.Event]: [45, 45],
    [PacketId.Participants]: [1284, 1470],
    [PacketId.CarSetups]: [1133, 1233],
    [PacketId.CarTelemetry]: [1352, 1448],
    [PacketId.CarStatus]: [1239, 1445],
    [PacketId.FinalClassification]: [1042, 1134],
    [PacketId.LobbyInfo]: [954, 1062],
    [PacketId.CarDamage]: [1041, 1133],
    [PacketId.SessionHistory]: [1460, 1460],
    [PacketId.TyreSets]: [231, 231],
    [PacketId.MotionEx]: [273, 273],
    [PacketId.TimeTrial]: [101, 104],
    [PacketId.LapPositions]: [1131, 1231],
  };

  for (const [packetId, [size2025, size2026]] of Object.entries(expected)) {
    assert.equal(getExpectedPacketSize(Number(packetId), 2025), size2025);
    assert.equal(getExpectedPacketSize(Number(packetId), 2026), size2026);
  }
  assert.equal(getExpectedPacketSize(PacketId.CarTelemetry2, 2025), undefined);
  assert.equal(getExpectedPacketSize(PacketId.CarTelemetry2, 2026), 269);
});

test('resolves explicit, size-inferred, and session-cached formats', () => {
  assert.equal(resolveTelemetryFormat(header(PacketId.Motion, 2025), 1349), 2025);
  assert.equal(resolveTelemetryFormat(header(PacketId.Motion, 2026), 1325), 2026);

  const staleHeader = header(PacketId.Motion, 2025, 25);
  assert.equal(resolveTelemetryFormat(staleHeader, 1325), 2026);

  const equalSizeEvent = header(PacketId.Event, 2025, 25);
  assert.equal(resolveTelemetryFormat(equalSizeEvent, 45, 2026), 2026);
  assert.equal(resolveTelemetryFormat(equalSizeEvent, 45), 2025);

  assert.equal(hasValidPacketSize(PacketId.Motion, 2025, 999), false);
  assert.equal(hasValidPacketSize(PacketId.Motion, 2026, 1325), true);
});

test('parses every car slot for both formats', () => {
  for (const format of [2025, 2026]) {
    const cars = format === 2026 ? 24 : 22;

    const motion = parseMotionData(packet(PacketId.Motion, format), header(PacketId.Motion, format), format);
    assert.equal(motion.carMotionData.length, cars);

    const lapBuffer = packet(PacketId.LapData, format);
    lapBuffer.writeUInt8(77, 29 + cars * 57);
    const lap = parseLapData(lapBuffer, header(PacketId.LapData, format), format);
    assert.equal(lap.lapData.length, cars);
    assert.equal(lap.timeTrialPBCarIdx, 77);

    const participantBuffer = packet(PacketId.Participants, format);
    const participantSize = format === 2026 ? 60 : 57;
    participantBuffer.writeUInt8(cars, 29);
    const lastParticipant = 30 + (cars - 1) * participantSize;
    if (format === 2026) participantBuffer.writeUInt16LE(513, lastParticipant + 5);
    else participantBuffer.writeUInt8(9, lastParticipant + 3);
    const participants = parseParticipantsData(
      participantBuffer,
      header(PacketId.Participants, format),
      format,
    );
    assert.equal(participants.participants.length, cars);
    assert.equal(participants.numActiveCars, cars);
    assert.equal(participants.participants[cars - 1].teamId, format === 2026 ? 513 : 9);

    const setupBuffer = packet(PacketId.CarSetups, format);
    setupBuffer.writeUInt8(42, 29 + (cars - 1) * 50);
    const setups = parseCarSetupData(setupBuffer, header(PacketId.CarSetups, format), format);
    assert.equal(setups.carSetupData.length, cars);
    assert.equal(setups.carSetupData[cars - 1].frontWing, 42);

    const telemetryBuffer = packet(PacketId.CarTelemetry, format);
    const telemetrySize = format === 2026 ? 59 : 60;
    telemetryBuffer.writeUInt16LE(321, 29 + (cars - 1) * telemetrySize);
    const telemetry = parseCarTelemetryData(
      telemetryBuffer,
      header(PacketId.CarTelemetry, format),
      format,
    );
    assert.equal(telemetry.carTelemetryData.length, cars);
    assert.equal(telemetry.carTelemetryData[cars - 1].speed, 321);

    const status = parseCarStatusData(
      packet(PacketId.CarStatus, format),
      header(PacketId.CarStatus, format),
      format,
    );
    assert.equal(status.carStatusData.length, cars);

    const classificationBuffer = packet(PacketId.FinalClassification, format);
    classificationBuffer.writeUInt8(cars, 29);
    classificationBuffer.writeUInt8(24, 30 + (cars - 1) * 46);
    const classification = parseFinalClassificationData(
      classificationBuffer,
      header(PacketId.FinalClassification, format),
      format,
    );
    assert.equal(classification.classificationData.length, cars);
    assert.equal(classification.classificationData[cars - 1].position, 24);

    const damageBuffer = packet(PacketId.CarDamage, format);
    damageBuffer.writeFloatLE(88.5, 29 + (cars - 1) * 46);
    const damage = parseCarDamageData(damageBuffer, header(PacketId.CarDamage, format), format);
    assert.equal(damage.carDamageData.length, cars);
    assert.equal(damage.carDamageData[cars - 1].tyresWear[0], 88.5);

    const positionsBuffer = packet(PacketId.LapPositions, format);
    positionsBuffer.writeUInt8(24, 31 + cars - 1);
    const positions = parseLapPositionsData(
      positionsBuffer,
      header(PacketId.LapPositions, format),
      format,
    );
    assert.equal(positions.positionForVehicleIdx[0].length, cars);
    assert.equal(positions.positionForVehicleIdx[0][cars - 1], 24);
  }
});

test('parses common session fields and the 2026 extension at specification offsets', () => {
  const session2025 = packet(PacketId.Session, 2025);
  session2025.writeUInt8(2, 726);
  session2025.writeUInt8(6, 732);
  session2025.writeFloatLE(1234.5, 745);
  session2025.writeFloatLE(3456.5, 749);
  const parsed2025 = parseSessionData(session2025, header(PacketId.Session, 2025), 2025);
  assert.equal(parsed2025.safetyCarExperience, 2);
  assert.equal(parsed2025.numSessionsInWeekend, 6);
  assert.equal(parsed2025.sector2LapDistanceStart, 1234.5);
  assert.equal(parsed2025.sector3LapDistanceStart, 3456.5);

  const session2026 = packet(PacketId.Session, 2026);
  session2026.writeFloatLE(1234.5, 745);
  session2026.writeUInt8(1, 753);
  session2026.writeUInt8(1, 754);
  session2026.writeFloatLE(0.25, 755);
  session2026.writeFloatLE(0.5, 759);
  session2026.writeUInt8(1, 884);
  session2026.writeFloatLE(0.6, 885);
  session2026.writeFloatLE(0.7, 889);
  session2026.writeFloatLE(0.19, 917);
  const parsed2026 = parseSessionData(session2026, header(PacketId.Session, 2026), 2026);
  assert.equal(parsed2026.sector2LapDistanceStart, 1234.5);
  assert.equal(parsed2026.activeAeroTrackStatus, 1);
  assert.equal(parsed2026.numActiveAeroZonesFull, 1);
  assert.deepEqual(parsed2026.activeAeroZonesFull[0], { zoneStart: 0.25, zoneEnd: 0.5 });
  assert.equal(parsed2026.numDrsZones, 1);
  assert.ok(Math.abs(parsed2026.startReactionTime - 0.19) < 0.00001);
});

test('parses fields whose widths or presence changed in 2026', () => {
  const telemetry2025 = packet(PacketId.CarTelemetry, 2025);
  telemetry2025.writeUInt16LE(1024, 29 + 38);
  assert.equal(
    parseCarTelemetryData(telemetry2025, header(PacketId.CarTelemetry, 2025), 2025)
      .carTelemetryData[0].engineTemperature,
    1024,
  );

  const telemetry2026 = packet(PacketId.CarTelemetry, 2026);
  telemetry2026.writeUInt8(210, 29 + 38);
  assert.equal(
    parseCarTelemetryData(telemetry2026, header(PacketId.CarTelemetry, 2026), 2026)
      .carTelemetryData[0].engineTemperature,
    210,
  );

  const status2026 = packet(PacketId.CarStatus, 2026);
  status2026.writeFloatLE(4000000, 29 + 50);
  assert.equal(
    parseCarStatusData(status2026, header(PacketId.CarStatus, 2026), 2026)
      .carStatusData[0].ersHarvestLimitPerLap,
    4000000,
  );

  const timeTrial2026 = packet(PacketId.TimeTrial, 2026);
  timeTrial2026.writeUInt16LE(513, 30);
  assert.equal(
    parseTimeTrialData(timeTrial2026, header(PacketId.TimeTrial, 2026), 2026)
      .playerSessionBestDataSet.teamId,
    513,
  );

  const collision2026 = packet(PacketId.Event, 2026);
  collision2026.write('COLL', 29, 'ascii');
  collision2026.writeUInt8(3, 33);
  collision2026.writeUInt8(7, 34);
  collision2026.writeUInt8(2, 35);
  assert.deepEqual(
    parseEventData(collision2026, header(PacketId.Event, 2026), 2026).eventDetails.collision,
    { vehicle1Idx: 3, vehicle2Idx: 7, severity: 2 },
  );

  const telemetry2Buffer = packet(PacketId.CarTelemetry2, 2026);
  telemetry2Buffer.writeUInt8(1, 29);
  telemetry2Buffer.writeUInt8(0, 30);
  telemetry2Buffer.writeUInt8(1, 37);
  const telemetry2 = parseCarTelemetry2Data(
    telemetry2Buffer,
    header(PacketId.CarTelemetry2, 2026),
    2026,
  );
  assert.equal(telemetry2.carTelemetry2Data.length, 24);
  assert.equal(telemetry2.carTelemetry2Data[0].activeAeroMode, 1);
  assert.equal(telemetry2.carTelemetry2Data[0].activeAeroAvailable, 0);
  assert.equal(telemetry2.carTelemetry2Data[0].regulations2026, 1);
});
