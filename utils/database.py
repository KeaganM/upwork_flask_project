import sqlalchemy
from sqlalchemy import create_engine, Table, MetaData
from sqlalchemy.orm import sessionmaker
from typing import Union, Tuple, List

import pandas as pd

from datetime import datetime


class Database():
    def __init__(self,
                 drivername: Union[str, None] = None,
                 username: Union[str, None] = None,
                 password: Union[str, None] = None,
                 database: Union[str, None] = None,
                 host: str = "localhost",
                 port: str = "5432",
                 path: Union[str, None] = None,
                 create_connection: bool = True) -> None:

        self.engine = create_engine(f"{drivername}://{username}:{password}@{host}:{port}/{database}",
                                    echo=True) if path == None else create_engine(path)
        self.connection = self.engine.connect() if create_connection else None
        self.metadata = MetaData(self.engine)

    def connect(self):
        self.connection = self.engine.connect()

    def end_connection(self):
        self.connection.close()

    def session(self):
        Session = sessionmaker()
        Session.configure(bind=self.engine)
        return Session()

    def query(self, query: str, connect_and_close: bool = False) -> list:
        if connect_and_close:
            self.connection = self.engine.connect()
            results = self.connection.execute(query).fetchall()
            self.connection.close()
        else:
            results = self.connection.execute(query).fetchall()
        return results

    def get_column_names(self, table_name: str, ) -> list:
        table = Table(table_name, self.metadata, autoload=True, autoload_with=self.engine)
        return table.columns.keys()

    def query_results_to_json(self, results: list, selected_columns: list) -> dict:
        json_list = list()
        json_dict = dict()
        for result in results:
            for item, nested_result in zip(selected_columns, result):
                json_dict[item] = nested_result
            json_list.append(json_dict.copy())

        return json_list


class QueryParser():
    def __init__(self, raw_data: dict, tablename_or_joins: str, limit: Union[int, None] = None) -> None:
        self.raw_data = raw_data
        self.table_name = tablename_or_joins
        self.limit = limit

    def _parse_select_part(self, select_data: dict) -> list:
        return [f"{item}," if index + 1 < len(select_data) else item for index, item in
                enumerate(select_data)] if len(select_data) >= 1 else ["*"]

    def _parse_where_part(self, where_data: List[dict], empty_values: tuple = (""), ) -> Tuple[list, list, list]:

        where_parts = [
            f"{item['logic_operator']} {item['field']} {item['conditional']} \'{item['value']}\'" for
            item in where_data if item["value"].lower() not in empty_values]

        first_where = list()
        where = list()
        if len(where_parts) >= 1:
            first_where = [
                where_parts.pop(0).replace("AND", "").replace("OR", "")]
            where = ["WHERE"]

        return where_parts, first_where, where

    def _create_query(self, query_parts_dict: dict) -> str:
        query_list = ["SELECT",
                      *query_parts_dict["select_statement"],
                      f"FROM {self.table_name}",
                      *query_parts_dict["where"],
                      *query_parts_dict["first_where_statement"],
                      *query_parts_dict["where_statement"]]
        if self.limit != None:
            query_list.append(f"LIMIT {self.limit}")

        return " ".join(query_list)

    def parse(self, return_columns: bool = True, **kwargs) -> str:
        data = {
            "select": self.raw_data["select"],
            "where": self.raw_data["where"]
        }

        query_parts = dict()

        query_parts["select_statement"] = self._parse_select_part(data["select"])
        query_parts["where_statement"], \
        query_parts["first_where_statement"], \
        query_parts["where"] = self._parse_where_part(data["where"], ("", "choose a value","choose"))

        if return_columns:
            return self._create_query(query_parts), [column.replace(",", "") for column in
                                                     query_parts["select_statement"]]
        return self._create_query(query_parts)


class QueryFilter:
    def __init__(self, where_data: List[dict], empty_values: list = ['', 'choose a value','choose']):
        self.where_data = where_data
        self.empty_values = empty_values

    def reformat_date(self, date_column: str, from_format: str, to_format: str = '%Y-%m-%d') -> List[dict]:
        # todo: assuiming you are passing in the correct format; may want to handle a bit better later; need to let it run over multiple items
        item = list(filter(lambda item: item['field'] == date_column, self.where_data))[0]

        if item['value'].lower() in self.empty_values:
            return self.where_data

        index = [index for index, where_item in enumerate(self.where_data) if where_item['field'] == date_column][0]
        item['value'] = datetime.strptime(item['value'], from_format).strftime(to_format)

        self.where_data[index] = item
        return self.where_data


