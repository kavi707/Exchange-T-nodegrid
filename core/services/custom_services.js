/**
 * Created by kavi707 on 9/6/14.
 * @author Kavimal Wijewardana <kavi707@gmail.com>
 */

var customDb = require('../db_callings/custom_db_callings');
var logger = require('../utils/log');

module.exports.handleTicketRequestFilterPost = function (req, res) {
    logger.info('NodeGrid:custom_services/handleTicketRequestFilterPost - Filter and get ticket requests');
    customDb.getFilteredTicketRequest(req,res);
};

module.exports.handleUserUpdatePut = function (req, res) {
    logger.info('NodeGrid:custom_services/handleUserUpdatePut - Update user details');
    customDb.updateUserEntity(req,res);
};