var ci = require("cla/ci");

ci.createRole("HPALM");

ci.createClass("HPALMServer", {
    form: '/plugin/cla-hpalm-plugin/form/hpalm-server.js',
    icon: '/plugin/cla-hpalm-plugin/icon/hpalm.svg',
    roles: ["HPALM", "ClariveSE"],
    has: {
        userName: {
            is: "rw",
            isa: "Str",
            required: true
        },
        password: {
            is: "rw",
            isa: "Str",
            required: true
        },
        sharedSpaceId: {
            is: "rw",
            isa: "Str",
            required: true
        },
        workSpaceName: {
            is: "rw",
            isa: "Str",
            required: true
        },
        loginUrl: {
            is: "rw",
            isa: "Str",
            required: true
        }
    }

});

ci.createClass("HPALMCategory", {
    form: '/plugin/cla-hpalm-plugin/form/hpalm-category.js',
    icon: '/plugin/cla-hpalm-plugin/icon/hpalm.svg',
    roles: ["HPALM", "ClariveSE"],
    has: {
        clariveCategory: {
            is: "rw",
            isa: "Str",
            required: false
        },
        hpCategory: {
            is: "rw",
            isa: "Str",
            required: false
        },
        fieldMap: {
            is: "rw",
            isa: "HashRef",
            required: false
        },        
        listMap: {
            is: "rw",
            isa: "HashRef",
            required: false
        }
    }
});