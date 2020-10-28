
-- create normalized states table 
DROP TABLE IF EXISTS states_list;
CREATE TABLE states_list (
	state_id INTEGER PRIMARY KEY AUTOINCREMENT,
	state_name TEXT
);

INSERT INTO states_list (state_name)
SELECT DISTINCT constituency_list.state_name
FROM constituency_list;

-- create normalized district_number TABLE
DROP TABLE IF EXISTS district_list;
CREATE TABLE district_list(
	district_id INTEGER PRIMARY KEY AUTOINCREMENT,
	district_number INTEGER
);

INSERT INTO district_list (district_number)
SELECT DISTINCT constituency_list.district_number
FROM constituency_list;

-- change constituency_list_normalized table 
DROP TABLE IF EXISTS constituency_list_normalized ;

CREATE TABLE constituency_list_normalized (
	constituency_id INTEGER PRIMARY KEY AUTOINCREMENT,
	state_id INTEGER,
	district_id INTEGER,
	FOREIGN KEY ("state_id") REFERENCES "states_list"("state_id")
	FOREIGN KEY ("district_id") REFERENCES "district_list"("district_id")
);

INSERT INTO constituency_list_normalized (state_id,district_id)
SELECT state_id,district_id
FROM constituency_list
INNER JOIN states_list on states_list.state_name = constituency_list.state_name
INNER JOIN district_list on district_list.district_number = constituency_list.district_number;

-- create new person_list table with desc VALUES
-- DROP TABLE IF EXISTS person_list_alt;
-- 
-- CREATE TABLE person_list_alt (
-- 	person_id INTEGER PRIMARY KEY AUTOINCREMENT,
-- 	display_name_asc TEXT,
-- 	display_name_dsc TEXT
-- );
-- 
-- SELECT display_name as dsp_name_asc, display_name as dsp_name_dsc
-- FROM person_list
-- ORDER BY 
-- 	dsp_name_asc ASC,
-- 	dsp_name_dsc DESC;
-- 
-- INSERT INTO person_list_alt (display_name_asc,display_name_dsc)
-- SELECT display_name as dsp_name_asc, display_name as dsp_name_dsc
