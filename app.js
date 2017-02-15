var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io',{ rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] });
var express = require('express');
//var php = require('express-php');
//var phpExpress = require('php-express')({
//        binPath: '~/bin/php' // php bin path.
//    });

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);
//  var sql = require("mysql");
//  console.log(process.env.IP);
// console.log(process.env.PORT);
 
//  var connection = sql.createConnection({
//          user: 'nikisub',
//          password: '',
//          host: 'nikisub-web-final-4265237', 
//          database: 'c9', 
//          port: 3306
//      });


//router.use(php.cgi((path.join(__dirname, 'dir/php/signin.php'))));
/*router.use(express.bodyParser());

router.set('views', path.join(__dirname, 'dir'));
router.engine('php', phpExpress.engine);
router.set('view engine', 'php');
router.use(router.router);*/
router.use(express.static(path.join(__dirname, 'dir')));

//router.all(/.+\.php$/, phpExpress.router);

var players = [];
var readyPlayers = [];
var rooms = [['0',0]];
var roomVars = [];
var started = 0;
var gravity = 9.81;

var time;

// connection.connect(function(err) {
//   if (err) {
//     console.error('error connecting: ' + err.stack);
//     return;
//   }
 
//   console.log('connected as id ' + connection.threadId);
// });

io.on('connection',function(socket){
    players.push(socket);
    //console.log("players"+players);

    socket.on('disconnect',function(){
        players.splice(players.indexOf(socket), 1);
    });
    socket.on('say',function(data){
        //console.log("a");
       io.sockets.in(data.id).emit('readyResponse',data.msg); 
    });
    //Start game
    //recieve game info
    //compute (Make fast)
    //send it back
    
    //Log
    /*
    19th 17th 12th 10th
    */
    
    socket.on('ready',function(){
        var roomName = "";
        var playerNumber = 0;
        var joined = false;
        for(var i =0;i<rooms.length;i++)
        {
            if(!joined){
            if(rooms[i][1]<2)
            {
                socket.join(rooms[i][0]);
                rooms[i][1]++;
                roomName = rooms[i][0];
                joined=true;
                if(rooms[i][1]==2)
                {
                    playerNumber=2;
                }
                else{
                    playerNumber=1;
                }
            }}
        }
        if(!joined){
            socket.join(""+rooms.length);
           var a = rooms.length;
            rooms.push([""+a,1]);
            roomName=a;
            playerNumber==1
        }
        io.sockets.in(roomName).emit('readyResponse',"Player"+playerNumber);
        io.sockets.in(roomName).emit('readyResponse',roomName);
        if(rooms[roomName][1]==2)
        {
            start(rooms[Number(roomName)][0]);
        }
       
    });
    
    socket.on('leaveRoom',function(data){
        socket.leave(data);
        rooms[Number(data)][1]=0;
    });
    /*socket.on('start',function(data){
        io.sockets.in(data.id).emit('readyResponse',"started");
        time=window.setInterval(step,1000);
    });*/
    socket.on('Enter',function(data){
        var i = Number(data.id);
        if(data.number==1)
        {
            if(roomVars[i].get('playerPower')>50)
            {
                roomVars[i].set('ballVX',0); 
                 roomVars[i].set('ballVY',0); 
                roomVars[i].set('playerPower',roomVars[i].get('playerPower')-50);
            }
        }
        else{
            if(roomVars[i].get('player2Power')>50)
            {
                roomVars[i].set('ballVX',0); 
                 roomVars[i].set('ballVY',0); 
                roomVars[i].set('player2Power',roomVars[i].get('player2Power')-50);
            }
        }
       
    });
    socket.on('keyDown',function(data){
        var i = Number(data.id);
        if(data.arrow=='right'){
            if(data.number==1)
            {
                roomVars[i].set('playerVX',30);
                roomVars[i].set('playerAX',0);
            }
            else{
                roomVars[i].set('player2VX',30);
                roomVars[i].set('player2AX',0);
            }
        }
        else if(data.arrow=='left'){
            if(data.number==1)
            {
                roomVars[i].set('playerVX',-30);
                roomVars[i].set('playerAX',0);
            }
            else{
                roomVars[i].set('player2VX',-30);
                roomVars[i].set('player2AX',0);
            }
        }
        else{
            if(data.number==1)
            {
                if(roomVars[i].get('playerY')>=750){
                roomVars[i].set('playerVY',-50);
                }
            }
            else{
                if(roomVars[i].get('player2Y')>=750){
                roomVars[i].set('player2VY',-50);
                }
            }
        }
    });
    
    socket.on('keyUp',function(data){
        var i = Number(data.id);
        if(data.arrow=='right'){
            if(data.number==1)
            {
                if(roomVars[i].get('playerVX')==30){
                 roomVars[i].set('playerAX',-3)}
            }
            else{
                if(roomVars[i].get('player2VX')==30){
                 roomVars[i].set('player2AX',-3)}
            }
        }
        else{
            if(data.number==1)
            {
                if(roomVars[i].get('playerVX')==-30){
                 roomVars[i].set('playerAX',3)}
            }
            else{
                if(roomVars[i].get('player2VX')==-30){
                 roomVars[i].set('player2AX',3)}
            }
        }
    });
    function start(roomName){
        io.sockets.in(roomName).emit('readyResponse',"started");
        if(started==0)
        {
            time = setInterval(step,10);
        }
        started++;
        /*
        var ballX = 625;
        var ballY = 300;
        var ballVX=0;
        var ballVY=0;
        var gravity=7;
        var playerX =300;
        var playerY = 750;
        var playerVY=0;
        var playerVX=0;
        var playerAX=0;
        var ballCoolX=false;
        var ballCoolY=false;
        var player2X =300;
        var player2Y = 750;
        var player2VY=0;
        var player2VX=0;
        var player2AX=0;
        */
        roomVars[Number(roomName)]= new Map();
        roomVars[Number(roomName)].set('ballX',625);
        roomVars[Number(roomName)].set('ballY',300);
        roomVars[Number(roomName)].set('ballVX',0);
        roomVars[Number(roomName)].set('ballVY',0);
        roomVars[Number(roomName)].set('ballCoolX',false);
        roomVars[Number(roomName)].set('ballVoolY',false);
        
        roomVars[Number(roomName)].set('playerX',300);
        roomVars[Number(roomName)].set('playerY',750);
        roomVars[Number(roomName)].set('playerVX',0);
        roomVars[Number(roomName)].set('playerVY',0);
        roomVars[Number(roomName)].set('playerAX',0);
        
        roomVars[Number(roomName)].set('player2X',950);
        roomVars[Number(roomName)].set('player2Y',750);
        roomVars[Number(roomName)].set('player2VX',0);
        roomVars[Number(roomName)].set('player2VY',0);
        roomVars[Number(roomName)].set('player2AX',0);
        roomVars[Number(roomName)].set('score',0);
        roomVars[Number(roomName)].set('playerPower',0);
        roomVars[Number(roomName)].set('player2Power',0);
        
            
    }
    socket.on('leaveRoom',function(roomName){
       socket.leave(roomName); 
    });
    function end(winner,i){
        io.sockets.in(rooms[i][0]).emit('end',winner);
        //start--
        // if(started==0)
        // {
        //     clearInterval(time);
        // }
        
        rooms[i][1]==0;
    }
    function step(){
        for(var i=0;i<rooms.length;i++)
        {
            if(rooms[i][1]==2)
            {
                
                roomVars[i].set('playerPower',roomVars[i].get('playerPower')+.1);
                roomVars[i].set('player2Power',roomVars[i].get('player2Power')+.1);
                var dY = roomVars[i].get('ballVY')*10/100;
    			var dX = roomVars[i].get('ballVX')*10/100;
                roomVars[i].set('ballY',roomVars[i].get('ballY')+dY);
                roomVars[i].set('ballX',roomVars[i].get('ballX')+dX);
                roomVars[i].set('ballVY',roomVars[i].get('ballVY') + (gravity*10/100));
                
                if(roomVars[i].get('ballX')+20>=1250||roomVars[i].get('ballX')-20<=0)
                {
    
                    if(!roomVars[i].get('ballCoolX')){
                    roomVars[i].set('ballVX',roomVars[i].get('ballVX')*-0.95);
                    roomVars[i].set('ballCoolX',true);
                    }
                    //console.log(ballVX);
                    
                }
                else{
                    roomVars[i].set('ballCoolX',false);
                }
                if(roomVars[i].get('ballY')+20>=750||roomVars[i].get('ballY')-20<=0)
                {
                    
                    if(!roomVars[i].get('ballCoolY')){
                    roomVars[i].set('ballVY',roomVars[i].get('ballVY')*-0.95);
                    roomVars[i].set('ballCoolY',true);
                    }
    
                    
                }
                else{
                    roomVars[i].set('ballCoolY',false);
                }
                if((Math.abs(roomVars[i].get('ballY')+20-515)<=5&&(roomVars[i].get('ballX')>=1065||roomVars[i].get('ballX')<=185)))
                {
                    roomVars[i].set('ballVY',roomVars[i].get('ballVY')*-0.95);
                }
                if(roomVars[i].get('ballY')-20>530&&roomVars[i].get('ballX')>=1065)
                {
                    roomVars[i].set('score',roomVars[i].get('score')+10);
                    if(roomVars[i].get('score')/10>=5)
                    {
                         var data = {ballX : roomVars[i].get('ballX'), ballY : roomVars[i].get('ballY'), playerX : roomVars[i].get('playerX'), playerY : roomVars[i].get('playerY'), player2X : roomVars[i].get('player2X'), player2Y : roomVars[i].get('player2Y'),score:roomVars[i].get('score')};
                        io.sockets.in(rooms[i][0]).emit('draw',data);
                        end(1,i);
                    }
                    else{
                    roomVars[i].set('ballX',625);
                    roomVars[i].set('ballY',300);
                    roomVars[i].set('ballVX',0);
                    roomVars[i].set('ballVY',0);
                    roomVars[i].set('ballCoolX',false);
                    roomVars[i].set('ballVoolY',false);
                    
                    roomVars[i].set('playerX',300);
                    roomVars[i].set('playerY',750);
                    roomVars[i].set('playerVX',0);
                    roomVars[i].set('playerVY',0);
                    roomVars[i].set('playerAX',0);
                    
                    roomVars[i].set('player2X',950);
                    roomVars[i].set('player2Y',750);
                    roomVars[i].set('player2VX',0);
                    roomVars[i].set('player2VY',0);
                    roomVars[i].set('player2AX',0);
                    }
                }
                if(roomVars[i].get('ballY')-20>530&&roomVars[i].get('ballX')<=185)
                {
                    roomVars[i].set('score',roomVars[i].get('score')+1);
                    if(roomVars[i].get('score')%10>=5)
                    {
                         var data = {ballX : roomVars[i].get('ballX'), ballY : roomVars[i].get('ballY'), playerX : roomVars[i].get('playerX'), playerY : roomVars[i].get('playerY'), player2X : roomVars[i].get('player2X'), player2Y : roomVars[i].get('player2Y'),score:roomVars[i].get('score')};
                        io.sockets.in(rooms[i][0]).emit('draw',data);
                        end(2,i);
                    }
                    else{
                    roomVars[i].set('ballX',625);
                    roomVars[i].set('ballY',300);
                    roomVars[i].set('ballVX',0);
                    roomVars[i].set('ballVY',0);
                    roomVars[i].set('ballCoolX',false);
                    roomVars[i].set('ballVoolY',false);
                    
                    roomVars[i].set('playerX',300);
                    roomVars[i].set('playerY',750);
                    roomVars[i].set('playerVX',0);
                    roomVars[i].set('playerVY',0);
                    roomVars[i].set('playerAX',0);
                    
                    roomVars[i].set('player2X',950);
                    roomVars[i].set('player2Y',750);
                    roomVars[i].set('player2VX',0);
                    roomVars[i].set('player2VY',0);
                    roomVars[i].set('player2AX',0);
                    }
                }
                
                
                //185,515,1065
                //Slimes
                //keypresses
                
                //roomVars[i].get('')
                if(roomVars[i].get('playerVY')!=0){
                var pdY=roomVars[i].get('playerVY')*10/100;
                roomVars[i].set('playerY',roomVars[i].get('playerY')+pdY); 
                roomVars[i].set('playerVY',roomVars[i].get('playerVY') + (gravity*10/100));
                if(roomVars[i].get('playerY')>=750){
                    roomVars[i].set('playerVY',0);
                    }
                }
                if(roomVars[i].get('playerX')+65>=1250){
                    roomVars[i].set('playerX',1250-65);
                }
                if(roomVars[i].get('playerX')-65<=0){
                    roomVars[i].set('playerX',65);
                }
                var pdX=roomVars[i].get('playerVX')*10/100;
                roomVars[i].set('playerX',roomVars[i].get('playerX')+pdX);
                roomVars[i].set('playerVX',roomVars[i].get('playerVX')+(roomVars[i].get('playerAX')*10/100));
                if(Math.abs(roomVars[i].get('playerVX'))<2){
                        roomVars[i].set('playerVX',0);
                        roomVars[i].set('playerAX',0);
                    } 
                    
                
                
                if(roomVars[i].get('player2VY')!=0){
                var pdY=roomVars[i].get('player2VY')*10/100;
                roomVars[i].set('player2Y',roomVars[i].get('player2Y')+pdY); 
                roomVars[i].set('player2VY',roomVars[i].get('player2VY') + (gravity*10/100));
                if(roomVars[i].get('player2Y')>=750){
                    roomVars[i].set('player2VY',0);
                    }
                }
                if(roomVars[i].get('player2X')+65>=1250){
                    roomVars[i].set('player2X',1250-65);
                }
                if(roomVars[i].get('player2X')-65<=0){
                    roomVars[i].set('player2X',65);
                }
                var pdX=roomVars[i].get('player2VX')*10/100;
                roomVars[i].set('player2X',roomVars[i].get('player2X')+pdX);
                roomVars[i].set('player2VX',roomVars[i].get('player2VX')+(roomVars[i].get('player2AX')*10/100));
                if(Math.abs(roomVars[i].get('player2VX'))<2){
                        roomVars[i].set('player2VX',0);
                        roomVars[i].set('player2AX',0);
                    }
            var xDist1 = roomVars[i].get('ballX')-roomVars[i].get('playerX');
            var yDist1 = roomVars[i].get('ballY')-roomVars[i].get('playerY');
            var xDist2 = roomVars[i].get('ballX')-roomVars[i].get('player2X');
            var yDist2 = roomVars[i].get('ballY')-roomVars[i].get('player2Y');
            var playBallDist = Math.pow(xDist1,2)+Math.pow(yDist1,2);
            var play2BallDist = Math.pow(xDist2,2)+Math.pow(yDist2,2);
            //console.log(playBallDist);
            if(playBallDist<=(Math.pow(85,2))&&roomVars[i].get('ballY')-20<=roomVars[i].get('playerY'))
            {
                //if(ballY>=playerY)
                //{
                //    ballVY=((Math.sqrt(4225-Math.pow((ballX-playerX))))*(Math.abs(ballVX)+Math.abs(playerVX)))/75
                //    ballVX=((ballX-playerX)*(Math.abs(ballVX)+Math.abs(playerVX)))/75;
                //}
                roomVars[i].set('ballVY',yDist1);
                roomVars[i].set('ballVX',xDist1);
                //console.log("hit");
            }
            if(play2BallDist<=(Math.pow(85,2))&&roomVars[i].get('ballY')-20<=roomVars[i].get('player2Y'))
            {
                //if(ballY>=playerY)
                //{
                //    ballVY=((Math.sqrt(4225-Math.pow((ballX-playerX))))*(Math.abs(ballVX)+Math.abs(playerVX)))/75
                //    ballVX=((ballX-playerX)*(Math.abs(ballVX)+Math.abs(playerVX)))/75;
                //}
                roomVars[i].set('ballVY',yDist2);
                roomVars[i].set('ballVX',xDist2);
                //console.log("hit");
            }
                
                
                var data = {ballX : roomVars[i].get('ballX'), ballY : roomVars[i].get('ballY'), playerX : roomVars[i].get('playerX'), playerY : roomVars[i].get('playerY'), player2X : roomVars[i].get('player2X'), player2Y : roomVars[i].get('player2Y'),score:roomVars[i].get('score')};
                io.sockets.in(rooms[i][0]).emit('draw',data);
            }
        }
    }
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});
