
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
