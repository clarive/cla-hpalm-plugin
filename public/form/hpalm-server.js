(function(params) {

    var userName = Cla.ui.textField({
        name: 'userName',
        fieldLabel: _('Username'),
        allowBlank: false
    });

    var password = Cla.ui.textField({
        name: 'password',
        fieldLabel: _('Password'),
        inputType: 'password',
        allowBlank: false
    });

    var sharedSpaceId = Cla.ui.textField({
        name: 'sharedSpaceId',
        fieldLabel: _('Shared Space ID'),
        allowBlank: false
    });

    var workSpaceName = Cla.ui.textField({
        name: 'workSpaceName',
        fieldLabel: _('Workspace'),
        allowBlank: false
    });

    var loginUrl = Cla.ui.textField({
        name: 'loginUrl',
        fieldLabel: _('Login URL'),
        allowBlank: false,
        value: 'https://mqast001pngx.saas.hpe.com/authentication/sign_in'
    });

    return [
        userName,
        password,
        sharedSpaceId,
        workSpaceName,
        loginUrl
    ]
})