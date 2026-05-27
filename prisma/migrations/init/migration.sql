-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ═══════════════════════════════════════════
--  Prisma-managed tables (app core schema)
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sessions (
    id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sessionUID"      BIGINT NOT NULL,
    "trackId"         INTEGER NOT NULL,
    "sessionType"     INTEGER NOT NULL,
    weather           INTEGER NOT NULL,
    "totalLaps"       INTEGER NOT NULL,
    "trackLength"     INTEGER NOT NULL,
    formula           INTEGER NOT NULL,
    "airTemperature"  INTEGER NOT NULL,
    "trackTemperature" INTEGER NOT NULL,
    "safetyCarStatus" INTEGER NOT NULL DEFAULT 0,
    "networkGame"     INTEGER NOT NULL DEFAULT 0,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("sessionUID")
);

CREATE TABLE IF NOT EXISTS participants (
    id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sessionId"      TEXT NOT NULL REFERENCES sessions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    "carIndex"       INTEGER NOT NULL,
    "driverId"       INTEGER NOT NULL,
    "teamId"         INTEGER NOT NULL,
    "raceNumber"     INTEGER NOT NULL,
    nationality      INTEGER NOT NULL,
    name             TEXT NOT NULL,
    "aiControlled"   BOOLEAN NOT NULL DEFAULT false,
    platform         INTEGER NOT NULL DEFAULT 255,
    UNIQUE("sessionId", "carIndex")
);

CREATE TABLE IF NOT EXISTS events (
    id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sessionId"      TEXT NOT NULL REFERENCES sessions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    "eventCode"      TEXT NOT NULL,
    timestamp        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details          JSONB
);
CREATE INDEX IF NOT EXISTS "events_sessionId_eventCode_idx" ON events("sessionId", "eventCode");

CREATE TABLE IF NOT EXISTS final_classifications (
    id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sessionId"      TEXT NOT NULL REFERENCES sessions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    "carIndex"       INTEGER NOT NULL,
    position         INTEGER NOT NULL,
    "numLaps"        INTEGER NOT NULL,
    "gridPosition"   INTEGER NOT NULL,
    points           INTEGER NOT NULL,
    "numPitStops"    INTEGER NOT NULL,
    "resultStatus"   INTEGER NOT NULL,
    "bestLapTimeInMS" INTEGER NOT NULL,
    "totalRaceTime"  DOUBLE PRECISION NOT NULL,
    "penaltiesTime"  INTEGER NOT NULL,
    "tyreStints"     JSONB,
    UNIQUE("sessionId", "carIndex")
);

-- Telemetry samples hypertable (from CarTelemetry packets)
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
    drs             SMALLINT,
    rev_lights_percent SMALLINT,
    brakes_temp_rl  SMALLINT,
    brakes_temp_rr  SMALLINT,
    brakes_temp_fl  SMALLINT,
    brakes_temp_fr  SMALLINT,
    tyres_surface_temp_rl SMALLINT,
    tyres_surface_temp_rr SMALLINT,
    tyres_surface_temp_fl SMALLINT,
    tyres_surface_temp_fr SMALLINT,
    tyres_inner_temp_rl SMALLINT,
    tyres_inner_temp_rr SMALLINT,
    tyres_inner_temp_fl SMALLINT,
    tyres_inner_temp_fr SMALLINT,
    engine_temperature SMALLINT,
    tyres_pressure_rl REAL,
    tyres_pressure_rr REAL,
    tyres_pressure_fl REAL,
    tyres_pressure_fr REAL
);

