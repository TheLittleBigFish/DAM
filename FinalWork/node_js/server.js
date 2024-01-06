const express = require('express')();
const http = require('http');
const https = require('https');
const webSocket = require('ws');
const { response } = require("express");
var admin = require("firebase-admin");
var { CLIENT_CODES, SERVER_CODES } = require("./server_codes.js")


// Firebase Stuff


var serviceAccount = require("./finalworkhtm-firebase-adminsdk-i8qgi-b890c4ff90.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://finalworkhtm-default-rtdb.europe-west1.firebasedatabase.app"
});


// Initialize Firebase
const database = admin.database();

//database.ref("topics").set({topic: "hello", wow: "it worked!!!"});

// Read the Firebase

let allTopics = []
let allRules = [];

database.ref("topics").once("value", function (snapshot){
    let data = snapshot.val();
    //console.log(data);

    if (data !== null){
        console.log("Got Topics");
        allTopics = data;
        console.log(allTopics[1].APIs[0].vals)
    } 
});

database.ref("rules").once("value", function (snapshot){
    let data = snapshot.val();
    //console.log(data);

    if (data !== null){
        console.log("Got Rules");
        allRules = data;
        console.log(allRules)
    }
});





// Start the API Timers

let allAPITimers = [];

const regFindArr = /\[(\d+)\]/; // Finds the first number surronded by "[" "]"

function accessAPIObjKeyVal (obj, accStr) {
    let levelVar = obj;
    
    try {
        let arr = accStr.split(".");
        arr.forEach(key => {
            //console.log("Key:" + key)
            
            let index = key.match(regFindArr)
            //console.log("Index:" + index)
            
            if (index === null){
                levelVar = levelVar[key];
            } else {
                //console.log("Index:" + index[1])
                if (key.indexOf("[") !== 0){
                    levelVar = levelVar[key.split("[")[0]][Number.parseInt(index[1])];
                } else {
                    levelVar = levelVar[Number.parseInt(index[1])];
                }
            }

            // Porra como é que o js não manda erro quando o index do array é maior que este???
            if (levelVar === undefined){
                throw new Error("Its fucking undefined!!!")
            }
            
            //console.log("New levelVar:")
            //console.log(levelVar)
        });

    } catch (error) {
        levelVar = "Error: Wrong Code";        
    }

    return levelVar;
}

function getAPIInfo(API){
    return new Promise((resolve, reject) => {
        if (API.link.split(":")[0] === "http"){
            //console.log(API.link)
            http.get(API.link, (response) => {
                let data = "";

                response.on("data", (chunck) => {
                    data += chunck;
                })

                response.on("end", () => {
                    let completeData = JSON.parse(data);
                    //console.log(completeData)

                    API.vals.forEach(valObj => {
                        if (valObj.type === "1"){
                            valObj.val = accessAPIObjKeyVal(completeData, valObj.code);
                            //console.log(valObj.val);
                        }
                    });

                    resolve(null);
                })
            }).on("error", (err) => {
                console.log("Oh no error: " + err.message);
                reject({type: "ERROR", verb: "HTTP GET error"});
            })
        } else if (API.link.split(":")[0] === "https") {
            https.get(API.link, (response) => {
                let data = "";

                response.on("data", (chunck) => {
                    data += chunck;
                })

                response.on("end", () => {
                    let completeData = JSON.parse(data);
                    //console.log(completeData)

                    API.vals.forEach(valObj => {
                        if (valObj.type === "1"){
                            valObj.val = accessAPIObjKeyVal(completeData, valObj.code);
                            //console.log(valObj.val);
                        }
                    });

                    resolve(null);
                })
            }).on("error", (err) => {
                console.log("Oh no error: " + err.message);
                reject({type: "ERROR", verb: "HTTP GET error"});
            })
        }
    });
}

