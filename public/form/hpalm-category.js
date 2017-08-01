(function(params) {
    var clariveCategoryComboBox = new Cla.ui.form.categoryBox({
        name: 'clariveCategory',
        fieldLabel: _('Clarive Category Name'),
        value: params.rec.clariveCategory || '',
        allowBlank: false,
        singleMode: true,
        anchor: '50%'
    });

    var hpCategory = new Cla.ui.textField({
        name: 'hpCategory',
        fieldLabel: _('HP ALM Octane Category Name'),
        allowBlank: false,
        anchor: '50%'
    });

    var fieldMap = new Baseliner.DataEditor({
        name: 'fieldMap',
        title: _('Clarive - HP ALM Octane Field Correspondence'),
        hide_save: true,
        hide_cancel: true,
        hide_type: false,
        height: 500,
        data: params.rec.fieldMap || {
            'description': 'description',
            'status': 'Phase',
            'title': 'name'
        }
    });

    var listMap = new Baseliner.DataEditor({
        name: 'listMap',
        title: _('Clarive - HP ALM Octane Field Lists Correspondence'),
        hide_save: true,
        hide_cancel: true,
        hide_type: true,
        height: 300,
        data: params.rec.listMap || {
            'status': '2:1001,22:1002'
        }
    });

    return [
        hpCategory,
        clariveCategoryComboBox,
        fieldMap,
        listMap
    ]
})