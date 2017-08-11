"use strict";

module.exports = (app, logger, db) => {
    const request = require('request-promise'),
    controller = require(__dirname+'/minecraft.controller.js')(logger, db);

    //nickname query
    app.get('/nick/:nick', controller.nick);

    app.get('/nick', (req, res) => {
        res.status(404).jsonp({error: 'invalid nickname field'}).end();
    });

    //uuid query
    app.get('/uuid/:uuid', controller.uuid);

    app.get('/uuid', (req, res) => {
        res.status(404).jsonp({error: 'invalid uuid field'}).end();
    });
}