async function APIgetInfoUpdateCliente(API){
    let topicIndex = allTopics.findIndex(topicObj => topicObj.id === API.id.split("-")[0])
    let APIIndex = allTopics[topicIndex].APIs.findIndex(APIObj => APIObj.id === API.id)
    let APIObj = allTopics[topicIndex].APIs[APIIndex]
    //console.log("Update API")
    let error = await getAPIInfo(APIObj)

    if (error === null){
        // Check if rules apply
        allRules.every(ruleObj => {
            if (ruleObj.ruleOn && ruleObj.APICompareId === APIObj.id){
                let valCompObj = APIObj.vals.find(valObj => valObj.id === ruleObj.valCompareId)

                if (valCompObj === undefined){
                    return true;
                }

                console.log(ruleObj)

                if (Number.parseFloat(ruleObj.compareToValue) === NaN && Number.parseFloat(valCompObj.val) !== NaN 
                    || Number.parseFloat(ruleObj.compareToValue) !== NaN && Number.parseFloat(valCompObj.val) === NaN){
                    return true;
                }

                let check = false;

                if (Number.parseFloat(ruleObj.compareToValue) === NaN){
                    console.log("In String")
                    if (valCompObj.val === ruleObj.compareToValue){
                        check = true
                    }
                } else {
                    console.log("In Value")
                    console.log(valCompObj.val)
                    console.log(Number.parseFloat(ruleObj.compareToValue))
                    switch(ruleObj.compareOperator){
                        case "eq": if (Number.parseFloat(valCompObj.val) === Number.parseFloat(ruleObj.compareToValue)){check = true} break;
                        case "gt": if (Number.parseFloat(valCompObj.val) > Number.parseFloat(ruleObj.compareToValue)){check = true} break;
                        case "lt": if (Number.parseFloat(valCompObj.val) < Number.parseFloat(ruleObj.compareToValue)){check = true} break;
                        case "ge": if (Number.parseFloat(valCompObj.val) >= Number.parseFloat(ruleObj.compareToValue)){check = true} break;
                        case "le": if (Number.parseFloat(valCompObj.val) <= Number.parseFloat(ruleObj.compareToValue)){check = true} break;
                    }
                }

                console.log("5: " + check)

                if (check){
                    let alterAPI = allTopics.find(topicObj => topicObj.id === ruleObj.APIAlterId.split("-")[0]).APIs.find(APIObj => APIObj.id === ruleObj.APIAlterId);
                    let alterVal = alterAPI.vals.find(valObj => valObj.id === ruleObj.valAlterId);

                    let newAPIObj = {
                        type: "API_ALTER_VALS",
                        code: alterVal.code,
                        val: ruleObj.alterTo
                    }

                    httpRequest(alterAPI.link, "POST", JSON.stringify(newAPIObj));

                    return false;
                }
            }

            return true;
        })
        

        database.ref("topics/" + topicIndex + "/APIs/" + APIIndex + "/vals").set(API.vals);

        wss.clients.forEach(function each(client) {
            if (client.readyState === webSocket.OPEN) {
                client.send(JSON.stringify({"type": SERVER_CODES.API_UPDATE, "API": APIObj}));
            }
        })
    } else {
        console.error(error);
    }

    //console.log(APIIndex);
}

function addAllAPITimers () {
    console.log("Adding all APIs")
    allTopics.forEach(topicObj => {
        topicObj.APIs.forEach(APIObj => {
            if (APIObj.autoTime !== 0){
                console.log("autoTime: " + APIObj.autoTime)

                APIgetInfoUpdateCliente(APIObj);
                let newAPITimer = setInterval(function(){APIgetInfoUpdateCliente(APIObj)}, Number.parseInt(APIObj.autoTime) * 1000);
                
                allAPITimers.push({name: APIObj.id, timer: newAPITimer});
            }
        })
    })
}

setTimeout(() => {
    addAllAPITimers();
}, 2500);



function clearAllAPITimers () {
    allAPITimers.forEach(APITimerObj => {
        clearInterval(APITimerObj.timer);
    });

    allAPITimers = [];
}


// HTTP Request template 
//const postData = JSON.stringify({par: "oi", "fel": "if"});

