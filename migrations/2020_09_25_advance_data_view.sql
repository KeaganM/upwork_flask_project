DROP VIEW IF EXISTS advance_data_view;

-- want columns:
-- speech_text
-- word_count
-- full_name
-- state_name
-- district_number
-- heading_title
-- party name
-- chamber_name
-- proceeding_name
-- speech date

CREATE VIEW advance_data_view as 
SELECT 
speech_text,
speech_date,
word_count,
speaker_list.speaker_id,
first_name || ' ' || last_name as full_name,
constituency_list.constituency_id,
state_name,
district_number,
speaker_list.party_id,
party_name,
speech_list.chamber_id,
chamber_name,
hearing_title
-- speech_text,word_count
FROM speech_list
LEFT JOIN speaker_list on speaker_list.speaker_id = speech_list.speaker_id
-- full name
LEFT JOIN person_list on person_list.person_id = speaker_list.person_id
-- state name, district_number
LEFT JOIN constituency_list on constituency_list.constituency_id = speaker_list.constituency_id
-- party name
LEFT JOIN party_list on party_list.party_id = speaker_list.speaker_id
-- hearing title
LEFT JOIN hearing_speech on hearing_speech.speech_id = speech_list.speech_id
LEFT JOIN hearing_list on hearing_list.hearing_id = hearing_speech.hearing_id
LEFT JOIN chamber_list on speech_list.chamber_id = chamber_list.chamber_id ;

-- you need three helper views in this database:
-- one each to back out the speaker_id, the constituency_id and the party_id. 

-- (1) helper view to back out the speaker ID; populate autcomplete from DISTINCT(display_name).
CREATE VIEW person_list_view as 
SELECT speaker_id, display_name
FROM speaker_list sl
JOIN person_list pl
ON sl.person_id=pl.person_id;

-- (2) helper view to back out the constituency ID:
-- please use the table constituency_list and search through its state_name and district_number fields.

-- (3) helper view to back out the party ID: 
-- Not necessary, please reset the dropdown menu so that it passes the party ID through to the query (D=1, R=2, I=3).
