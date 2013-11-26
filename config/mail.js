module.exports = {

    transportOptions : {
        host: "smtp.free.fr", // hostname
        secureConnection: true, // use SSL
        port: 465,
        auth: {
            user: "etienne.dodat",
            pass: "fggja7gq"
        }
    },

    PRODUCT: 'Lean Project',
    FROM: 'Lean Project <no-reply@lean-project.com>',
    SUPPORT: 'support@lean-project.com'

};

if (process.env.NODE_ENV == 'development'){
    // Test email address where ALL messages will be sent
    module.exports.DIVERSION_TEST_ADDRESS = 'etienne.dodat@gmail.com';

    console.log('[MAIL] All messages will be diverted to', module.exports.DIVERSION_TEST_ADDRESS);
}