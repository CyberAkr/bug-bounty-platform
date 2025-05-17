CREATE TABLE user_badge (
                            badge_id BIGINT NOT NULL,
                            researcher_id BIGINT NOT NULL,
                            PRIMARY KEY (badge_id, researcher_id),

                            CONSTRAINT fk_user_badge_badge FOREIGN KEY (badge_id) REFERENCES badge(badge_id),
                            CONSTRAINT fk_user_badge_user FOREIGN KEY (researcher_id) REFERENCES users(user_id)
);
