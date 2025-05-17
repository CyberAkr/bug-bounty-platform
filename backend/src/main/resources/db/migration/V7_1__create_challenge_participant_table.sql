CREATE TABLE challenge_participant (
                                       challenge_id BIGINT NOT NULL,
                                       researcher_id BIGINT NOT NULL,

                                       PRIMARY KEY (challenge_id, researcher_id),

                                       CONSTRAINT fk_participant_challenge FOREIGN KEY (challenge_id) REFERENCES challenge(challenge_id),
                                       CONSTRAINT fk_participant_user FOREIGN KEY (researcher_id) REFERENCES users(user_id)
);
