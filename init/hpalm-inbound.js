var reg = require("cla/reg");

reg.register('service.hpalm.inbound', {
    name: _('HP ALM Octane Inbound'),
    icon: '/plugin/cla-hpalm-plugin/icon/hpalm.svg',
    form: '/plugin/cla-hpalm-plugin/form/hpalm-services-inbound.js',
    rulebook: {
        moniker: 'hpalm_inbound',
        description: _('HPALM inbound service'),
        required: [ 'server', 'hpalm_category'],
        allow: ['server', 'hpalm_category'],
        mapper: {
            'hpalm_category':'HPALMCategory'
        },
        examples: [{
            hpalm_inbound: {
                server: 'hpalm_resource',
                hpalm_category: 'category_resource'
            }
        }]
    },
    handler: function(ctx, config) {
        var ci = require("cla/ci");
        var log = require("cla/log");
        var web = require("cla/web");
        var cla = require("cla/cla");
        var db = require("cla/db");
        var reg = require("cla/reg");
        var sem = require("cla/sem");
        var myutils = require("myutils");

        var server = config.server || '';
        var category = config.HPALMCategory;
        var hpServer = ci.findOne({
            mid: server + ''
        });
        var categoryData = ci.findOne({
            mid: category + ''
        });

        if (!hpServer) {
            log.error(_("HP ALM Octane Server undefined. Please choose one. "));
            return;
        }
        var sharedSpaceId = hpServer.sharedSpaceId;
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

        var stashWs = ctx.stash('ws_params');
        var wsBody = JSON.parse(ctx.stash('ws_body'));
        var coll = db.getCollection('topic');
        var hptopic,
            topics;
        var semaphore;
        var listMapHashes = myutils.listMaptoHashes(categoryData.listMap);
        var fieldMapValue;
        var responseFieldMapValue;
        var listMapValue;
        var topicConfig = {};
        topicConfig.variables = {};

        var mode = wsBody.submissionMode;
        var hpId = wsBody.entityId;
        var workspaceId = wsBody.workspaceId;

        if (mode == "after-create-entity") {
            semaphore = sem.take('hpalmControl', function() {
                hptopic = coll.findOne({
                    _hpalm_id: hpId + ''
                });
                if (hptopic) {
                    hptopic = coll.update({
                        mid: hptopic.mid + ''
                    }, {
                        $set: {
                            _hpalm_update: '0',
                            _hpalm_change_status: '0'
                        }
                    });
                    return;
                }
                var instanceUrl = "https://mqast001pngx.saas.hpe.com/api/shared_spaces/" + sharedSpaceId + "/workspaces/" + workspaceId + "/defects/" + hpId;
                var response = agentNotParsed.get(instanceUrl, {
                    headers: headers
                });
                var responseContent = JSON.parse(response.content);
               
                for (var contentField in categoryData.fieldMap) {
                    fieldMapValue = categoryData.fieldMap[contentField]
                    if (responseContent[fieldMapValue]) {
                        responseFieldMapValue = responseContent[fieldMapValue];
                        if (listMapHashes[contentField]) {
                            listMapValue = listMapHashes[contentField];
                            for (var index in listMapValue) {
                                if (listMapValue[index] == responseFieldMapValue.id) {
                                    topicConfig.variables[contentField] = index;
                                }
                            }
                        } else {
                            topicConfig.variables[contentField] = responseContent[fieldMapValue];
                        }
                    }
                }
                topicConfig.category = categoryData.clariveCategory;
                topicConfig.username = stashWs.username;
                if (topicConfig.variables.status) {
                    topicConfig.status = topicConfig.variables.status;
                    delete topicConfig.variables.status;
                }
                if (topicConfig.variables.title) {
                    topicConfig.title = topicConfig.variables.title;
                    delete topicConfig.variables.title;
                }
                
                var topicMid = reg.launch('service.topic.create', {
                    name: _('Service topic create'),
                    config: topicConfig
                });
                topics = coll.update({
                    mid: topicMid + ''
                }, {
                    $set: {
                        _hpalm_id: hpId + '',
                        _hpalm_update: '1',
                        _hpalm_change_status: '0'
                    }
                });
                log.info(_("Topic created with mid: ") + topicMid)
                return topicMid;

            });
        } else if (mode == "after-update-entity") {
            semaphore = sem.take('hpalmControl', function() {
                hptopic = coll.findOne({
                    _hpalm_id: hpId + ''
                });

                if (!hptopic) {
                    log.error(_("Topic doesn't exist"));
                    return;
                } else {
                    var changes = wsBody.changes;
                    
                    for (var contentField in categoryData.fieldMap) {
                        fieldMapValue = categoryData.fieldMap[contentField]
                        if (changes[fieldMapValue]) {
                            responseFieldMapValue = changes[fieldMapValue].newValue;
                            if (listMapHashes[contentField]) {
                                listMapValue = listMapHashes[contentField];
                                for (var index in listMapValue) {
                                    if (responseFieldMapValue) {
                                        var match = responseFieldMapValue;
                                        var changeId = match.match(/(?!id=)\d+/);
                                    }
                                    if (listMapValue[index] == changeId) {
                                        topicConfig.variables[contentField] = index;
                                    }
                                }
                            } else {
                                topicConfig.variables[contentField] = changes[fieldMapValue].newValue;
                            }
                        }
                    }

                    if (topicConfig.variables.status) {
                        if (hptopic && hptopic._hpalm_change_status == '1') {
                            hptopic = coll.update({
                                mid: hptopic.mid + ''
                            }, {
                                $set: {
                                    _hpalm_change_status: '0'
                                }
                            });
                            log.info(_("Topic already updated"));
                            return;
                        }
                        topicConfig.status = topicConfig.variables.status;
                        delete topicConfig.variables.status;

                        reg.launch('service.topic.change_status', {
                            name: _('Change topic status'),
                            config: {
                                topics: hptopic.mid,
                                new_status: topicConfig.status,
                                username: stashWs.username
                            }
                        });
                        topics = coll.update({
                            mid: hptopic.mid + ''
                        }, {
                            $set: {
                                _hpalm_change_status: '1'
                            }
                        });
                    }

                    topicConfig.mid = hptopic.mid;
                    if (hptopic && hptopic._hpalm_update == '1') {
                        hptopic = coll.update({
                            mid: hptopic.mid + ''
                        }, {
                            $set: {
                                _hpalm_update: '0'
                            }
                        });
                        log.info(_("Topic already updated"));
                        return;
                    }
                    
                    var update = reg.launch('service.topic.update', {
                        name: _('Update topic'),
                        config: topicConfig
                    });

                    topics = coll.update({
                        mid: hptopic.mid + ''
                    }, {
                        $set: {
                            _hpalm_update: '1'
                        }
                    });
                }
                log.info(_("HP ALM topic updated"));
                return;
            });

        } else if (mode == "after-delete-entity") {
            hptopic = coll.findOne({
                _hpalm_id: hpId + ''
            });
            if (!hptopic) {
                log.error(_("HP ALM topic not found"));
                return;
            }
            reg.launch('service.topic.delete', {
                name: _('Delete topic'),
                config: {
                    topics: hptopic.mid + '',
                    username: stashWs.username
                }
            });
            log.info(_("Topic deleted"));
            return;
        } else {
            log.fatal(_("Unknown mode"));
        }
    }
});