function httpRequest (url, method, data, httpRespObj){
    return new Promise((resolve, reject) => {
        let options = {
            //host: "http://192.168.1.69:1880/test",
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
    
        let request = http.request(url, options, (response) => {
            let data = "";
    
            response.on("data", (chunck) => {
                data += chunck;
            })
    
            response.on("end", () => {
                httpRespObj = JSON.parse(data);
    
                //console.log(completeData)
            })
        }).on("error", (err) => {
            console.log("Oh no error: " + err.message);
            reject({type: "ERROR", verb: "HTTP PUSH timeout 5s"})
        })
    
        request.write(data);
        request.end();

        request.setTimeout(5000, () => {
            reject({type: "ERROR", verb: "HTTP PUSH error"})
        })
    
        resolve(null);
    })
}

async function APIpushInfoUpdateCliente(link, value){
    // Could not find an API that takes objects so use my format
    let newAPIObj = {
        type: "API_ALTER_VALS",
        code: value.code,
        val: value.val
    }

    let topicIndex = allTopics.findIndex(topicObj => topicObj.id === value.id.split("-")[0])
    let APIIndex = allTopics[topicIndex].APIs.findIndex(APIObj => APIObj.id === value.id.split("-").slice(0, -1).join("-"))
    let valIndex = allTopics[topicIndex].APIs[APIIndex].vals.findIndex(valObj => valObj.id === value.id)
    let APIObj = allTopics[topicIndex].APIs[APIIndex]
    let valObj = APIObj.vals[valIndex];

    //console.log(topicIndex)
    //console.log(APIIndex)
    //console.log(valIndex)
    //console.log(APIObj)
    //console.log(valObj)
    //console.log(value)
    
    let httpRespObj;

    let error = await httpRequest(link, 'POST', JSON.stringify(newAPIObj));

    if (error === null){
        console.log(JSON.stringify(valObj))
        valObj.val = value.val;
        console.log(JSON.stringify(valObj))
        database.ref("topics/" + topicIndex + "/APIs/" + APIIndex + "/vals/" + valIndex).set(valObj);

        wss.clients.forEach(function each(client) {
            if (client.readyState === webSocket.OPEN) {
                client.send(JSON.stringify({"type": SERVER_CODES.API_UPDATE, "API": APIObj}));
            }
        })
    } else {
        console.error(error);
    }
}

//httpRequest("http://192.168.1.69:1880/test", 'POST', postData);



// My Server

express.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

const port = 8081;
const server = http.createServer(express);
const wss = new webSocket.Server({ server });


let configTopicsInUseClient = null;
let configRulesInUseClient = null;

wss.on('connection', function connection(ws) {
    console.log("Client connected")

    ws.on('message', function incoming(data) {
        data = data.toString("utf8")
        data = JSON.parse(data);

        console.log("\x1b[105m" + data["type"] + "\x1b[49m");
        console.log(data);

        switch(data["type"]) {
            case CLIENT_CODES.GET_ALL_DATA: 
                ws.send(JSON.stringify({"type": SERVER_CODES.ALL_DATA, "topics": allTopics, "rules": allRules}))
                break;

            case CLIENT_CODES.CONFIG_TOPICS_REQUEST:
                if (configTopicsInUseClient === null){
                    configTopicsInUseClient = ws;
                    ws.send(JSON.stringify({"type": SERVER_CODES.CONFIG_TOPICS_RESPONSE, "ans": "true"}))
                } else {
                    ws.send(JSON.stringify({"type": SERVER_CODES.CONFIG_TOPICS_RESPONSE, "ans": "false"}))
                }
                break;

            case CLIENT_CODES.CONFIG_TOPICS_DONE:
                //console.log(data["altered"] === "true")
                if (data["altered"] === "true"){
                    allTopics = data["topics"];
                    
                    clearAllAPITimers();

                    allTopics.forEach(topicObj => {
                        topicObj.APIs.forEach(APIObj => getAPIInfo(APIObj));
                    });

                    addAllAPITimers();

                    allRules = [];

                    wss.clients.forEach(function each(client) {
                        if (client.readyState === webSocket.OPEN) {
                            client.send(JSON.stringify({"type": SERVER_CODES.REFRESH_TOPICS, "topics": allTopics, "rules": allRules}));
                        }
                    })

                    database.ref("topics").set(allTopics);
                    database.ref("rules").set(allRules);
                }

                configTopicsInUseClient = null;
                break; 

            case CLIENT_CODES.REFRESH_API:
                APIgetInfoUpdateCliente(data["API"]);
                break;

            case CLIENT_CODES.API_INTERACT:
                APIpushInfoUpdateCliente(data["link"], data["value"]);
                break;

            case CLIENT_CODES.CONFIG_RULES_REQUEST:
                if (configRulesInUseClient === null){
                    configRulesInUseClient = ws;
                    ws.send(JSON.stringify({"type": SERVER_CODES.CONFIG_RULES_RESPONSE, "ans": "true"}))
                } else {
                    ws.send(JSON.stringify({"type": SERVER_CODES.CONFIG_RULES_RESPONSE, "ans": "false"}))
                }
                break;
                
            case CLIENT_CODES.CONFIG_RULES_DONE:
                if (data["altered"] === "true"){
                    allRules = data["rules"];

                    wss.clients.forEach(function each(client) {
                        if (client !== ws && client.readyState === webSocket.OPEN) {
                            client.send(JSON.stringify({"type": SERVER_CODES.REFRESH_RULES, "rules": allRules}));
                        }
                    })

                    database.ref("rules").set(allRules);
                }

                configRulesInUseClient = null;
                break;

            case CLIENT_CODES.RULE_INTERACT:
                let ruleIndex = allRules.findIndex(ruleObj => ruleObj.id === data["rule"].id)
                allRules[ruleIndex] = data["rule"]

                wss.clients.forEach(function each(client) {
                    if (client !== ws && client.readyState === webSocket.OPEN) {
                        client.send(JSON.stringify({"type": SERVER_CODES.REFRESH_RULES, "rules": allRules}));
                    }
                })

                database.ref("rules/" + ruleIndex).set(allRules[ruleIndex]);
                break;

            default:
                ws.send(JSON.stringify({"type": SERVER_CODES.SPECIAL.TYPE_UNKOWN}));
        }

        //console.log(typeof data) 
    })

    ws.on("close", () => {
        if (configTopicsInUseClient === ws){
            configTopicsInUseClient = null;
        }
        if (configRulesInUseClient === ws){
            configRulesInUseClient = null;
        }
        console.log("Client disconnected");
    });

    ws.onerror = function () {
        console.log("Some Error occurred");
    }
})


setTimeout(() => {
    server.listen(port, function() {
        console.log("Server is listening on 127.0.0.1:" + port + "!")
    })
}, 3000);

