/**
 * Created by kavi707 on 12/2/14.
 * @author Kavimal Wijewardana <kavi707@gmail.com>
 */

var FCM = require('fcm-node');
var logger = require('../log');
var utils = require('../utils');
var pushNotifierDb = require('../../db_callings/push_notifiers_db_callings');

module.exports.sendPushToFCM = function (regIds, req, res) {

    var notifier_type = 'google';

    pushNotifierDb.queryNotifier(notifier_type, function (status, notifier) {
        if (status == 0) {
            if (notifier != null) {
                var fcm = new FCM(notifier.data.server_key);
                var message = {
                    registration_ids: regIds,
                    collapse_key: 'demo',

                    notification: {
                        title: 'Title of your push notification',
                        body: req.body.message
                    },

                    data: {  //you can send only notification or only data(or include both)
                        my_key: 'my value',
                        my_another_key: 'my another value'
                    }
                };

                fcm.send(message, function(err, response){
                    if (err) {
                        logger.info('NodeGrid:google/sendPushToFCM - Push sending unsuccessful from FCM');
                        utils.sendResponse(res, 417, 'Expectation Failed - Push is not completed from FCM side', err);
                    } else {
                        logger.info('NodeGrid:google/sendPushToFCM - Push sent successful to FCM');
                        utils.sendResponse(res, 200, 'Push is sent', response);
                    }
                });
            } else {
                utils.sendResponse(res, 410, 'Not Contents - No notifier found from ['+ notifier_type +']', 'EMPTY');
            }
        } else if (status == 1) {
            utils.sendResponse(res, 500, 'Internal Server Error - [google] data retrieving was failed', notifier);
        }
    });
};
