var reg = require("cla/reg");

reg.register('service.hpalm.outbound', {
    name: _('HP ALM Octane Outbound'),
    icon: '/plugin/cla-hpalm-plugin/icon/hpalm.svg',
    form: '/plugin/cla-hpalm-plugin/form/hpalm-services-outbound.js',
    handler: function(ctx, config) {
        var ci = require("cla/ci");
        var log = require("cla/log");
        var web = require("cla/web");
        var cla = require("cla/cla");
        var db = require("cla/db");
        var sem = require("cla/sem");
        var myutils = require("myutils");
        var server = config.server || '';
        var synchronizeWhen = config.synchronizeWhen || '';
        var hpServer = ci.findOne({
            mid: server + ''
        });
        
        if (synchronizeWhen == '') {
            log.error(_("Action option undefined."));
            return;
        }
        if (!hpServer) {
            log.error(_("HP ALM Octane Server undefined. Please choose one. "));
            return;
        }
        var category = config.HPALMCategory;
        var hpCategory = ci.findOne({
            mid: category + ''
        });

        var sharedSpaceId = hpServer.sharedSpaceId;
        var workspaceName = hpServer.workSpaceName;
        var urlLoginServer = hpServer.loginUrl;
        var agent = web.agent();
        var agentNotParsed = web.agent({
            auto_parse: 0
        });
        var headers = {
            'content-type': 'application/json'
        };
        if (!urlLoginServer) {
            log.error(_("Missing login URL parameter."));
            return;
        }
        var login = myutils.login(agentNotParsed, hpServer, headers);

        var cookiesStr = myutils.cookie(login);
        headers['Cookie'] = cookiesStr;

        var workspaceId = myutils.getWorkspaceId(agentNotParsed, sharedSpaceId, headers, workspaceName);

        if (workspaceId == -1) {
            log.error(_("Not found workspace name, please check it before continue"));
            return;
        }
        var content = {};
        var instanceUrl = "https://mqast001pngx.saas.hpe.com/api/shared_spaces/" + sharedSpaceId + "/workspaces/" + workspaceId + "/";

        var topics = db.getCollection('topic');
        var topic;
        var topicData = ctx.stash('topic_data');
        if (topicData) {
            var categoryId = topicData.id_category;
        } else {
            var categoryId = ctx.stash('category_id');
            topicData = ctx.stash();
        }
        var hpCategoryEndPoint = instanceUrl + hpCategory.hpCategory + 's/';

        switch (synchronizeWhen) {
            case 'create':
                var ret = sem.take('hpalmControl', function() {
                    var hptopic = topics.findOne({
                        mid: topicData.mid + ''
                    });
                    if (hptopic && hptopic._hpalm_update) {
                        var hptopic = topics.update({
                            mid: hptopic.mid + ''
                        }, {
                            $set: {
                                _hpalm_update: '0'
                            }
                        });
                        return;
                    }


                    if (categoryId == hpCategory.clariveCategory) {
                        var fieldMap = hpCategory.fieldMap;
                        var listMap = hpCategory.listMap;
                        var fieldsInfoUrl = instanceUrl + "metadata/fields?query=%22entity_name%20EQ%20%27" + hpCategory.hpCategory + "%27%22";
                        var responseFieldsInfo = agentNotParsed.get(fieldsInfoUrl, {
                            headers: headers
                        });
                        var fieldsData = JSON.parse(responseFieldsInfo.content).data;
                        var listMapHashes = myutils.listMaptoHashes(listMap);

                        content = myutils.buildContent(synchronizeWhen, fieldMap, hpCategory, fieldsData, topicData, listMapHashes);

                        var response = agentNotParsed.post(hpCategoryEndPoint, {
                            content: content,
                            headers: headers
                        });
                        var responseContent = JSON.parse(response.content);
                        topic = topics.update({
                            mid: topicData.mid + ''
                        }, {
                            $set: {
                                _hpalm_id: responseContent.data[0]['id'],
                                 _hpalm_update: '1',
                                 _hpalm_change_status: '1'
                            }
                        });
                    }
                });
                break;

            case 'update':
                var ret = sem.take('hpalmControl', function() {
                    var hptopic = topics.findOne({
                        mid: topicData.mid + ''
                    });
                    if (hptopic && hptopic._hpalm_update) {
                        if (hptopic._hpalm_update == '1') {
                            var hptopic = topics.update({
                                mid: hptopic.mid + ''
                            }, {
                                $set: {
                                    _hpalm_update: '0'
                                }
                            });
                            return;
                        }
                    }

                    if (categoryId == hpCategory.clariveCategory) {
                        var fieldMap = hpCategory.fieldMap;
                        var listMap = hpCategory.listMap;
                        var fieldsInfoUrl = instanceUrl + "metadata/fields?query=%22entity_name%20EQ%20%27" + hpCategory.hpCategory + "%27%22";
                        var responseFieldsInfo = agentNotParsed.get(fieldsInfoUrl, {
                            headers: headers
                        });
                        var fieldsData = JSON.parse(responseFieldsInfo.content).data;
                        var listMapHashes = myutils.listMaptoHashes(listMap);

                        content = myutils.buildContent(synchronizeWhen, fieldMap, hpCategory, fieldsData, topicData, listMapHashes, instanceUrl, headers, agentNotParsed)
                        if (!hptopic) {
                            log.error(_('Topic with mid ') + topicData.mid + _(" not found"));
                            return;
                        }
                        if (!hptopic._hpalm_id) {
                            log.error(_('Topic with mid ') + topicData.mid + _(' has no relation with HP ALM'));
                            return;
                        }
                        var hpid = hptopic._hpalm_id;
                        var updateUrl = hpCategoryEndPoint + hpid;

                        var response = agentNotParsed.put(updateUrl, {
                            content: content,
                            headers: headers
                        });
                        var responseContent = JSON.parse(response.content);
                        var hptopic = topics.update({
                            mid: hptopic.mid + ''
                        }, {
                            $set: {
                                _hpalm_update: '1',
                            }
                        });
                    }
                });
                break;

            case 'change_status':
                var ret = sem.take('hpalmControl', function() {
                    hptopic = topics.findOne({
                        mid: topicData.mid + ''
                    });
                    if (hptopic && hptopic._hpalm_update) {
                        if (hptopic._hpalm_change_status == '1') {
                            var hptopic = topics.update({
                                mid: hptopic.mid + ''
                            }, {
                                $set: {
                                    _hpalm_change_status: '0'
                                }
                            });
                            return;
                        }

                    } else {
                        log.error(_("HP ALM topic doesn't exist"));
                        return;
                    }

                if (categoryId == hpCategory.clariveCategory) {
                        var fieldMap = hpCategory.fieldMap;
                        var listMap = hpCategory.listMap;
                        var fieldsInfoUrl = instanceUrl + "metadata/fields?query=%22entity_name%20EQ%20%27" + hpCategory.hpCategory + "%27%22";
                        var responseFieldsInfo = agentNotParsed.get(fieldsInfoUrl, {
                            headers: headers
                        });
                        var fieldsData = JSON.parse(responseFieldsInfo.content).data;
                        var listMapHashes = myutils.listMaptoHashes(listMap);

                        content = myutils.buildContent(synchronizeWhen, fieldMap, hpCategory, fieldsData, topicData, listMapHashes, instanceUrl, headers, agentNotParsed)
                        var mid = ctx.stash('topic_mid');
                        topic = topics.findOne({
                            mid: mid + ''
                        });
                        if (!topic) {
                            log.error(_('Topic with mid ') + mid + _("not found"));
                            return;
                        }
                        if (!topic._hpalm_id) {
                            log.error(_('Topic with mid ') + mid + _(' has no relation with HP ALM'));
                            return;
                        }
                        var hpid = topic._hpalm_id;
                        var updateUrl = hpCategoryEndPoint + hpid;
                        var response = agentNotParsed.put(updateUrl, {
                            content: content,
                            headers: headers
                        });
                        var responseContent = JSON.parse(response.content);
                        var topic = topics.update({
                            mid: hptopic.mid + ''
                        }, {
                            $set: {
                                _hpalm_change_status: '1',
                            }
                        });
                    }
                });

            break;

            case 'delete':
                var mid = ctx.stash('topic_mid');
                topic = topics.findOne({
                    mid: mid + ''
                });
                if (!topic) {
                    log.error(_('Topic with mid ') + mid + _("not found"));
                    return;
                }
                if (!topic._hpalm_id) {
                    log.error(_('Topic with mid ') + mid + _(' has no relation with HP ALM'));
                    return;
                }
                var hpid = topic._hpalm_id;
                var deleteUrl = hpCategoryEndPoint + hpid;
                try {
                var response = agentNotParsed.delete(deleteUrl, {
                    headers: headers
                });
                } catch (err) {
                    log.error(_("Topic doesn't exist in HP ALM"));
                    return;
                }
                log.info(_('Deleted Topic with mid ') + mid);
                break;
        }
        return;
    }
});