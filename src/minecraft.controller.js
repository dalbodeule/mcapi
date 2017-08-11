"use strict";

module.exports = (logger, db) => {
    const request = require('request-promise');
    return {
        nick: async(req, res) => {
            let queryNick = req.params.nick.toLowerCase();
            if(typeof queryNick != 'string' && /^[a-zA-Z0-9\_]{4,16}$/.test(queryNick) == false) {
                res.status(400).jsonp({error: "query is not nickname", query: queryNick}).end();
            } else {
                try {
                    let query_time = Math.floor(Date.now()/1000);
                    let redis = await db.getAsync('nick-'+queryNick);
                    if(redis == null) {
                        try {
                            let query = await request({
                                uri: 'https://api.mojang.com/users/profiles/minecraft/'+queryNick,
                                method: "GET",
                                json: true});
                            if(query != null) {
                                let result = {
                                    uuid: query.id, full_uuid: query.id.substring(0,8)+'-'
                                    +query.id.substring(8,12)+'-'+query.id.substring(12,16)+'-'
                                    +query.id.substring(16,20)+'-'+query.id.substring(20,32),
                                    nick: query.name, query: queryNick, query_time: query_time,
                                    cached: false
                                };

                                res.status(200).jsonp(result).end();

                                result.cached = true;
                                try {
                                    await db.setAsync('nick-'+queryNick, JSON.stringify(result), 'EX', 60*5);
                                } catch(e) {
                                    logger.error(e);
                                }
                            } else { //testcase response is not null
                                let result = {
                                    error: true,
                                    type: 'unregistered nickname',
                                    query: queryNick,
                                    cached: false
                                };

                                res.status(200).jsonp(result).end();

                                result.cached = true;
                                try {
                                    await db.setAsync('nick-'+queryNick, JSON.stringify(result), 'EX', 60*5);
                                } catch(e) {
                                    logger.error(e);
                                }
                            } //testcase response is not null
                        } catch(e) {
                            res.status(500).jsonp({error: "server error", query: queryNick}).end();
                            logger.error(e);
                        }
                    } else { //testcase is cached
                        try {
                            redis = JSON.parse(redis);
                            let ttl = await db.ttlAsync('nick-'+queryNick);
                            redis.expire = ttl;
                            res.status(200).jsonp(redis).end();
                        } catch(e) {
                            res.status(500).jsonp({error: "server error", query: queryNick}).end();
                            logger.error(e);
                        }
                    } //testcase is cached
                } catch(e) {
                    res.status(500).jsonp({error: "server error", query: queryNick}).end();
                    logger.error(e);
                } //redis query
            } //testcase isnick
        }, //nick function
        uuid: async(req, res) => {
            let queryUUID = req.params.uuid.replace(/\-/g, '').toLowerCase();
            if(typeof queryUUID != 'string' && /^([a-z0-9]{32})$/.test(queryUUID) == false) {
                res.status(400).jsonp({error: "query is not uuid", query: queryUUID}).end();
            } else {
                try {
                    let query_time = Math.floor(Date.now()/1000);
                    let redis = await db.getAsync('uuid-'+queryUUID);
                    if(redis == null) {
                        try {
                            let query = await request({
                                uri: 'https://api.mojang.com/user/profiles/'+queryUUID+'/names',
                                method: "GET",
                                json: true});
                            if(query != null) {
                                let result = {
                                    uuid: queryUUID, full_uuid: queryUUID.substring(0,8)+'-'
                                    +queryUUID.substring(8,12)+'-'+queryUUID.substring(12,16)+'-'
                                    +queryUUID.substring(16,20)+'-'+queryUUID.substring(20,32),
                                    nick: query[(Object.keys(query).length)-1].name,
                                    query: queryUUID, query_time: query_time,
                                    cached: false
                                };

                                res.status(200).jsonp(result).end();

                                result.cached = true;
                                try {
                                    await db.setAsync('uuid-'+queryUUID, JSON.stringify(result), 'EX', 60*5);
                                } catch(e) {
                                    logger.error(e);
                                }
                            } else { //testcase response is not null
                                let result = {
                                    error: true,
                                    type: 'unregistered uuid',
                                    query: queryUUID,
                                    cached: false
                                };

                                res.status(200).jsonp(result).end();

                                result.cached = true;
                                try {
                                    await db.setAsync('uuid-'+queryUUID, JSON.stringify(result), 'EX', 60*5);
                                } catch(e) {
                                    logger.error(e);
                                }
                            } //testcase response is not null
                        } catch(e) {
                            res.status(500).jsonp({error: "server error", query: queryUUID}).end();
                            logger.error(e);
                        }
                    } else { //testcase is cached
                        try {
                            redis = JSON.parse(redis);
                            let ttl = await db.ttlAsync('uuid-'+queryUUID);
                            redis.expire = ttl;
                            res.status(200).jsonp(redis).end();
                        } catch(e) {
                            res.status(500).jsonp({error: "server error", query: queryUUID}).end();
                            logger.error(e);
                        }
                    } //testcase is cached
                } catch(e) {
                    res.status(500).jsonp({error: "server error", query: queryUUIDk}).end();
                    logger.error(e);
                } //redis query
            } //testcase isuuid
        }, //uuid function
    } //return object
}