import json

from flask import render_template, request, session, make_response
from forms import BasicQueryForm
import pandas as pd

from config import application, db
from utils.database import QueryParser, QueryFilter
from utils.utils import truncate

# from models import AdvanceDataView
from utils.database import HelperTableMap


# TODO may want to seperate this out and make the querying part into an api
@application.route('/', methods=["GET", "POST"])
def base():
    # hard coded helper tables
    helpers = [
        HelperTableMap('person_list_view', 'speaker_id', 'display_name'),
        HelperTableMap('party_list', 'party_id', 'party_id', 'party_name'),
        HelperTableMap('states_list', 'state_id', 'state_id', 'state_name'),
        # HelperTableMap('district_list', 'district_id', 'district_id','district_number'),
    ]

    basic_form = BasicQueryForm()
    if request.method == "POST":

        raw_data = request.json["data"]
        print('raw data is:')
        print(raw_data)
        query_filter = QueryFilter(raw_data['where'], raw_data['select'])
        raw_data['where'] = query_filter.reformat_date(date_column='speech_date',
                                                       from_format='%b %d, %Y')
        raw_data['where'], raw_data['select'] = query_filter.remap_query_inputs(helpers)
        print(raw_data['where'])

        query, columns = QueryParser(raw_data, "advance_data_view", 500, helpers).parse()
        print(f'query is:\n {query}')
        results = db.query(query, connect_and_close=True)

        if len(results) < 1:
            return json.dumps({"data": "no records found", "length": 0, "query": query})
        results_list = db.query_results_to_json(results, columns)

        if "speech_text" in results_list[0].keys():
            for item in results_list:
                item["speech_text_truncated"] = truncate(item["speech_text"])

        session["current_query"] = query
        session['current_columns'] = columns

        return json.dumps({"data": results_list, "length": len(results_list), "query": query})
    else:
        return render_template("home.html", basic_form=basic_form)


# todo may want to add a post method functionality
@application.route("/api/v1/database/csv", methods=['GET'])
def csv():
    if request.method == 'GET':
        try:
            query = session['current_query']
            columns = session['current_columns']
        except KeyError:
            return {'data': 'no query found'}

    results = db.query(query, connect_and_close=True)
    results_list = db.query_results_to_json(results, columns)

    df = pd.DataFrame(data=results_list)

    response = make_response(df.to_csv())
    cd = 'attachment; filename=query_result.csv'
    response.headers['Content-Disposition'] = cd
    response.mimetype = 'text/csv'

    return response


# https://stackoverflow.com/questions/10434599/get-the-data-received-in-a-flask-request
@application.route('/api/v1/database/names', methods=["GET"])
def names():
    name = request.args['name']
    query = f"SELECT display_name FROM person_list_view WHERE display_name LIKE '{name}%' LIMIT 100"
    results = db.query(query, connect_and_close=True)

    return json.dumps({name[0]: None for name in results})
