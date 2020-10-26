var date = '<div class="row"> <div class="col s2 m2 l2"> <div class="input-field"> <select id="basic_date_conditional"> <option selected value="<">Before</option> <option selected value=">">After</option> <option selected value="=">On</option> </select> </div> </div> <div class="col s8 m8 l10"> <div class="input-field"> <input type="text" id="speech_date" name="speech_date" class="datepicker"> <label for="speech_date">Date</label> </div> </div>'


function create_basic_query_form(mapping) {

    var $basic_form = $(config.basic_form_id)

    for (key in mapping) {
        if (mapping[key].in_basic_query_form) {
            if (Array.isArray(mapping[key].values)) {
                // var $select_input = $('<div class="input-field"><div class="select-wrapper"><div class="select-dropdown dropdown-trigger" type="text" readonly="true" target='+key+'_select_options></div><ul></ul></div></div>')
                var $select_input = $('<div class=input-field><select name=' + key + ' id=' + key + '></select><label for=' + key + '>' + mapping[key].label + '</label></div>')
                var values = mapping[key].values
                var alias = mapping[key].alias != null ? mapping[key].alias : mapping[key].values

                console.log(values[0])

                for (i = 0; i < mapping[key].values.length; i++) {

                    $select_input.find('select').append('<option value =' + values[i] + '>' + alias[i] + '</option>')
                }
                $basic_form.find('fieldset').append($select_input)
            } else {
                var text_input = '<div class="input-field"><input id=' + key + ' name=' + key + ' type="text" class=' + mapping[key].class_name + '><label for=' + key + '>' + mapping[key].label + '</label></div>'
                $basic_form.find('fieldset').append(text_input)
            }
        }
    }

    $basic_form.find('fieldset').append(date)
}


create_basic_query_form(config.field_map)
$(config.basic_form_id)