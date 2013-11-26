/**
 * Mail service controller
 *
 * User: Etienne Dodat
 * Date: 21/10/13
 */

////////////////////
// INITIALIZATION //
////////////////////

var nodemailer = require('nodemailer'),
    config = require('../config/mail.js');

/////////////
// PRIVATE //
/////////////

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP", config.transportOptions);

function send(recipient, subject, text, HTML, callback){
    // use diversion address for all messages in test mode
    recipient = config.DIVERSION_TEST_ADDRESS || recipient;

    var mailOptions = {
        from: config.FROM, // sender address
        to: recipient, // list of receivers
        subject: subject, // Subject line
        text: text, // plaintext body
        html: HTML // html body
    }
    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log('[MAIL] Message to', recipient, 'resulted in error:', error);
        }else{
            console.log('[MAIL] Message sent to', recipient, ':', response.message);
        }
        if (callback) callback(error, response);
    });
}

////////////
// PUBLIC //
////////////

module.exports.sendAccess = function(recipient, accessLink, isRenewal, callback){
    var subject, text, HTML;

    if (isRenewal){
        subject = 'Renew your '+config.PRODUCT+' password';
        text = 'Hello,\n' +
            'Your '+config.PRODUCT+' account\'s password has been reset.\n' +
            'Please copy the link below in your internet browser to renew your password and access your '+config.PRODUCT+' dashboard:\n' +
            accessLink+'\n' +
            '\n' +
            'Regards,\n' +
            'The '+config.PRODUCT+' team';
        HTML = 'Hello,<br>' +
            'Your '+config.PRODUCT+' account\'s password has been reset.<br>' +
            'Please click on the link below (or copy it in your internet browser) to renew your password and access your '+config.PRODUCT+' dashboard:<br>' +
            '<a href="'+accessLink+'">'+accessLink+'</a><br>' +
            '<br>' +
            'Regards,<br>' +
            'The '+config.PRODUCT+' team';
    } else {
        subject = 'Access your '+config.PRODUCT+' account';
        text = 'Hello,\n' +
            'You now have an individual '+config.PRODUCT+' account.\n' +
            'Do not wait any longer and copy the link below in your internet browser to access your '+config.PRODUCT+' dashboard:\n' +
            accessLink+'\n' +
            '\n' +
            'Regards,\n' +
            'The '+config.PRODUCT+' team';
        HTML = 'Hello,<br>' +
            'You now have an individual '+config.PRODUCT+' account.<br>' +
            'Do not wait any longer and click on the link below (or copy it in your internet browser) to access your '+config.PRODUCT+' dashboard:<br>' +
            '<a href="'+accessLink+'">'+accessLink+'</a><br>' +
            '<br>' +
            'Regards,<br>' +
            'The '+config.PRODUCT+' team';
    }

    send(recipient, subject, text, HTML, callback);
};
