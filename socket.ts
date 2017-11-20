import * as Express from 'Express';
import * as Http from 'http';
import * as Socket from 'socket.io';
import * as amqplib from 'amqplib/callback_api';
import * as amqp from 'amqp';

let app = Express();
let http = new Http.Server(app);
let io = Socket(http);
let getTransApi = 'http://privatebudgetmanager.azurewebsites.net/Transactions/'
let postPdfLink = 'https://quiet-taiga-28894.herokuapp.com/pdf/';
let readRabbit = amqp.createConnection({host: 'amqp://1doFhxuC:WGgk9kXy_wFIFEO0gwB_JiDuZm2-PrlO@black-ragwort-810.bigwig.lshift.net:10803/SDU53lDhKShK'});
let relayRabbit = amqp.createConnection({host: 'amqp://1doFhxuC:WGgk9kXy_wFIFEO0gwB_JiDuZm2-PrlO@black-ragwort-810.bigwig.lshift.net:10802/SDU53lDhKShK'});

//Get json object from the api
app.get(getTransApi, function(req,res,msg){
    return msg;
})

app.configure(function(){
    app.use(Express.static(__dirname + '/public'));
})
//Relay/post json object to the rapid
relayRabbit.on('ready', function(){
    io.sockets.on('connection', function(socket){
        var queue = relayRabbit.queue('pdf_maker');

        queue.bind('#');

        queue.subscribe(function(msg){
            socket.emit('pdf_maker', msg);

        })
    })
})
//Receive notification that the pdf is ready - redirect user to uri
readRabbit.on('ready', function() {
    io.sockets.on('connection', function(socket){
        var queue = readRabbit.queue('pdf_maker');

        queue.bind('#');

        queue.subscribe(function(msg){
            // socket.emit('pdf_message', msg);
            return msg;
        })
    })
})
//Post link to pdf to the api
app.post(postPdfLink, function(req,res,msg) {
    setTimeout(function () {
        res.redirect(postPdfLink+msg);
    }, 1000);
}) 
// app.listen(8080);