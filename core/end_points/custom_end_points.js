/**
 * Created by kavi707 on 9/6/14.
 * @author Kavimal Wijewardana <kavi707@gmail.com>
 */
var logger = require('../utils/log');
var customServices = require('../services/custom_services');

module.exports.createCustomEndPoints = function(app) {

    //Objects ..........................................................................................................

    app.post('/app/:modelName/getTicketRequest/filter', function(req, res) {
        logger.info('NodeGrid:custom_end_points/createCustomEndPoints - [POST/app/:modelName/getTicketRequest/filter]');
        customServices.handleTicketRequestFilterPost(req, res);
    });
}