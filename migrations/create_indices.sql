CREATE INDEX IF NOT EXISTS idx_person_display_dsc
ON person_list(display_name DESC);

CREATE INDEX IF NOT EXISTS idx_party_id
ON dataset(party_id);

CREATE INDEX IF NOT EXISTS idx_state_id
ON constituency_list_normalized(state_id);

CREATE INDEX IF NOT EXISTS idx_district_number
ON constituency_list_normalized(district_id);

CREATE INDEX IF NOT EXISTS idx_chamber_name
ON chamber_list(chamber_name);

CREATE INDEX IF NOT EXISTS idx_occasion_name
ON occasion_list(occasion_name);

CREATE INDEX IF NOT EXISTS idx_role_name
ON person_role_list(person_role_name);

CREATE INDEX IF NOT EXISTS idx_proceeding_name
ON proceeding_list(proceeding_name);

CREATE INDEX IF NOT EXISTS idx_state_name
ON states_list(state_name);

CREATE INDEX IF NOT EXISTS idx_district_number
ON district_list(district_number)