SELECT create_hypertable('telemetry_samples', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_telemetry_session_car ON telemetry_samples (session_uid, car_index, time DESC);

-- Motion samples hypertable (from Motion packets)
CREATE TABLE IF NOT EXISTS motion_samples (
    time            TIMESTAMPTZ NOT NULL,
    session_uid     BIGINT NOT NULL,
    car_index       SMALLINT NOT NULL,
    world_position_x REAL,
    world_position_y REAL,
    world_position_z REAL,
    world_velocity_x REAL,
    world_velocity_y REAL,
    world_velocity_z REAL,
    g_force_lateral  REAL,
    g_force_longitudinal REAL,
    g_force_vertical REAL,
    yaw             REAL,
    pitch           REAL,
    roll            REAL
);

SELECT create_hypertable('motion_samples', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_motion_session_car ON motion_samples (session_uid, car_index, time DESC);

-- Lap data samples hypertable (from LapData packets)
CREATE TABLE IF NOT EXISTS lap_data_samples (
    time                    TIMESTAMPTZ NOT NULL,
    session_uid             BIGINT NOT NULL,
    car_index               SMALLINT NOT NULL,
    current_lap_time_ms     INTEGER,
    last_lap_time_ms        INTEGER,
    sector1_time_ms         INTEGER,
    sector2_time_ms         INTEGER,
    delta_to_car_in_front_ms INTEGER,
    delta_to_race_leader_ms  INTEGER,
    lap_distance            REAL,
    total_distance          REAL,
    car_position            SMALLINT,
    current_lap_num         SMALLINT,
    pit_status              SMALLINT,
    num_pit_stops           SMALLINT,
    sector                  SMALLINT,
    current_lap_invalid     SMALLINT,
    penalties               SMALLINT,
    driver_status           SMALLINT,
    result_status           SMALLINT,
    speed_trap_fastest_speed REAL,
    grid_position           SMALLINT
);

SELECT create_hypertable('lap_data_samples', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_lap_data_session_car ON lap_data_samples (session_uid, car_index, time DESC);

-- Car status samples hypertable (from CarStatus packets)
CREATE TABLE IF NOT EXISTS car_status_samples (
    time                    TIMESTAMPTZ NOT NULL,
    session_uid             BIGINT NOT NULL,
    car_index               SMALLINT NOT NULL,
    fuel_mix                SMALLINT,
    fuel_in_tank            REAL,
    fuel_capacity           REAL,
    fuel_remaining_laps     REAL,
    drs_allowed             SMALLINT,
    drs_activation_distance SMALLINT,
    actual_tyre_compound    SMALLINT,
    visual_tyre_compound    SMALLINT,
    tyres_age_laps          SMALLINT,
    vehicle_fia_flags       SMALLINT,
    engine_power_ice        REAL,
    engine_power_mguk       REAL,
    ers_store_energy        REAL,
    ers_deploy_mode         SMALLINT,
    ers_harvested_mguk      REAL,
    ers_harvested_mguh      REAL,
    ers_deployed_this_lap   REAL
);

SELECT create_hypertable('car_status_samples', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_car_status_session_car ON car_status_samples (session_uid, car_index, time DESC);

-- Car damage samples hypertable (from CarDamage packets)
CREATE TABLE IF NOT EXISTS car_damage_samples (
    time                    TIMESTAMPTZ NOT NULL,
    session_uid             BIGINT NOT NULL,
    car_index               SMALLINT NOT NULL,
    tyres_wear_rl           REAL,
    tyres_wear_rr           REAL,
    tyres_wear_fl           REAL,
    tyres_wear_fr           REAL,
    tyres_damage_rl         SMALLINT,
    tyres_damage_rr         SMALLINT,
    tyres_damage_fl         SMALLINT,
    tyres_damage_fr         SMALLINT,
    front_left_wing_damage  SMALLINT,
    front_right_wing_damage SMALLINT,
    rear_wing_damage        SMALLINT,
    floor_damage            SMALLINT,
    diffuser_damage         SMALLINT,
    sidepod_damage          SMALLINT,
    drs_fault               SMALLINT,
    ers_fault               SMALLINT,
    gearbox_damage          SMALLINT,
    engine_damage           SMALLINT
);

SELECT create_hypertable('car_damage_samples', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_car_damage_session_car ON car_damage_samples (session_uid, car_index, time DESC);

-- Enable compression on older data (compress chunks older than 1 day)
ALTER TABLE telemetry_samples SET (timescaledb.compress, timescaledb.compress_segmentby = 'session_uid, car_index');
SELECT add_compression_policy('telemetry_samples', INTERVAL '1 day', if_not_exists => TRUE);

ALTER TABLE motion_samples SET (timescaledb.compress, timescaledb.compress_segmentby = 'session_uid, car_index');
SELECT add_compression_policy('motion_samples', INTERVAL '1 day', if_not_exists => TRUE);

ALTER TABLE lap_data_samples SET (timescaledb.compress, timescaledb.compress_segmentby = 'session_uid, car_index');
SELECT add_compression_policy('lap_data_samples', INTERVAL '1 day', if_not_exists => TRUE);

ALTER TABLE car_status_samples SET (timescaledb.compress, timescaledb.compress_segmentby = 'session_uid, car_index');
SELECT add_compression_policy('car_status_samples', INTERVAL '1 day', if_not_exists => TRUE);

ALTER TABLE car_damage_samples SET (timescaledb.compress, timescaledb.compress_segmentby = 'session_uid, car_index');
SELECT add_compression_policy('car_damage_samples', INTERVAL '1 day', if_not_exists => TRUE);
