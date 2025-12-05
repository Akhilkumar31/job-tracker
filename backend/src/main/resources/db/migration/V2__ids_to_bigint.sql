-- V2: Align DB column types with JPA @Id Long (BIGINT everywhere)

-- 1) Primary keys
ALTER TABLE users
  ALTER COLUMN id TYPE BIGINT USING id::BIGINT;

ALTER TABLE job_applications
  ALTER COLUMN id TYPE BIGINT USING id::BIGINT;

ALTER TABLE reminders
  ALTER COLUMN id TYPE BIGINT USING id::BIGINT;

-- 2) Foreign keys to users(id)
ALTER TABLE job_applications
  ALTER COLUMN owner_id TYPE BIGINT USING owner_id::BIGINT;

ALTER TABLE reminders
  ALTER COLUMN owner_id TYPE BIGINT USING owner_id::BIGINT;

-- 3) Foreign keys to job_applications(id)
ALTER TABLE reminders
  ALTER COLUMN application_id TYPE BIGINT USING application_id::BIGINT;

-- NOTE:
-- PostgreSQL sequences used by `serial` are BIGINT-capable already.
-- The default `nextval('...')` remains valid after type change.
