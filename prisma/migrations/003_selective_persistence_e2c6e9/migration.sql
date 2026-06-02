DO $$
BEGIN
  IF to_regclass('public.telemetry_samples') IS NOT NULL THEN
    PERFORM remove_compression_policy('telemetry_samples', if_exists => TRUE);
  END IF;
END
$$;

ALTER TABLE IF EXISTS telemetry_samples RENAME TO telemetry_samples_old_e2c6e9;

CREATE TABLE IF NOT EXISTS telemetry_samples (
    time            TIMESTAMPTZ NOT NULL,
    session_uid     BIGINT NOT NULL,
    car_index       SMALLINT NOT NULL,
    speed           SMALLINT,
    throttle        REAL,
    steer           REAL,
    brake           REAL,
    clutch          SMALLINT,
    gear            SMALLINT,
    engine_rpm      SMALLINT,
    drs             SMALLINT
);

SELECT create_hypertable('telemetry_samples', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_telemetry_session_car_slim ON telemetry_samples (session_uid, car_index, time DESC);

INSERT INTO telemetry_samples (time, session_uid, car_index, speed, throttle, steer, brake, clutch, gear, engine_rpm, drs)
SELECT t.time, t.session_uid, t.car_index, t.speed, t.throttle, t.steer, t.brake, t.clutch, t.gear, t.engine_rpm, t.drs
FROM telemetry_samples_old_e2c6e9 t
JOIN sessions s ON s."sessionUID" = t.session_uid
JOIN participants p ON p."sessionId" = s.id AND p."carIndex" = t.car_index
WHERE p."aiControlled" = false;

ALTER TABLE telemetry_samples SET (timescaledb.compress, timescaledb.compress_segmentby = 'session_uid, car_index');
SELECT add_compression_policy('telemetry_samples', INTERVAL '1 day', if_not_exists => TRUE);

DROP TABLE IF EXISTS telemetry_samples_old_e2c6e9 CASCADE;

DO $$
BEGIN
  IF to_regclass('public.car_status_samples') IS NOT NULL THEN
    PERFORM remove_compression_policy('car_status_samples', if_exists => TRUE);
    DROP TABLE car_status_samples;
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.car_damage_samples') IS NOT NULL THEN
    PERFORM remove_compression_policy('car_damage_samples', if_exists => TRUE);
  END IF;
END
$$;

ALTER TABLE IF EXISTS car_damage_samples RENAME TO car_damage_samples_old_e2c6e9;

CREATE TABLE IF NOT EXISTS car_damage_samples (
    time                    TIMESTAMPTZ NOT NULL,
    session_uid             BIGINT NOT NULL,
    car_index               SMALLINT NOT NULL,
    tyres_wear_rl           REAL,
    tyres_wear_rr           REAL,
    tyres_wear_fl           REAL,
    tyres_wear_fr           REAL,
    front_left_wing_damage  SMALLINT,
    front_right_wing_damage SMALLINT,
    rear_wing_damage        SMALLINT,
    floor_damage            SMALLINT,
    gearbox_damage          SMALLINT,
    engine_damage           SMALLINT
);

SELECT create_hypertable('car_damage_samples', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_car_damage_session_car_slim ON car_damage_samples (session_uid, car_index, time DESC);

INSERT INTO car_damage_samples (
  time,
  session_uid,
  car_index,
  tyres_wear_rl,
  tyres_wear_rr,
  tyres_wear_fl,
  tyres_wear_fr,
  front_left_wing_damage,
  front_right_wing_damage,
  rear_wing_damage,
  floor_damage,
  gearbox_damage,
  engine_damage
)
SELECT
  d.time,
  d.session_uid,
  d.car_index,
  d.tyres_wear_rl,
  d.tyres_wear_rr,
  d.tyres_wear_fl,
  d.tyres_wear_fr,
  d.front_left_wing_damage,
  d.front_right_wing_damage,
  d.rear_wing_damage,
  d.floor_damage,
  d.gearbox_damage,
  d.engine_damage
FROM car_damage_samples_old_e2c6e9 d
JOIN sessions s ON s."sessionUID" = d.session_uid
JOIN participants p ON p."sessionId" = s.id AND p."carIndex" = d.car_index
WHERE p."aiControlled" = false;

ALTER TABLE car_damage_samples SET (timescaledb.compress, timescaledb.compress_segmentby = 'session_uid, car_index');
SELECT add_compression_policy('car_damage_samples', INTERVAL '1 day', if_not_exists => TRUE);

DROP TABLE IF EXISTS car_damage_samples_old_e2c6e9 CASCADE;
