
/*
Project Overview. 

What is express --
A minimalist web application framework for Node.js. 
We set up our routing with this application.

What is http --
A set of procedures for sending CRUD requests. 
We use it for setting up our server which adheers to the set of http procedures.

What is socket.io --
A JavaScript library for realtime web applications.
It enables real-time bidirectional event-based communication.
Which we use for setting up connections between clients for realtime chat.

-----------------------------------------------------------------

Project Functionality

User can connect to simplechat web server

All Users Can
-> See chat and read messages
-> See who is currently online
// All of which is updated in realtime, no need to refresh the page. 

To Join Chat Users Must
-> Pick a username which...
   -> Has at least three characters 
   -> Is not already taken
   -> Does not contain white spaces

Users That Have Joined Chat Can
-> Write messages to group chat
-> Send and recieve private messages
// User initiates private message by clicking on a target user from list of online users

TODO

Is typing functionality... (done by broadcasting, with timer.)

*/

//GLOBAL VARIABLES
//SERVER SET UP 
//express initialises app to be a function handler
var app = require('express')();
//we supply app to the http server initialised below
var http = require('http').Server(app);
//initialise an instance of io, apply it to http server
var io = require('socket.io')(http);

//we keep a record of all connected users
//a user is defined as the following {username : name, id : socket.id};
var connectedUsers = [];


//ROUTING 
//Routing handler functions for get requests.
app.get('/', function(req, res){
	//respond by sending index.html
	res.sendFile(__dirname + '/index.html');
});

app.get('/index', function(req, res){
	res.sendFile(__dirname + '/index.html');
});



//CONNECTION HANDLERS 
io.on('connection', function(socket){
		
  // -- Join chat request   --//
  socket.on('join chat', function(name){


    //Pseudo
    //check if name is valid
    //false, respond telling user
    //true, add user to connected users, respond telling user

  	//check if name is valid, if not don't allow join
  	if (nameValidate(name) == false) {
  		socket.emit('join chat', false);
  		return;
  	}

  	//if valid allow to join
  	else {

      console.log("we get here");
      // create new user instance
      // add user to list of connected users 
      // get updated list of users to send to client

  	  var user = {username : name, id : socket.id};
	    connectedUsers.push(user);
	    var users = getUserName();

	    //Send only to connected socket (user who requested name)
	    //notification to close join box so user can't send more name requests
      socket.emit('close join box');
	    socket.emit('add user chat', {number_of_users : connectedUsers.length, username : user.username});

	    //Send to everyone except the connected socket (user who requested the name)
      socket.broadcast.emit('join chat', {user_list : users, username : user.username});
	  }

  });

  socket.on('chat message', function(msg){

  	var user = findUserWith(socket.id);
  	
  	//check socket is in connectedUsers
  	//if not, connected user does not have a name and therefore is not permitted to send messages

  	if (findUserWith(socket.id) == false) {

        //notify client of failed chat attemt
  		socket.emit('chat message', false);

  	}

  	else {

      //send message to all connected sockets
  		io.emit('chat message', user.username + ": " + msg);

  	}
  	
  });

  // object = {message: text, to: targetUserID})
  socket.on('private chat message', function(object){

  	var sender = findUserWith(socket.id);
  	var targetUser = connectedUsers[object.to];
  	var message = object.message;
  	
  	if (findUserWith(socket.id) == false) {

  	   socket.emit('chat message', false);
  	   return;

  	}

  	else {
  		// sending to individual socketid (private message)
  		socket.to(targetUser.id).emit('chat message', sender.username + ' whispers: "' + message + '"');
      // display message to sender
  		socket.emit('chat message', 'You whispered "' + message + '" to: ' + targetUser.username);
  	}
  	
  });

  socket.on('disconnect', function(){

  	let disconnectedUser = findUserWith(socket.id);

    // for users without a name, no need to notify users
    if (disconnectedUser == false) {
      return;
    }

    let user = findUserWith(socket.id);
    let index = connectedUsers.indexOf(disconnectedUser);

    connectedUsers = connectedUsers.filter(e => e !== user);
    
    let users = getUserName();
    console.log(users);
  	io.emit('disconnect', {userList : users, user : user.username, index : index}); 

  });

  // so new users can see who's in chat
	var users = getUserName();
	socket.emit('show connected users', users); 

});


//HELPER FUNCTIONS

//determines if name is valid
function nameValidate(name) {
	//invalid if has space character
	if (name.indexOf(' ') > -1) {return false;}
	//if less than three characters long
    if (name.length < 3) {return false;}
    //if already taken
    else return !(connectedUsers.some(function(e) {return e.username === name;}));    
}

//finds user from list of currently connected users with either a username or socket.id
function findUserWith(attribute) {
	for (i = 0; i < connectedUsers.length; i++) {
		var user = connectedUsers[i];
		if (user.name || user.id == attribute) {
			return user;
		}
	}
	return false;
}	

//returns list of current user names
function getUserName() {
  var toReturn = [];
  for (i = 0; i < connectedUsers.length; i++) {
    toReturn.push(connectedUsers[i].username);
  }
  return toReturn;
}

//set up the http server to listen on port 3000
http.listen(3000, function(){

  console.log('listening on *:3000');

});

//-- CODE GRAVEYARD --/
/*
  	
  	var already_has_name = findUserWith(socket.id);
  	// check user doesn't already have a name, check against socket.id
  	if (already_has_name != false) {
      // return if user already has a name
  		io.emit('chat message', false);
  		return;
  	}

*/











