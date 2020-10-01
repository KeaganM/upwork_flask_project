// https://api.jquery.com/hasClass/
// https://api.jquery.com/addClass/
// https://api.jquery.com/unwrap/
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator

class QueryParameter {
    constructor(conditional_type = "all", values = null) {
        this.conditional_type = conditional_type
        this.values = values
        this.conditionals = this.conditional_type == "all" ? ["=", "!=", "<", ">", "<=", ">="] : ["=", "!="]
    }
}

var districts = () => {
    var districts = ["Choose a value"]
    for (var i = 0; i <= 435; i++) {
        districts.push(i)
    }
    return districts
}


var config = {
    // field mapping for fields to select from
    field_map: {
        party_name: new QueryParameter("equate_only", ["Choose a value", "Democrat", "Republican", "Independent"]),
        full_name: new QueryParameter("equate_only"),
        word_count: new QueryParameter("all"),
        district_number: new QueryParameter("equate_only", districts()),
        state_name: new QueryParameter("equate_only", ["Choose a Value", "Alaska", "Alabama", "Arkansas", "American Samoa", "Arizona", "California", "Colorado", "Connecticut", "District of Columbia", "Delaware", "Florida", "Georgia", "Guam", "Hawaii", "Iowa", "Idaho", "Illinois", "Indiana", "Kansas", "Kentucky", "Louisiana", "Massachusetts", "Maryland", "Maine", "Michigan", "Minnesota", "Missouri", "Mississippi", "Montana", "North Carolina", "North Dakota", "Nebraska", "New Hampshire", "New Jersey", "New Mexico", "Nevada", "New York", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Virginia", "Virgin Islands", "Vermont", "Washington", "Wisconsin", "West Virginia", "Wyoming"]),
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

var $query_spinner = $(config.spinner_class);
var $download = $(config.download_id);
var $display_query_checkbox = $(config.display_query_checkbox);
var row_num = 1;
var $advance_query_fieldset_html = $(config.advance_query_fieldset)
    .clone()
    .find("button").css("display", "block").end()
    .html()

// function ************************************************************************************************************

function update_autocomplete(element) {
    element.bind('input', function () {
        names_input = {name: element.val()}
        if (names_input['name'] != '') {
            request("/api/v1/database/names", names_input, 'GET', 'application/json;charset=uf-8', (response) => {
                names_data = JSON.parse(response)
                $("input.autocomplete").autocomplete({
                    data: names_data
                });
            })

        }
    })
}


function reset_form() {
    $("form").trigger("reset");
}

function reset_elements(elements, reset_values) {
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].is("form")) {
            reset_form()
            continue
        }
        elements[i].replaceWith(reset_values[i])
    }
}


function setButton(button_el_action = null, button_el_action_reset = null, reset = false) {
    reset == false ? button_el_action : button_el_action_reset
}

function create_conditional_field(conditions) {
    var condition_html = "<select id='conditional' name='conditional'>"
    for (var i = 0; i < conditions.length; i++) {
        condition_html = condition_html + "<option value='" + conditions[i] + "'>" + conditions[i] + "</option>"
    }
    condition_html = condition_html + "</select>"
    return condition_html
}

function advance_form_value_factory(element_value, field_map) {

    var user_input_type = Array.isArray(field_map[element_value].values) ? "select" : "text";
    var condition_html = create_conditional_field(field_map[element_value].conditionals);
    var html = element_value == "full_name" ? "<input id='value' class='autocomplete' name='value' type='text' value=''>" : "<input id='value' name='value' type='text' value=''>"

    if (user_input_type == "select") {
        html = "<select id='value' name='value'>"
        for (var i = 0; i < field_map[element_value]["values"].length; i++) {
            html = html + "<option value='" + field_map[element_value].values[i] + "'>" + field_map[element_value].values[i] + "</option>"
        }
        html = html + "</select>"
    }
    return [html, condition_html]
}

function get_query_inputs(form_id, form_type) {
    var values = [];
    var advance_query_object = {}
    $.each($(form_id).serializeArray(), function (i, field) {
        if (form_type == "advance") {
            advance_query_object[field.name] = field.value
            if (field.name == "value") {
                values.push(Object.assign({}, advance_query_object));
            }
        } else {
            values.push(Object.assign({}, {
                logic_operator: "AND",
                field: field.name,
                value: field.value,
                conditional: field.name == 'speech_date' ? $(config.basic_date_id).children('option:selected').val() : "="
            }))
        }
    });
    return values
}

function get_column_inputs(column_id) {
    var select_options = []
    var $options = $(column_id).find("option:selected")
    $options.each(function (i, item) {
        select_options.push(item.value)
    })
    return select_options
}

function request(url, data, type = "GET", contentType = "application/json; charset=utf-8", callback) {
    $.ajax({
        type: type,
        url: url,
        data: data,
        contentType, contentType,
        success: function (response) {
            callback(response)
        }
    })
}

// query ajax call
function Query() {
    $query_spinner.show()

    var values = get_query_inputs(config.basic_form_id, "basic")
    values.push(...get_query_inputs(config.advance_form_id, "advance"))

    var data = {
        data: {
            where: values,
            select: get_column_inputs(config.column_options_id)
        }
    }

    // console.log(data)

    $.ajax({
        type: "POST",
        url: "/",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            $new_table = $(config.new_table)
            var parsed_response = JSON.parse(response)
            var data = parsed_response["data"];
            var query = parsed_response['query']
            var length = parsed_response["length"];
            // var display_data = data.slice(0, 500);

            var $message_string = $('<p>' + 'The first ' + length + ' results are displayed above. To download all results, please submit a data request using this <a href="https://forms.gle/Eo7oDiXNgDqVaYvNA" target="_blank">form</a>.</p>')
            var message = $display_query_checkbox.is(':checked') ? $message_string.append("<p>Query: " + query + "</p>") : $message_string

            function create_col_names(col_names, table_element) {

                var $tr = $("<tr>")
                $.each(keys, function (i, key) {
                    if (key != "speech_text_truncated") {
                        $tr.append($("<th>").text(key))
                    }
                })
                $tr.appendTo(table_element).find("thead")

            }

            function fill_table(columns, table_element) {
                $.each(data, function (i, item) {
                    var $tr = $("<tr>")
                    for (var i = 0; i < keys.length; i++) {
                        if (keys[i] == "speech_text") {
                            $tr.append($("<td>").text(item["speech_text_truncated"]))
                            continue;
                        }
                        if (keys[i] != "speech_text_truncated") {
                            $tr.append($("<td>").text(item[keys[i]]))
                        }
                    }
                    $tr.appendTo(table_element).find("thead")
                })
            }

            if (data == 'no records found') {
                //TODO make alert box pretty
                // alert("no records found")
                M.toast({html:'No records found'})
                reset_elements([$("#after_query_message").find('p'), $('#results-found').find('p')],
                    ['<p></p>', '<p></p>'])

            } else {
                var keys = Object.keys(data[0])
                // created col names
                // $(function () {
                //     var $tr = $("<tr>")
                //     $.each(keys, function (i, key) {
                //         if (key != "speech_text_truncated") {
                //             $tr.append($("<th>").text(key))
                //         }
                //     })
                //     $tr.appendTo($new_table).find("thead")
                // });
                create_col_names(keys, $new_table);
                fill_table(keys, $new_table);

                // fills table
                // $(function () {
                //     $.each(data, function (i, item) {
                //         var $tr = $("<tr>")
                //         for (var i = 0; i < keys.length; i++) {
                //             if (keys[i] == "speech_text") {
                //                 $tr.append($("<td>").text(item["speech_text_truncated"]))
                //                 continue;
                //             }
                //             if (keys[i] != "speech_text_truncated") {
                //                 $tr.append($("<td>").text(item[keys[i]]))
                //             }
                //         }
                //         $tr.appendTo($new_table).find("thead")
                //     });
                // });
                // console.log("got here yo")
                $("#results-found").find("p").replaceWith("<p>results found:" + length + "</p>")
                setButton($download.find('button').removeClass('disabled').end().wrap('<a href="/api/v1/database/csv"></a>'))
                $('#after_query_message').find('p').replaceWith(message)

            }
            $("table").replaceWith($new_table);

            $query_spinner.hide();
        }
    })
}


