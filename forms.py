from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, SelectField


class BasicQueryForm(FlaskForm):
    district_list = [x for x in range(1, 436)]
    district_list.insert(0, "Choose a Value")
    # basic form
    full_name = StringField("Full Name")
    district_number = SelectField("District", choices=district_list)
    state_name = SelectField("State",
                             choices=["Choose A Value", "Alaska", "Alabama", "Arkansas", "American Samoa", "Arizona",
                                      "California",
                                      "Colorado", "Connecticut", "District of Columbia", "Delaware", "Florida",
                                      "Georgia", "Guam", "Hawaii", "Iowa", "Idaho", "Illinois", "Indiana", "Kansas",
                                      "Kentucky", "Louisiana", "Massachusetts", "Maryland", "Maine", "Michigan",
                                      "Minnesota", "Missouri", "Mississippi", "Montana", "North Carolina",
                                      "North Dakota", "Nebraska", "New Hampshire", "New Jersey", "New Mexico", "Nevada",
                                      "New York", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico",
                                      "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah",
                                      "Virginia", "Virgin Islands", "Vermont", "Washington", "Wisconsin",
                                      "West Virginia", "Wyoming"])
    party_name = SelectField("Party", choices=["Choose A Value", "Democrat", "Republican", "Independent"])
    date = StringField("Speech Date")
    submit = SubmitField("Query")
