import sqlalchemy
from sqlalchemy import create_engine, Table, MetaData
from sqlalchemy.orm import sessionmaker
from typing import Union, Tuple, List
from dataclasses import dataclass

import pandas as pd

from datetime import datetime

import re


@dataclass
class HelperTableMap:
    table_name: str
    column_to_join: str
    column_to_query: str
    _select_to_change: Union[None,str] = None

    @property
    def select_to_change(self):
        return self.column_to_query if not self._select_to_change else self._select_to_change






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
    def __init__(self, raw_data: dict, tablename_or_joins: str, limit: Union[int, None] = None,
                 helpers: Union[List[dict], None] = None) -> None:
        self.raw_data = raw_data
        self.table_name = tablename_or_joins
        self.limit = limit
        self.helpers = helpers

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

    def _create_joins(self):
        return [f'JOIN {item.table_name} on {self.table_name}.{item.column_to_join} = {item.table_name}.{item.column_to_join}' for item in self.helpers]


    def _create_query(self, query_parts_dict: dict) -> str:
        query_list = ["SELECT",
                      *query_parts_dict["select_statement"],
                      f"FROM {self.table_name}",
                      *self._create_joins(),
                      *query_parts_dict["where"],
                      *query_parts_dict["first_where_statement"],
                      *query_parts_dict["where_statement"]]

        # if self.helpers:
        #     joins = self._create_joins()
        #     query_list.insert(2,*joins)

        if self.limit != None:
            query_list.append(f"LIMIT {self.limit}")

        query = " ".join(query_list)

        return query

    def parse(self, return_columns: bool = True, **kwargs) -> str:
        data = {
            "select": self.raw_data["select"],
            "where": self.raw_data["where"]
        }

        query_parts = dict()

        query_parts["select_statement"] = self._parse_select_part(data["select"])
        query_parts["where_statement"], \
        query_parts["first_where_statement"], \
        query_parts["where"] = self._parse_where_part(data["where"], ("", "choose a value", "choose"))

        if return_columns:
            return self._create_query(query_parts), [column.replace(",", "") for column in
                                                     query_parts["select_statement"]]
        return self._create_query(query_parts)


class QueryFilter:
    def __init__(self, where_data: List[dict],select_data: List[str], empty_values: list = ['', 'choose a value', 'choose']):
        self.where_data = where_data
        self.empty_values = empty_values
        self.select_data = select_data


    def reformat_date(self, date_column: str, from_format: str, to_format: str = '%Y-%m-%d') -> List[dict]:
        # todo: assuiming you are passing in the correct format; may want to handle a bit better later; need to let it run over multiple items
        item = list(filter(lambda item: item['field'] == date_column, self.where_data))[0]

        if item['value'].lower() in self.empty_values:
            return self.where_data

        index = [index for index, where_item in enumerate(self.where_data) if where_item['field'] == date_column][0]
        item['value'] = datetime.strptime(item['value'], from_format).strftime(to_format)

        self.where_data[index] = item
        return self.where_data

    def remap_query_inputs(self, helper_table_maps: Union[HelperTableMap]) -> Tuple[List[dict],List[str]]:
        new_where_data = list()
        new_select_data = self.select_data[:]

        changed_selected_data = list()


        for data in self.where_data:
            new_where_data.append(data)
            for item in helper_table_maps:
                if data['field'] == item.column_to_query:
                    new_where_data[-1]['field'] = f'{item.table_name}.{item.column_to_query}'
                    if item.select_to_change not in changed_selected_data:
                        changed_selected_data.append(item.select_to_change)
                        if item.select_to_change:
                            new_select_data[new_select_data.index(item.select_to_change)] = f'{item.table_name}.{item.select_to_change}'
                        else:
                            new_select_data[new_select_data.index(item.column_to_query)] = f'{item.table_name}.{item.column_to_query}' if item.column_to_query in new_select_data else new_select_data[new_select_data.index(item.column_to_query)]

        return new_where_data,new_select_data


if __name__ == "__main__":
    helpers = [
        HelperTableMap(table_name='person_list_view', column_to_join='speaker_id', column_to_query='display_name'),
        HelperTableMap('party_list', 'party_id', 'party_id','party_name'),
    ]

    data = {

        'where':
            [
                {'logic_operator': 'AND', 'field': 'display_name', 'value': 'Ted Cruz', 'conditional': '='},
                {'logic_operator': 'AND', 'field': 'district', 'value': 'Choose a Value', 'conditional': '='},
                {'logic_operator': 'AND', 'field': 'state_name', 'value': 'Choose A Value', 'conditional': '='},
                {'logic_operator': 'AND', 'field': 'party_id', 'value': '1', 'conditional': '='},
                {'logic_operator': 'AND', 'field': 'speech_date', 'value': '', 'conditional': '='},
                {'logic_operator': 'AND', 'field': 'district', 'value': '', 'conditional': '='},
                {'logic_operator': 'AND', 'field': 'display_name', 'value': 'Ted Budd', 'conditional': '='},
            ],
        'select':
            [
                'display_name',
                'party_name',
                'speech_text',
                'speech_date',
            ]
    }

    query_filter = QueryFilter(data['where'],data['select'], ['', 'choose a value'])
    data['where'] = query_filter.reformat_date(date_column='speech_date', from_format='%b %d, %Y')

    for item in data['where']:
        print(item)

    data['where'],data['select'] = query_filter.remap_query_inputs(helpers)
    print(data['where'])
    print(data['select'])

    query_parser = QueryParser(data, "advance_data_view", 100,helpers)
    query, columns = query_parser.parse(return_columns=True)
    print(query)

    # query_results = db.query(query, connect_and_close=True)
    # query_results_json = db.query_results_to_json(query_results, columns)
    # print(query_results_json)
    #
    # df = pd.DataFrame(data=query_results_json)
    # print(df)
