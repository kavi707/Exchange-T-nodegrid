/**
 * Created by kavi707 on 9/6/14.
 * @author Kavimal Wijewardana <kavi707@gmail.com>
 */

var logger = require('../utils/log');
var utils = require('../utils/utils');
var extend = require('node.extend');
var mongo_connection = require('../utils/mongoose_connection');
var connectionObj = mongo_connection.createMongooseConnection();

//Reading the config file
var fs = require('fs');
var configurations = JSON.parse(fs.readFileSync('config.json', encoding="ascii"));

var mongoose = connectionObj.mongooseObj;
var entity = connectionObj.entityObj;

module.exports.getFilteredTicketRequest = function (req, res) {

    //create collection object for ticket_requests
    var collectionName = configurations.TICKET_REQUESTS;
    var ticketRequests = mongoose.model(collectionName, entity);
    var whereObj = {};
    var isDateAvailable = false;
    
    var givenType = null;
    if ('type' in req.body) {
        givenType = req.body.type;
        whereObj['data.entity.type'] = givenType;
    }

    var givenDate = null;
    isDateAvailable = true;
    if ('date' in req.body) {
        givenDate = req.body.date;
    } else {
        givenDate = {"from":Math.round((new Date(+new Date - 12096e5)).getTime() / 1000)};
    }

    var givenDestination = null;
    if ('startToEnd' in req.body) {
        givenDestination = req.body.startToEnd;
        whereObj['data.entity.startToEnd'] = givenDestination;
    }

    var givenQty = null;
    if ('qty' in req.body) {
        givenQty = req.body.qty;
        // Remove the filter for quantity
        //whereObj['data.entity.qty'] = {"$gte": givenQty};
    }

    var query = ticketRequests.find(whereObj);
    query.sort({ 'data.createdTime': -1 });
    query.exec(function (err, records) {
        if (err) {
            logger.info("NodeGrid:query_db_callings/getFromDBAdvance - [ticket_requests] data querying was failed. ERROR: " + err);
            utils.sendResponse(res, 500, 'Internal Server Error - [ticket_requests] data querying was failed', err);
        } else {
            logger.info("NodeGrid:query_db_callings/getFromDBAdvance - [ticket_requests] data successfully retrieved");
            if (isDateAvailable) {
                var newRecords = new Array();
                var fromTimeStamp = null;
                var toTimeStamp = null;
                if ('from' in givenDate) {
                    fromTimeStamp = givenDate.from;
                }

                if ('to' in givenDate) {
                    toTimeStamp = givenDate.to;
                }

                for (var i = 0; i < records.length; i++) {
                    var tRequest = records[i];
                    var tReqDateTimeStamp = Math.round(new Date(tRequest.data.entity.ticketDate).getTime() / 1000);

                    if (fromTimeStamp != null && tReqDateTimeStamp >= fromTimeStamp) {

                        if (toTimeStamp != null && tReqDateTimeStamp <= toTimeStamp) {
                            newRecords.push(records[i]);
                        } else if (toTimeStamp == null){
                            newRecords.push(records[i]);
                        }
                    }
                }

                utils.sendResponse(res, 200, '[ticket_requests] data successfully retrieved', newRecords);
            } else {
                utils.sendResponse(res, 200, '[ticket_requests] data successfully retrieved', records);
            }
        }
    });
};

/**
 * Update object in given mongo collections
 * @param req
 * @param res
 */
module.exports.updateUserEntity = function (req, res) {

    var collectionName = configurations.USERS_TABLE;

    var entityModel = mongoose.model(collectionName, entity);

    entityModel.findOne({_id: req.params.userId}, function (err, oldEntity) {
        if (err) {
            logger.info("NodeGrid:custom_db_callings/updateUserEntity - Object updating was failed. ERROR: " + err);
        } else {
            Object.keys(req.body).forEach(function(key) {
                delete oldEntity.data[key];
            });

            var destObject = extend(req.body, oldEntity.data);

            entityModel.update({_id: req.params.userId}, {data: destObject}, function (err, savedEntity) {
                if (err) {
                    logger.info("NodeGrid:custom_db_callings/updateUserEntity - Object updating was failed. ERROR: " + err);
                    utils.sendResponse(res, 500, "Internal Server Error - Object updating was failed.", err);
                } else {
                    logger.info("NodeGrid:custom_db_callings/updateUserEntity - Object updated successfully. OBJECT: " + JSON.stringify(savedEntity));
                    utils.sendResponse(res, 200, "Object updated successfully", savedEntity);
                }
            });

        }
    });
};