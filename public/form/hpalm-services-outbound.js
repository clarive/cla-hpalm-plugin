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
        new Cla.ui.comboBox({
            name: 'synchronizeWhen',
            fieldLabel: _('Action'),
            data: [
                ['create', _('Create')],
                ['update', _('Update')],
                ['change_status', _('Change Status')],
                ['delete', _('Delete')]
            ],
            value: params.data.synchronizeWhen || '',
            disabled: false,
            hidden: false,
            allowBlank: false,
            anchor: '50%',
            singleMode: true
        }),
        new Cla.ui.ciCombo({
            name: 'HPALMCategory',
            value: params.data.HPALMCategory || '',
            class: 'HPALMCategory',
            fieldLabel: _('HP ALM Category'),
            allowBlank: false,
            with_vars: 1,
            singleMode: true
        }),

    ]
})