var logger = require('../utils/log');
var push = require('../utils/push');
var mongo_connection = require('../utils/mongoose_connection');
var utils = require('../utils/utils');
//Reading the config file
var fs = require('fs');
var configurations = JSON.parse(fs.readFileSync('config.json', encoding="ascii"));

var connectionObj = mongo_connection.createMongooseConnection();

var mongoose = connectionObj.mongooseObj;
var entity = connectionObj.entityObj;

/**
 * Creating new mongo collections of saving new mongo object in given collection
 * @param req
 * @param res
 */
module.exports.getEntitiesForPush = function (req, res, sendToAll, callback) {

    var entityModel = mongoose.model(req.params.modelName, entity);
    var qryObj = {};
    if(!sendToAll){
        qryObj = {
            '_id':{ $in: req.body.ids}
        };
    }
    entityModel.find(qryObj, function (err, pushEntities) {
        if (err) {
            logger.info("NodeGrid:push_db_callings/getEntitiesForPush - [push] data querying was failed. ERROR: " + err);
            callback(1, err);
        } else {
            logger.info("NodeGrid:push_db_callings/getEntitiesForPush - [push] data retrieved successfully.");
            callback(0, pushEntities);
        }
    });
};

/**
 * Creating new mongo collections of saving new mongo object in given collection
 * @param req
 * @param res
 */
module.exports.getEntityRelationsForPush = function (req, res, callback) {

    var firstEntity = req.params.firstEntity;
    var firstId = req.params.firstId;
    var type = req.params.type;
    var secondEntity = req.params.secondEntity;

    var entityModel = mongoose.model('entity_relations', entity);
    var qryObj = {
        "data.firstEntity":firstEntity,
        "data.firstIdentifier":firstId,
        "data.relationType":type,
        "data.secondEntity":secondEntity,
    };

    entityModel.find(qryObj, function (err, records) {
        if (err) {
            logger.info("NodeGrid:relations_db_callings/getEntityRelationsForPush - [entity_relations] data querying was failed. ERROR: " + err);
        } else {
            logger.info("NodeGrid:relations_db_callings/getEntityRelationsForPush - [entity_relations] data successfully retrieved");
            
            var relationModel = mongoose.model(secondEntity, entity);
            var entityArray = [];
            records.forEach(function(ele){entityArray.push(ele.data.secondIdentifier)});
            var qryObj = {
                '_id':{ $in: entityArray}
                };
            relationModel.find(qryObj, function (err, relationRecords) {
                if (err) {
                    logger.info("NodeGrid:relations_db_callings/getEntityRelationsForPush - [entity_relations] data querying was failed. ERROR: " + err);
                } else {
                    // TODO   SENDING PUSHHHH >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.
                    //res.send(relationRecords);
                    callback(0, relationRecords);
                }
            });

        }
    });
};

module.exports.storeFCMPushToken = function (req, res) {

    var checkPushTokensCollection = mongoose.model(configurations.PUSH_TOKEN_TABLE, entity);
    checkPushTokensCollection.find({"data.userId": req.body.userId}, function(pushTokenExistenceErr, pushTokenObj) {
       if (pushTokenExistenceErr) {
           logger.info("NodeGrid:push_db_callings/storeFCMPushToken - Error occurred at push_tokens database check. ERROR: " + pushTokenExistenceErr);
           utils.sendResponse(res, 500, "Internal Server Error - Push token retrieving failed", pushTokenExistenceErr);
       } else {

           var newPushToken = req.body.push.regId;
           var setNotifiers = [];

           if (pushTokenObj.length == 0) {
               storePushToken(req, res);
           } else {
               var isTokenExists = false;
               var notifiers = pushTokenObj[0].data.notifiers;
               for (var i = 0; i < notifiers.length; i++) {
                   setNotifiers[i] = notifiers[i];
                   if (newPushToken == notifiers[i].regId) {
                       isTokenExists = true;
                       break;
                   }
               }

               if (!isTokenExists) {
                   setNotifiers[notifiers.length] = req.body.push;
                   updatePushTokens(req, res, pushTokenObj[0]._id, setNotifiers);
               } else {
                   logger.info("NodeGrid:push_db_callings/storeFCMPushToken - Given [push token] is already exists");
                   utils.sendResponse(res, 409, "Conflict - Given [push token] is already exists", "EMPTY");
               }
           }
       }
    });
};

function storePushToken(req, res) {
    var pushTokens = mongoose.model(configurations.PUSH_TOKEN_TABLE, entity);

    // Store created time.
    var createdTime = Math.round((new Date()).getTime() / 1000);

    var dbObject = {
        "createdTime": createdTime,
        "userId": req.body.userId,
        "notifiers": [req.body.push]
    };

    var newEntity = new pushTokens({ data: dbObject});
    newEntity.save(function (err, savedEntity) {
        if (err) {
            logger.info("NodeGrid:push_db_callings/storeFCMPushToken - Push token storing failed. ERROR: " + err);
            utils.sendResponse(res, 500, "Internal Server Error - Push token storing failed", err);
        } else {
            logger.info("NodeGrid:push_db_callings/storeFCMPushToken - Push token added successfully. OBJECT: " + JSON.stringify(savedEntity));
            utils.sendResponse(res, 200, "Push token added successfully", savedEntity);
        }
    });
}

function updatePushTokens(req, res, objId, newNotifiers) {
    var pushTokens = mongoose.model(configurations.PUSH_TOKEN_TABLE, entity);
    pushTokens.update({"_id": objId}, {$set: {"data.notifiers": newNotifiers}}, function(err, updatedEntity) {
        if (err) {
            logger.info("NodeGrid:push_db_callings/storeFCMPushToken - Push token storing failed. ERROR: " + err);
            utils.sendResponse(res, 500, "Internal Server Error - Push token storing failed", err);
        } else {
            logger.info("NodeGrid:push_db_callings/storeFCMPushToken - Push token added successfully. OBJECT: " + JSON.stringify(updatedEntity));
            utils.sendResponse(res, 200, "Push token added successfully", updatedEntity);
        }
    });
}