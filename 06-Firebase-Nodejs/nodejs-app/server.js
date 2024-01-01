// Firebase
var admin = require("firebase-admin");

var serviceAccount = require("./cad2324-2223239-firebase-adminsdk-r20f1-7a8e71c07d.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cad2324-2223239-default-rtdb.europe-west1.firebasedatabase.app"
});

// My Server
const express = require('express')();
const http = require('http');
const webSocket = require('ws');

express.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

const port = 8081;
const server = http.createServer(express);
const wss = new webSocket.Server({ server });

wss.on('connection', function connection(ws) {
    console.log("Client connected")

    ws.on('message', function incoming(data) {
        data = data.toString("utf8")

        //console.log(typeof data)
        console.log(data);
        //console.log(wss.clients)
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === webSocket.OPEN) {
                client.send(data);
            }
        })
        
    })

    ws.on("close", () => {
        console.log("Cliente disconnected");
    });

    ws.onerror = function () {
        console.log("Some Error occurred");
    }

})

server.listen(port, function() {
    console.log("Server is listening on 127.0.0.1:" + port + "!")
})