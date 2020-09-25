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
first_name || ' ' || last_name as full_name,
state_name,
district_number,
party_name,
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
LEFT JOIN hearing_list on hearing_list.hearing_id = hearing_speech.hearing_id;



