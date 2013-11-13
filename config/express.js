/**
 * Utility function to check if a request is AJAX.
 * Note: Express' req.xhr() function is case sensitive and fails with lowercase header name.
 * @param req
 * @returns {boolean}
 */
function isXHR(req){
    var val = req.headers['X-Requested-With'] || req.headers['x-requested-with'] || '';
    return 'xmlhttprequest' == val.toLowerCase();
}

module.exports = function (app, express){

    app.configure('development', function() {
        app.enable('trust proxy');
        app.use(express.logger('dev'));
        app.use(express.cookieParser());
        app.use(express.bodyParser());

        // serve static content
        app.get('/', express.static(__dirname+'/../public'));
        app.use('/static', express.static(__dirname+'/../public'));

        // serve API
        app.use('/api', app.router);

        app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
    });


    app.configure('production', function() {
        app.enable('trust proxy');
        app.use(express.logger());
        app.use(express.cookieParser());
        app.use(express.bodyParser());

        //TODO add security middleware to check that company name in host name matches process.env.COMPANY
        // To extract company name from host mycompany.api.domain.com :
        //      app.set('subdomain offset', 3);
        //      ...
        //      var companyName = req.subdomains[0];

        // serve static content
        app.get('/', express.static(__dirname+'/../public'));
        app.use('/static', express.static(__dirname+'/../public'));

        // custom middleware to check that API is only accessed through AJAX calls
        app.use('/api', function requireXHR(req, res, next){
            if (isXHR(req)){
                next();
            } else {
                res.send(401, 'Unauthorized');
            }
        });

        // serve API
        app.use('/api', app.router);

        app.use(express.errorHandler());
    });

};
