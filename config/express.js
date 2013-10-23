module.exports = function (app, express){

    app.configure('development', function() {
        app.enable('trust proxy')
        app.use(express.logger('dev'));
        app.use(express.cookieParser());
        app.use(express.bodyParser());
        app.use(express.session({secret:'tpsession'}));
        app.use(app.router);
        app.use(express.static(__dirname+'/../public'));
        app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
    });


    app.configure('production', function() {
        app.enable('trust proxy')
        app.use(express.logger());

        //TODO add security middleware to check that company name in host name matches process.env.COMPANY
        // To extract company name from host mycompany.api.tp.com :
        //      app.set('subdomain offset', 3);
        //      ...
        //      var companyName = req.subdomains[0];

        // custom middleware to check that API is only accessed through AJAX calls
        app.use('/api/*', function requireXHR(req, res, next){
            if (req.xhr){
                next();
            } else {
                res.send(401, 'Unauthorized');
            }
        });
        app.use(express.cookieParser());
        app.use(express.bodyParser());
        app.use(express.session({secret:'tpsession'}));
        app.use(app.router);
        app.use(express.static(__dirname+'/../public'));
        app.use(express.errorHandler());
    });

};
