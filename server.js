/* eslint-disable no-undef */
const express = require('express')
const http = require('http')
let cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const path = require("path") // récuperer l'id de la room
let xss = require("xss")

let server = http.createServer(app)
let io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:8000",
        methods: ["GET", "POST"] 
    }
});

app.use(cors())
app.use(bodyParser.json())

if (process.env.NODE_ENV === 'production') {
	app.use(express.static(__dirname + "/build"))
	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname + "/build/index.html"))
	})
}
app.set('port', (process.env.PORT || 4001))

sanitizeString = (str) => {
	return xss(str)  // cette bibliotheque protege des faille xss
}

connections = {}
messages = {}
let roomUsers = {};

io.on('connection', (socket) => {

    socket.on('joinCall', (path, username) => {
        socket.username = username;
		console.log(` ${username} a rejoin avec l'ID: ${socket.id} dans la room : ${path}`);
		io.to(socket.id).emit('update-user-list', roomUsers[path]);

        if (connections[path] === undefined) { // sinon il m'enquiquine
            connections[path] = [];
        }

        connections[path].push(socket.id); // je stock des sockets id dans la room . connections va contenir la room et la liste des socket id qui sont dans la room


        if (!roomUsers[path]) { // si pas d'users  dans la room -> tableau des users dans la room vide
            roomUsers[path] = [];
        }
        roomUsers[path].push({ id: socket.id, username }); // roomUsers va contenir socket id et usernames (en gros les username présents dans la room)

		// emit de la liste des users dans la room
		io.to(path).emit('update-user-list', roomUsers[path]);
        for (let i = 0; i < connections[path].length; i++) {
			// j'envoie le socket actuel, la liste des sockets id  dans la room et l'username
            io.to(connections[path][i]).emit("user-joined", socket.id, connections[path], username); 
        }
		if (messages[path] !== undefined) {
			for (let i = 0; i < messages[path].length;  i++) {
				io.to(socket.id).emit("chat-message", messages[path][i]['data'],
					messages[path][i]['sender'], messages[path][i]['socket-id-sender'])
			}
		}

	})

	
	socket.on('speechEvent', ({ username }) => {
		socket.broadcast.emit('speech-requested', { username });
	  });

	socket.on('signal', (toId, message) => { // message contient le SDP généré avec createOffer coté front
		io.to(toId).emit('signal', socket.id, message) // on va emmetre le signal d'un socketId  vers les autres sockets
	})

	socket.on('chat-message', (data, sender) => {
		data = sanitizeString(data);// on rend safe (faille xss)
		sender = sanitizeString(sender); // idem

		for (const key in connections) {
			if (connections[key].includes(socket.id)) {

				messages[key] = messages[key] || [];

				messages[key].push({ sender, data, 'socket-id-sender': socket.id });
				connections[key].forEach((key) => {
					io.to(key).emit("chat-message", data, sender, socket.id);
				});
				break;
			}
		}
	});


	socket.on('disconnect', () => {
		for (const key in connections) {
			const index = connections[key].indexOf(socket.id);

			if (index !== -1) {
				connections[key].splice(index, 1);

				connections[key].forEach((recipient) => {
					io.to(recipient).emit("userLeft", socket.id);
				});

				console.log(`User vient de quitter : ${socket.username} avec ID: ${socket.id}`);
				console.log('liste MAJ suite à deco du ou des users:', roomUsers[path]);
				if (connections[key].length === 0) {
					delete connections[key];
				}
				break;
			}
		}
		for (let path in roomUsers) {
			// contient tableau de tous les users dont l'id n'est pas égal au socket id, du coup ça contient les users de la room actuelle
            roomUsers[path] = roomUsers[path].filter(user => user.id !== socket.id); 
            // MAJ de la liste des utilisateurs pour tous les clients de la room
            io.to(path).emit('update-user-list', roomUsers[path]);
        }
	});
})

app.get('/test', (req, res) => {
	res.send('Hello World');
  });


server.listen(app.get('port'), () => {
	console.log("listening on", app.get('port'))
})