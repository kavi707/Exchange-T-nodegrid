/**
 * Created by kavi707 on 9/6/14.
 * @author Kavimal Wijewardana <kavi707@gmail.com>
 */
var logger = require('../utils/log');
var storeServices = require('../services/store_services');

/**
 * Creating REST end-points for data storing
 * @param app
 */
module.exports.createStoreEndPoints = function (app) {

    // Objects & Collections ...........................................................................................

    // Store new model or store data to given model (collection)
    app.post('/app/:modelName', function (req, res) {
        logger.info('NodeGrid:store_end_points/createStoreEndPoints - [POST/app/:modelName]');
        storeServices.handleStoreModelsPost(req, res);
    });

    // Update given model
    app.put('/app/:modelName/:id', function (req, res) {
        logger.info('NodeGrid:store_end_points/createStoreEndPoints - [PUT/app/:modelName/:id]');
        storeServices.handleStoreModelsPut(req, res);
    });

    // Delete given model
    app.del('/app/:modelName/:id', function (req, res) {
        logger.info('NodeGrid:store_end_points/createStoreEndPoints - [DELETE/app/:modelName/:id]');
        storeServices.handleDeleteModelsItem(req, res);
    });



    // Files ...........................................................................................................

    // Store uploaded file to mongo db and create relational mapping with given collection
    app.post('/app/file/:modelName', function(req, res) {
        logger.info('NodeGrid:store_end_points/createStoreEndPoints - [POST/app/file/:modelName]');
        storeServices.handleFileStoreModelPost(req, res);
    });
};