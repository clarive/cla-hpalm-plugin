(function(params) {

    return [
        new Cla.ui.ciCombo({
            name: 'server',
            value: params.data.server || '',
            class: 'HPALMServer',
            fieldLabel: _('HP ALM Server'),
            allowBlank: false,
            with_vars: 1
        }),
        new Cla.ui.ciCombo({
            name: 'HPALMCategory',
            value: params.data.HPALMCategory || '',
            class: 'HPALMCategory',
            fieldLabel: _('HP ALM Category'),
            allowBlank: false,
            with_vars: 1,
            singleMode: false
        }),

    ]
})