function ChangeValueField(el) {
    var val = $(el).val();

    var $parent = $(el).closest(".advance-query-fieldset")

    var values = advance_form_value_factory(val, config.field_map)

    $parent.find("#conditional_div").remove()
    $parent.find("#value_div").remove()

    $("<div class='input-field col s12 m3 l2' id=conditional_div>" + values[1] + "<label for=conditional>Conditional</label></div>")
        .insertAfter($parent.find("#field_div"));
    $("<div class='input-field col s12 m3 l5' id=value_div>" + values[0] + "<label for=value>Value</label></div>")
        .insertAfter($parent.find("#conditional_div"));

    $parent.find('#field_div :selected').text() == 'full_name' ? update_autocomplete($parent.find("#value_div").find('input')) : null;

    $("select").formSelect();
}

// add extra forms
$(document).on("click", '.add-button', function () {
    row_num++
    $(".advance-form").append("<fieldset id=advance_query_fieldset_" + row_num + " class=advance-query-fieldset>" + $advance_query_fieldset_html + "</fieldset>")
    $("#advance_query_fieldset_" + row_num).css("display", "block");
    $("select").formSelect();
})

// remove extra forms
$(document).on('click', '.remove-button', function () {
    $(this).closest(".advance-query-fieldset").remove();
})

