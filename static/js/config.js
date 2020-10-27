class QueryParameter {
    constructor(conditional_type = "all", values = null, alias = null, in_basic_query_form = false, label = null, class_name = null) {
        this.conditional_type = conditional_type
        this.values = values
        this.alias = alias
        // this.temp_query_value = temp_querable_value
        this.conditionals = this.conditional_type == "all" ? ["=", "!=", "<", ">", "<=", ">="] : ["=", "!="]

        // todo temp measure, will go back and redo front end in react
        this.in_basic_query_form = in_basic_query_form
        this.label = label
        this.class_name = class_name

    }
}

var states = ["Choose a Value", "Alaska", "Alabama", "Arkansas", "American Samoa", "Arizona", "California", "Colorado", "Connecticut", "District of Columbia", "Delaware", "Florida", "Georgia", "Guam", "Hawaii", "Iowa", "Idaho", "Illinois", "Indiana", "Kansas", "Kentucky", "Louisiana", "Massachusetts", "Maryland", "Maine", "Michigan", "Minnesota", "Missouri", "Mississippi", "Montana", "North Carolina", "North Dakota", "Nebraska", "New Hampshire", "New Jersey", "New Mexico", "Nevada", "New York", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Virginia", "Virgin Islands", "Vermont", "Washington", "Wisconsin", "West Virginia", "Wyoming"]

var districts = () => {
    var districts = ["Choose a Value"]
    for (var i = 1; i <= 53; i++) {
        districts.push(i)
    }
    return districts
}

var states_query_value = () => {
    var states_query_value = ["Choose a value"]
    for (var i = 1; i <= states.length; i++) {
        states_query_value.push(i)
    }
    return states_query_value
}

var config = {
    // field mapping for fields to select from
    field_map: {
        display_name: new QueryParameter("equate_only", null, null, true, 'Full Name', 'autocomplete'),
        state_id: new QueryParameter("equate_only", states_query_value(), states, true, 'State Name'),
        district_number: new QueryParameter("equate_only", districts(), null, true, 'District'),
        party_id: new QueryParameter("equate_only", ["Choose a value", 1, 2, 3, 4], ["Choose a value", "Democrat", "Republican", "Independent", "Undeclared"], true, 'Party'),
        word_count: new QueryParameter("all"),
        chamber_name: new QueryParameter("equate_only", ["Choose a Value", "house", "joint", "senate"]),
        occasion_name: new QueryParameter("equate_only", ["Choose a Value", "floor", "hearing"]),
        role_name: new QueryParameter("equate_only", ["Choose a Value", "member", "chairman", "witness", "attendant"]),
        proceeding_name: new QueryParameter("equate_only")
    },
    // jquery variable ids and classes
    basic_date_id: "#basic_date_conditional",
    basic_form_id: "#basic_form",
    advance_form_id: "#advance_form",
    column_options_id: "#option_form",
    download_id: "#download",
    display_query_checkbox: "#display_query_checkbox",
    spinner_class: ".query-spinner",
    advance_query_fieldset: ".advance-query-fieldset",

    // html
    new_table: "<table class='centered'><thead></thead><tbody></tbody></table>",


    // general
    row_num: 1

}