exports.login = function(agentNotParsed, hpServer, headers) {

    var content = JSON.stringify({
        "user": hpServer.userName,
        "password": hpServer.password
    });
    var response = agentNotParsed.post(hpServer.loginUrl, {
        content: content,
        headers: headers
    });
    return response;
};

exports.cookie = function(response) {
    var cookiesStr = '';
    var setCookieResponse = response.headers['set-cookie'];

    for (var i = 0; i < setCookieResponse.length; i++) {
        cookiesStr += setCookieResponse[i].split(';')[0] + ';';
    }

    return cookiesStr;
};
exports.getWorkspaceId = function(agentNotParsed, sharedSpaceId, headers, workspaceName) {
    var response = agentNotParsed.get("https://mqast001pngx.saas.hpe.com/api/shared_spaces/" + sharedSpaceId + "/workspaces/", {
        headers: headers
    });
    var workspaceId = -1;
    var workspaces = JSON.parse(response.content);
    for (var i = 0; i < (workspaces.data).length; i++) {
        if (workspaces.data[i]['name'] == workspaceName) {
            workspaceId = workspaces.data[i]['id'];
            break;
        }
    }
    return workspaceId;
};

exports.listMaptoHashes = function(listMap) {
    var listMapHashes = {};

    for (var clariveField in listMap) {
        var map = {};
        var splitted = listMap[clariveField].split(',');
        for (var i = 0; i < splitted.length; i++) {
            map[splitted[i].split(':')[0].replace(' ', ' ')] = splitted[i].split(':')[1].replace(' ', ' ');
        }
        listMapHashes[clariveField] = map;
    }
    return listMapHashes;

};

exports.buildContent = function(synchronizeWhen, fieldMap, hpCategory, fieldsData, topicData, listMapHashes, instanceUrl, headers, agentNotParsed) {
    var content = {};
    var data = {};

    for (var clariveField in fieldMap) {
        var hpField = hpCategory.fieldMap[clariveField];
        data = buildData(synchronizeWhen, listMapHashes, clariveField, fieldsData, data, hpField, topicData, instanceUrl, hpCategory, headers, agentNotParsed);
    }
    data['name'] = topicData['title'];

    if (synchronizeWhen == 'create') {
        content['data'] = [data];
    } else {
        content = data;
    }
    content = JSON.stringify(content);
    return content;
};

function buildData(synchronizeWhen, listMapHashes, clariveField, fieldsData, data, hpField, topicData, instanceUrl, hpCategory, headers, agentNotParsed) {
    for (var i = 0; i < fieldsData.length; i++) {
        if (fieldsData[i].name == hpField && topicData[clariveField]) {
            var fieldType = fieldsData[i].field_type;
            switch (fieldType) {
                case 'reference':
                    if (listMapHashes[clariveField]) {
                        for (var clariveValue in listMapHashes[clariveField]) {
                            var hpLabel = listMapHashes[clariveField][clariveValue];
                            if (hpField == 'phase' && clariveValue == topicData.id_status && synchronizeWhen == 'change_status') {
                                    var jsonField = {
                                        type: hpField,
                                        id: hpLabel
                                    }
                                    data[fieldsData[i].name] = jsonField;
                            } else if(hpField != 'phase' && synchronizeWhen != 'change_status' && topicData[clariveField] == clariveValue) {
                                var jsonField = {
                                    type: fieldsData[i].field_type_data.targets[0].type,
                                    id: hpLabel
                                }
                                data[fieldsData[i].name] = jsonField;
                            }
                        }
                    }
                    break;
                case 'string':
                case 'integer':
                case 'memo':
                    data[fieldsData[i].name] = topicData[clariveField];
                    break;
                case 'boolean':
                    break;
                case 'date_time':
                    data[fieldsData[i].name] = clariveToHPDate(topicData[clariveField]);
                    break;
                case 'date':
                    data[fieldsData[i].name] = clariveToHPDate(topicData[clariveField]);
                    break;
            }
            break;
        }
    }
    return data;
};

function clariveToHPDate(clariveDate) {
    var index = clariveDate.indexOf(" ");
    return clariveDate.substring(0, index) + "T" + clariveDate.substring(index + 1, clariveDate.length) + "Z";
}