if __name__ == "__main__":
    path = "sqlite:///../static/db/database.db"

    db = Database(path=path)
    r = db.query('SELECT * FROM advance_data_view LIMIT 100',True)
    print(r)

    quit()

    # base_table = sqlalchemy.Table('speech_list', db.metadata, autoload=True)
    #
    # desired_fields = ['person_list.full_name', 'speech_list.speech_text']

    # tables = db.engine.table_names()
    # print(tables)
    # quit()

    # view_query = [
    #     'DROP VIEW IF EXISTS data_view;CREATE VIEW data_view AS SELECT',
    #     *[f'{item},' if index + 1 == len(desired_fields) else item for index, item in enumerate(desired_fields)],
    #     f'FROM {base_table.name}'
    # ]
    #
    # tables_to_join = list()
    # for table in tables:
    #     table_object = sqlalchemy.Table(table, db.metadata, autoload=True)
    #     if desired_fields[0] in [str(c) for c in table_object.c] and table_object.name != base_table.name:
    #         # print(f"found in table {table}")
    #         tables_to_join.append(table_object)

    # print(str(list(base_table.foreign_keys)[0]).split('.')[0].split('\'')[1])
    # print(base_table.primary_key.columns.values()[0].name)

    # for f_key in base_table.foreign_keys:
    #     print(f'on {f_key}')
    #
    #     raw = str(f_key).split('.')
    #     table = raw[0].split('\'')[1]
    #     f_key = raw[1].split('\'')[0]
    #
    #     table_object = sqlalchemy.Table(table,db.metadata,autoload=True)
    #     p_key = table_object.primary_key.columns.values()[0].name
    #
    #     if f_key == p_key:
    #         print(f'table {table} is a match!')
    #         quit()

    # for table in tables:
    #     print(f'on table {table}')
    #     table_object = sqlalchemy.Table(table, db.metadata, autoload=True)
    #     f_key_str = str(f_key).split('.')[1].split('\'')[1]
    #     print(f_key_str)

    # try:
    #     p_key_str = table_object.primary_key.columns.values()[0].name
    # except IndexError:
    #     print("did not find a primary key")
    #     continue
    # print(f"fkey is {f_key_str}\npkey is {p_key_str}")
    # if f_key_str == p_key_str:
    #     print(f'{f_key_str} matached to {p_key_str}')
    #     quit()
    # print(''.join(['*' for x in range(200)]))

    # print(tables_to_join)

    # test = sqlalchemy.Table('constituency_characteristics', db.metadata, autoload=True)
    # print(test.primary_key)

    # print(test)
    #
    # columns = test.c
    # primary_key = test.primary_key
    # for_keys = test.foreign_keys
    #
    # print("columns")
    # for c in columns:
    #     print(c.name, type(c.type))
    #
    # print('primary keys')
    # for key in primary_key:
    #     print(key)
    #
    # print('f keys')
    # for f_key in for_keys:
    #     print(f_key)

    data = {

        'where':
            [
                {'logic_operator': 'AND', 'field': 'full_name', 'value': '', 'conditional': '='},
                {'logic_operator': 'AND', 'field': 'district', 'value': 'Choose a Value', 'conditional': '='},
                {'logic_operator': 'AND', 'field': 'state_name', 'value': 'Choose A Value', 'conditional': '='},
                {'logic_operator': 'AND', 'field': 'party_name', 'value': 'Choose A Value', 'conditional': '='},
                {'logic_operator': 'AND', 'field': 'speech_date', 'value': '', 'conditional': '='},
                {'logic_operator': 'AND', 'field': 'district', 'value': '', 'conditional': '='}
            ],
        'select':
            [
                'full_name',
                'party_name',
                'speech_text',
                'speech_date'
            ]
    }

    query_filter = QueryFilter(data['where'], ['', 'choose a value'])
    data['where'] = query_filter.reformat_date(date_column='speech_date', from_format='%b %d, %Y')
    for item in data['where']:
        print(item)
    quit()

    query_parser = QueryParser(data, "advance_data_view", 100)
    query, columns = query_parser.parse(return_columns=True)
    print(query)

    query_results = db.query(query, connect_and_close=True)
    query_results_json = db.query_results_to_json(query_results, columns)
    print(query_results_json)

    df = pd.DataFrame(data=query_results_json)
    print(df)
