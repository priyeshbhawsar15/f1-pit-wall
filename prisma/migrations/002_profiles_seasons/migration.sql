-- Add human_profiles table
CREATE TABLE IF NOT EXISTS human_profiles (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name          TEXT NOT NULL,
    color         TEXT NOT NULL DEFAULT '#E10600',
    "avatarUrl"   TEXT,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add seasons table
CREATE TABLE IF NOT EXISTS seasons (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name          TEXT NOT NULL,
    "startDate"   TIMESTAMPTZ,
    "endDate"     TIMESTAMPTZ,
    "isActive"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add season_races join table
CREATE TABLE IF NOT EXISTS season_races (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "seasonId"    TEXT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    "sessionId"   TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE("seasonId", "sessionId")
);

-- Add humanProfileId to participants
ALTER TABLE participants
    ADD COLUMN IF NOT EXISTS "humanProfileId" TEXT REFERENCES human_profiles(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_season_races_season ON season_races("seasonId");
CREATE INDEX IF NOT EXISTS idx_season_races_session ON season_races("sessionId");
CREATE INDEX IF NOT EXISTS idx_participants_human_profile ON participants("humanProfileId");