$(document).on("click", ".reset-button", function () {
    reset_elements(
        [
            $("form"), $("table"), $("#after_query_message").find('p'), $('#results-found').find('p')
        ], [
            null, "<table><thead></thead><tbody></tbody></table>", "<p></p>", "<p></p>"
        ])


    $download.find('button').hasClass('disabled') ?
        null : setButton(null, $download.find('button').addClass('disabled').end().unwrap(), true)
})


$(document).ready(function () {

    $query_spinner.hide();


    // this is for date picker; it does have paramaters
    $(".datepicker").datepicker({
        disableWeekends: true
    });
    // this is for tool tips
    $(".tooltipped").tooltip();
    // this is for scrollspy
    $(".scrollspy").scrollSpy();
    // for select
    $("select").formSelect();
    // for collapsible
    $(".collapsible").collapsible();

    // for tabs
    $(document).ready(function () {
        $('.tabs').tabs();
    });

    // get names from api and create autocomplee
    // https://gist.github.com/brandonaaskov/1596867
    update_autocomplete($('#full_name'))
});


// ******************* tests


// ********************* go through later

// $(document).on({
//     ajaxStart:function(){$query_spinner.attr("display","block");},
//     ajaxStop:function(){$query_spinner.attr("display","none");}
// });

// show/hide advance query
//$(document).on("click",".advance-query-button",function(){
//    var $advance_query_div = $(".advance-query-fieldset")
//    var $advance_query_div_display = $advance_query_div.css("display")
//    if ($advance_query_div_display == "none"){
//        $advance_query_div.css("display","block")
//    }else{
//        $advance_query_div.css("display","none")
//    }
//})

//$(document).ready(function(){
//    $("#advance_query > div:nth-child(2) > select").change(function(){
//        var val = $(this).val();
//        html = advance_form_value_factory(val,field_map)
//        $("#value").replaceWith(html)
//    })
//})


//    $(document).on("change","#"+new_id+"> div:nth-child(2) > select",function(){
//        var val = $(this).val();
//        console.log(val)
//        html = advance_form_value_factory(val,field_map)
//        $("#"+new_id+" > div:nth-child(4) > input").replaceWith(html)
//
//    })


//    var $advance_query_div_elements = $advance_query_div.children()
//    .find("select").end()
//    .find("input").end()
//    console.log($advance_query_div_elements)
