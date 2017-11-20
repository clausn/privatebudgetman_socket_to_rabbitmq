"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Express = require("Express");
var Http = require("http");
var Socket = require("socket.io");
var amqp = require("amqp");
var app = Express();
var http = new Http.Server(app);
var io = Socket(http);
var getTransApi = 'http://privatebudgetmanager.azurewebsites.net/Transactions/';
var postPdfLink = 'https://quiet-taiga-28894.herokuapp.com/pdf';
var readRabbit = amqp.createConnection({ host: 'amqp://1doFhxuC:WGgk9kXy_wFIFEO0gwB_JiDuZm2-PrlO@black-ragwort-810.bigwig.lshift.net:10803/SDU53lDhKShK' });
var relayRabbit = amqp.createConnection({ host: 'amqp://1doFhxuC:WGgk9kXy_wFIFEO0gwB_JiDuZm2-PrlO@black-ragwort-810.bigwig.lshift.net:10802/SDU53lDhKShK' });
//Get json object from the api
app.get(getTransApi, function (req, res, msg) {
    return msg;
});
app.configure(function () {
    app.use(Express.static(__dirname + '/public'));
});
//Relay json object to the rapid
relayRabbit.on('ready', function () {
    io.sockets.on('connection', function (socket) {
        var queue = relayRabbit.queue('pdf_maker');
        queue.bind('#');
        queue.subscribe(function (msg) {
            socket.emit('json_object', msg);
        });
    });
});
//Receive the link to the pdf file
readRabbit.on('ready', function () {
    io.sockets.on('connection', function (socket) {
        var queue = readRabbit.queue('pdf_maker');
        queue.bind('#');
        queue.subscribe(function (msg) {
            socket.emit('pdf_message', msg);
        });
    });
});
//Post link to pdf to the api
app.post(postPdfLink, function (req, res, msg) {
});
app.listen(8080);
