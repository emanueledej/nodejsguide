const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config  = require('./config');
const fs = require('fs');

var serverHttp = http.createServer(function(req,res){
    unifiedServer(req,res);
});

var httpsServerOptions = {
    'key':fs.readFileSync('./https/key.pem'),
    'cert':fs.readFileSync('./https/cert.pem')
};

var serverHttps = https.createServer(httpsServerOptions,function(req,res){
    unifiedServer(req,res);
});

var handlers = {};

handlers.hello(function(data,callback){

    callback(200,{'message': "Hello!"});
});

handlers.notFound(data, function(data,callback){

    callback(404);
});

var router = {
    'hello': handler.hello()
}

serverHttp.listen(config.httpPort, function(){
    console.log("listening on port " + config.httpPort)
});

var unifiedServer = function(req,res){
    let headers = req.headers;

    let parsedUrl = url.parse(req.Url,true);

    let path = parsedUrl.pathname;
    let pathTrimmed = path.replace(/^\/+|\/+$/g,"")
    
    let queryStringObject = parsedUrl.query;

    let method = req.method.toLowerCase();

    let decoder = StringDecoder('utf-8');
    let buffer = '';

    req.on('data', function(data){
        buffer += decoder.write(data);
    });

    req.on('end', function(){
        buffer += decoder.end();

        var chosenHandler = typeof(router[pathTrimmed] !== 'undefined' ? router[pathTrimmed] : handlers.notFound();

        chosenHandler(data, function(statusCode,payload){
            
            statusCode = typeof(statusCode) === 'number'? statusCode : '200';

            payload = typeof(payload) === 'object'?  payload : {};

            let payloadString = JSON.stringify(payload);

            res.writeHeard(statusCode);
            res.end(payloadString);
        });

    });

}

