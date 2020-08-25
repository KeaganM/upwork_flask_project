import sqlalchemy as db
from sqlalchemy import sql


def connect_db(path: str):
    engine = db.create_engine(path)
    connection = engine.connect()
    metadata = db.MetaData(engine)

    return engine, connection, metadata


def query_database(query, engine):
    with engine.connect() as connection:
        results = connection.execute(query)
        return results.fetchall()


def list_to_json(results, keys):
    json_list = list()
    json_dict = dict()
    for result in results:
        for item, nested_result in zip(keys, result):
            json_dict[item] = nested_result
        json_list.append(json_dict.copy())

    return json_list


def get_column_names(table_name, metadata, engine):
    table = db.Table(table_name, metadata, autoload=True, autoload_with=engine)

    return table.columns.keys()


if __name__ == "__main__":
    engine, connection, metadata = connect_db("sqlite:///../db/database_mock.db")
    basic_view = db.Table("basic_data_view", metadata, db.Column("speech_id", db.Integer, primary_key=True),
                          autoload=True)
    columns = basic_view.c

    for c in columns:
        print(c.name, type(c.type))

    data_map = {
        "text": sql.sqltypes.TEXT,
        "int": sql.sqltypes.INTEGER,
        "date": sql.sqltypes.Date
    }

    # query = "SELECT * FROM basic_data_view WHERE full_name = 'Katie Porter'"
    # q = query_database(query,connection)
    # print(q)
