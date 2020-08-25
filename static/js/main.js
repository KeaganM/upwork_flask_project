// config variables
var names_data = {};

var $query_spinner = $(".query-spinner")
$query_spinner.hide();

var $download = $('#download')

var $display_query_checkbox = $('#display_query_checkbox')

var conditionals = {
    all: ["=", "!=", "<", ">", "<=", ">="],
    equate_only: ["=", "!="]
}

var field_map = {
    party: {
        user_input_type: "select",
        conditionals: conditionals["equate_only"],
        values: ["Choose a Value", "d", "r", "i"]
    },
    full_name: {
        user_input_type: "text",
        conditionals: conditionals["equate_only"],
        values: null
    },
    word_count: {
        user_input_type: "text",
        conditionals: conditionals["all"],
        values: null
    },
    district: {
        user_input_type: "text",
        conditionals: conditionals["equate_only"],
        values: null
    },
    state_name: {
        user_input_type: "select",
        conditionals: conditionals["equate_only"],
        values: ["Choose a Value", "Alaska", "Alabama", "Arkansas", "American Samoa", "Arizona", "California", "Colorado", "Connecticut", "District of Columbia", "Delaware", "Florida", "Georgia", "Guam", "Hawaii", "Iowa", "Idaho", "Illinois", "Indiana", "Kansas", "Kentucky", "Louisiana", "Massachusetts", "Maryland", "Maine", "Michigan", "Minnesota", "Missouri", "Mississippi", "Montana", "North Carolina", "North Dakota", "Nebraska", "New Hampshire", "New Jersey", "New Mexico", "Nevada", "New York", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Virginia", "Virgin Islands", "Vermont", "Washington", "Wisconsin", "West Virginia", "Wyoming"]
    },
    land_sqm: {
        user_input_type: "text",
        conditionals: conditionals["all"],
        values: null
    },
    population_total: {
        user_input_type: "text",
        conditionals: conditionals["all"],
        values: null
    },
    density_quintile: {
        user_input_type: "text",
        conditionals: conditionals["all"],
        values: null
    },
    chamber_name: {
        user_input_type: "select",
        conditionals: conditionals["equate_only"],
        values: ["house", "joint", "senate"]
    },
    occasion_name: {
        user_input_type: "select",
        conditionals: conditionals["equate_only"],
        values: ["floor", "hearing"]
    },
    role_name: {
        user_input_type: "select",
        conditionals: conditionals["equate_only"],
        values: ["member", "chairman", "witness", "attendant"]
    },
    proceeding_name: {
        user_input_type: "text",
        conditionals: conditionals["equate_only"],
        values: null
    },
};

var row_num = 1;

var $advance_query_fieldset_html = $(".advance-query-fieldset")
    .clone()
    .find("button").css("display", "block").end()
    .html()

// function ************************************************************************************************************

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

    // todo instead of having a user_input_type attribute, just check to see if the values field is not null

    var user_input_type = field_map[element_value]["user_input_type"];
    var condition_html = create_conditional_field(field_map[element_value]["conditionals"]);
    var html = null;

    if (user_input_type == "select") {
        html = "<select id='value' name='value'>"
        for (var i = 0; i < field_map[element_value]["values"].length; i++) {
            html = html + "<option value='" + field_map[element_value]["values"][i] + "'>" + field_map[element_value]["values"][i] + "</option>"
        }
        html = html + "</select>"
    } else {
        if (element_value == "full_name") {
            html = "<input id='value' class='autocomplete' name='value' type='text' value=''>";
        } else {
            html = "<input id='value' name='value' type='text' value=''>"
        }
    }
    return [html, condition_html]
}


// query ajax call
function Query() {
    $query_spinner.show()
    var values = [];
    var query_object = {
        logic_operator: "",
        field: "",
        value: "",
        conditional: "",
    }

    $.each($("#basic_form").serializeArray(), function (i, field) {
        query_object = {
            logic_operator: "AND",
            field: field.name,
            value: field.value,
            conditional: "=",
        };

        if (field.name == 'speech_date') {
            query_object.conditional = $('#basic_date_conditional').children('option:selected').val()
        }

        var query_object_copy = Object.assign({}, query_object)
        values.push(query_object_copy)
    })


    $.each($("#advance_form").serializeArray(), function (i, field) {
        query_object[field.name] = field.value
        if (field.name == "value") {
            var query_object_copy = Object.assign({}, query_object)
            values.push(query_object_copy)
        }
    })

    var select_options = []
    var $options = $("#option_form").find("option:selected")
    $options.each(function (i, item) {
        select_options.push(item.value)
    })

    var data = {
        data: {
            where: values,
            select: select_options
        }
    }

    console.log(data)

    $.ajax({
        type: "POST",
        url: "/",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            $new_table = $("<table class='centered'><thead></thead><tbody></tbody></table>")
            var parsed_response = JSON.parse(response)
            var data = parsed_response["data"];
            var query = parsed_response['query']
            var length = parsed_response["length"];
            var display_data = data.slice(0, 500);
            var message = $display_query_checkbox.is(':checked') ?
                '<p>' + 'The first ' + length + ' results are displayed above. To download all results, please submit a Data Request using this <a href="https://forms.gle/Eo7oDiXNgDqVaYvNA">form</a>.' + '<br><br>Query: ' + query + '</p>' :
                '<p>' + 'The first ' + length + ' results are displayed above. To download all results, please submit a Data Request using this <a href="https://forms.gle/Eo7oDiXNgDqVaYvNA">form</a>.' + '</p>'

            if (data == 'no records found') {
                alert("no records found")
                 $("#after_query_message").find('p').replaceWith('<p></p>')
                $('#results-found').find('p').replaceWith('<p></p>')

            } else {
                var keys = Object.keys(display_data[0])
                // created col names
                $(function () {
                    var $tr = $("<tr>")
                    $.each(keys, function (i, key) {
                        if (key != "speech_text_truncated") {
                            $tr.append($("<th>").text(key))
                        }
                    })
                    $tr.appendTo($new_table).find("thead")
                });

                // fills table
                $(function () {
                    $.each(display_data, function (i, item) {
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
                        $tr.appendTo($new_table).find("thead")
                    });
                });
                console.log("got here yo")
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

    var values = advance_form_value_factory(val, field_map)

    $parent.find("#conditional_div").remove()
    $parent.find("#value_div").remove()

    $("<div class='input-field col s12 m3 l2' id=conditional_div>" + values[1] + "<label for=conditional>Conditional</label></div>")
        .insertAfter($parent.find("#field_div"));
    $("<div class='input-field col s12 m3 l5' id=value_div>" + values[0] + "<label for=value>Value</label></div>")
        .insertAfter($parent.find("#conditional_div"));

    $(".autocomplete").autocomplete({
        data: names_data
    });
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

$(document).ready(function () {

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
    $.ajax({
        type: "GET",
        url: "/api/v1/database/names",
        // data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            names_data = JSON.parse(response)

            $("input.autocomplete").autocomplete({
                data: names_data
            });
        }
    })
});

$(document).on("click", ".reset-button", function () {
    $("form").trigger("reset");
    $("table").replaceWith("<table><thead></thead><tbody></tbody></table>")
    $("#after_query_message").find('p').replaceWith('<p></p>')
    $('#results-found').find('p').replaceWith('<p></p>')


    // https://api.jquery.com/hasClass/
    // https://api.jquery.com/addClass/
    // https://api.jquery.com/unwrap/
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator
    $download.find('button').hasClass('disabled') ?
        null : setButton(null, $download.find('button').addClass('disabled').end().unwrap(), true)
})


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
