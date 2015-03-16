module.exports = function (StatusModel, User){

    const RUTA_INFORME = __dirname +'/archivos/informe.csv'
    var express         = require('express');
    var app             = express();                               // create our app w/ express
    var morgan          = require('morgan');                         // log requests to the console (express4)
    var bodyParser      = require('body-parser');                // pull information from HTML POST (express4)
    var methodOverride  = require('method-override');        // simulate DELETE and PUT (express4)
    var passport        = require('passport');
    var LocalStrategy   = require('passport-local').Strategy;
    var cookieParser    = require('cookie-parser');
    var session         = require('express-session')
    var fs              = require('fs');
    var multer          = require('multer')

    passport.use(new LocalStrategy( function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { 
                console.log('No se ha autorizado porque ha ocurrido un error con mongoDB');
                return done(err); 
            }if (!user) {
                console.log('No existe el usuario: ' + username)
                return done(null, false, { message: 'Incorrect username.' });
            }if (user.password !== password) {
                console.log('La contraseña es incorrecta: ' + username)
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }));

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findOne({ _id: id }, function (err, user) {
            done(err, user);
        });
    });
    var auth = function(req, res, next){
        if (!req.isAuthenticated()) {
            res.status(401);
            res.redirect('/');

        }else{
            next();
        }     
    };

    // configuration =================


    

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());

    app.use(cookieParser());
    app.use(session({ secret: '1U28s0Gjisj27a8Shfhuihdfnjcnudi)L', resave: false, saveUninitialized: true}));
    app.use(passport.initialize());
    app.use(passport.session());

    


    // listen (start app with node server.js) ======================================
    app.set('port', (process.env.PORT || 5001));
    app.listen( app.get('port'), function() {
        console.log("Node app is running at localhost:" + app.get('port'));
    });

    // route to test if the user is logged in or not 
    app.get('/loggedin', function(req, res) { 
        if(req.isAuthenticated()){
            req.user.password = '';
            res.send(req.user)
        }else{
            res.send( '0'); 
        }
    }); 
    // route to log in 
    app.post('/login', passport.authenticate('local'), function(req, res) { res.send(req.user); }); 
    // route to log out 
    app.post('/logout', function(req, res){ req.logOut(); res.status(200).end(); }); 



    // application Login -------------------------------------------------------------
    app.get('/index', function(req, res) {
        res.sendFile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    

// routes ======================================================================

    // API ---------------------------------------------------------------------

    //Log list API
    function enviarLogList(req, res){
        StatusModel.find(function(err, list) {
            if (err)
                res.send(err);
            res.json(list);
        });
    }
    app.get('/api/StatusModel', auth, function(req, res) {
        enviarLogList(req, res)
    });
    app.delete('/api/StatusModel/:idP', auth, function(req, res) {
        StatusModel.remove({
            _id : req.params.idP
        }, function(err, todo) {
            if (err)
                res.send(err);
            enviarLogList(req, res)
        });
    });
    app.delete('/api/StatusModel', auth, function(req, res) {
        StatusModel.remove({}, function(err, todo) {
            if (err)
                res.send(err);
            enviarLogList(req, res)
        });
    });    


    // USERS API
    function enviarUsers(res){
        User.find(function(err, todos) {
            if (err){
                res.send(err);
                console.log(err)
            }   
            res.json(todos);
        });
    }
    app.get('/api/users', auth, function(req, res) {
        if(req.user.type === 'root'){
            enviarUsers(res); 
        }else{
            res.status(401).send('No autorizado');
        }
        
    });
    app.post('/api/users', auth, function(req, res) {
        if(req.user.type === 'root'){
            if (req.body.user._id){
                User.findByIdAndUpdate(req.body.user._id, { $set: req.body.user}, function (err, user) {
                    if (err) 
                        return handleError(err);
                    enviarUsers(res);
                });
            }else{
                User.create( req.body.user, function(err, todo) {
                    if (err)
                        res.send(err);
                    enviarUsers(res);
                });
            }
        }else{
            res.status(401).send('No autorizado');
        }
        
    });

    
    app.get('/api/informe.csv', function(req, res){

        var ws = fs.createWriteStream(RUTA_INFORME, { flags: 'w',
            encoding: 'utf8',
            fd: null,
            mode: 0666
        })

        StatusModel.find(function(err, list) {
            if (err)
                res.send(err);
            var atributos = ['serviceType', 
            'clientID',
            'clientIP',
            'lat',
            'lng',
            'alt',
            'vel']
            var line = 'fecha,';
            for (var j = 0; j < atributos.length; j++) {
                line += atributos[j]+ ";"; 
            };
            ws.write(line + '\n');
            for (var i = list.length - 1; i >= 0; i--) {
                var status = list[i];
                line = status._id.getTimestamp()+ ",";
                for (var j = 0; j < atributos.length; j++) {
                    line += status[atributos[j]] + ","; 
                }; 

                ws.write(line + '\n');
            };
            ws.end();
            ws.on('finish', function() {
                res.sendFile(RUTA_INFORME);
            });
        });


        
    })
}   

