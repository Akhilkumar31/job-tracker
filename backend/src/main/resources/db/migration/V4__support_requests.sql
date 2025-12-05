CREATE TABLE IF NOT EXISTS support_requests (
    id         BIGSERIAL PRIMARY KEY,
    owner_id   BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    subject    VARCHAR(255) NOT NULL,
    type       VARCHAR(64)  NOT NULL,
    message    TEXT         NOT NULL,
    email      VARCHAR(255) NOT NULL,
    status     VARCHAR(32)  NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
