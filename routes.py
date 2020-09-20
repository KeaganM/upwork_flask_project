import json

from flask import render_template, request, session, make_response
from forms import BasicQueryForm
import pandas as pd

from config import application, db
from utils.database import QueryParser, QueryFilter
from utils.utils import truncate


# TODO may want to seperate this out and make the querying part into an api
@application.route('/', methods=["GET", "POST"])
def base():
    """
    - look at google sheet for core/advance fields
    - may have to choose use judgement for core fields; choose some that are obvious

    - lazy loading of js functions (load when need them)

    - if we are limiting the amount of data we can query, then you may be able to simply save it and send it through the csv route
    """

    basic_form = BasicQueryForm()
    if request.method == "POST":

        raw_data = request.json["data"]
        raw_data['where'] = QueryFilter(raw_data['where']).reformat_date(date_column='speech_date',
                                                                         from_format='%b %d, %Y')
        query, columns = QueryParser(raw_data, "advance_data_view", 500).parse()

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
    print('here')
    name = request.args['name']
    query =  f"SELECT first_name || ' ' || last_name as full_name_combo FROM person_list WHERE full_name_combo LIKE '{name}%'"
    print(query)
    results = db.query(query, connect_and_close=True)
    # print(results)
    print(len(results))

    return json.dumps({name[0]: None for name in results})
