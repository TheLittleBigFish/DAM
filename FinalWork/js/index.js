import { getDatabase } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import myLib from "./myLib.js"
import {TopicContainer, APIContainer, RuleContainer} from "./myClasses.js"

/** 
 * Unsolved Problems:
 * - If the number of topics is bigger than 100000 the site loops for ever
 * - If the number APIs in a topic is bigger than 100000 the site loops for ever
 * 
 */ 

var app = (function() {
'use strict';

    //TODO: Check for equal names when name change

    // All Topics and APIs
    let allTopics = [];
    let allTopicsCopy = [];

    // All Rules
    let allRules = [];
    let allRulesCopy = [];


    function printAllTopicsToHTML () {
        $("#topics-bottom").empty();
        
        allTopics.forEach(topicObj => {
            //console.debug("printAllRowsToHTML: " + JSON.stringify($(rowObj.createHTMLString())));
            $("#topics-bottom").append($(topicObj.createHTMLString()));
            topicObj.toggleTopicOptions();

            topicObj.APIs.forEach(APIObj => {
                topicObj.getHTMLCardBody().append($(APIObj.createHTMLString()));
                APIObj.toggleAPIOptions();
            });
        }); 
        
    }; 

    function printAllRulesToHTML() {
        $("#rules-bottom").empty();
        
        allRules.forEach(ruleObj => {
            //console.debug("printAllRowsToHTML: " + JSON.stringify($(rowObj.createHTMLString())));
            $("#rules-bottom").append($(ruleObj.createHTMLString()));
            ruleObj.populateAPIDropdownLists(allTopics)
            ruleObj.toggleRuleOptions();
        }); 
        
    }; 



    // Navbar

    // Change to dashboard tab
    $('#navBtn-dashboard').on("click", function() {
        console.warn("Change to Topics");
        $('#rules-container').hide();
        $('#navBtn-changeVisualRules').hide();
        $('#navBtn-rules').removeClass("active")
        $('#navBtn-dashboard').addClass("active")
        $('#navBtn-changeVisualTopics').show();
        $('#topics-container').show();
        printAllTopicsToHTML();
    });

    // Change to rules tab
    $('#navBtn-rules').on("click", function() {
        console.warn("Change to Rules");
        $('#topics-container').hide();
        $('#navBtn-changeVisualTopics').hide();
        $('#navBtn-dashboard').removeClass("active")
        $('#navBtn-rules').addClass("active")
        $('#navBtn-changeVisualRules').show();
        $('#rules-container').show();
    });





    // Navbar - Topics Stuff

    // Iniciate the change menu in the dashboard
    $('#navBtn-changeVisualTopics').on("click", function() {
        console.warn("Change Visuals Topics");

        $("#navBtn-dashboard").hide();
        $('#navBtn-rules').hide()
        $("#navBtn-options").hide();

        $("#btn-addTopic").show();
        $("#navBtn-saveExitVisualTopics").show();
        $("#navBtn-exitVisualTopics").show();
        

        let arrJSON = []        
  
        allTopics.forEach(topicObj => {
            arrJSON.push(topicObj.toJSON());

            topicObj.toggleTopicOptions();

            topicObj.APIs.forEach(APIObj => {
                APIObj.toggleAPIOptions();
            });
        });

        allTopicsCopy = []
        JSON.parse(JSON.stringify(arrJSON)).forEach(topicJSON => {
            allTopicsCopy.push(TopicContainer.fromJSON(topicJSON));
        });;

        //console.log(allRowsCopy)
    });

    function exitChangeVisualTopics() {
        $("#btn-addTopic").hide();
        $("#navBtn-saveExitVisualTopics").hide();
        $("#navBtn-exitVisualTopics").hide();

        $("#navBtn-dashboard").show();
        $('#navBtn-rules').show()
        $("#navBtn-options").show();
    }

    // Save the change menu
    $('#navBtn-saveExitVisualTopics').on("click", function() {
        console.warn("Exit - Save Changes");

        allTopics = []
        allTopicsCopy.forEach(topicJSON => {
            allTopics.push(TopicContainer.fromJSON(topicJSON));
        });

        allTopics.forEach(topicObj => {
            topicObj.toggleTopicOptions();

            topicObj.APIs.forEach(APIObj => {
                APIObj.toggleAPIOptions();
            });
        });

        console.debug(JSON.stringify(allTopics));

        exitChangeVisualTopics();
    });

    // Don´t save the change menu
    $('#navBtn-exitVisualTopics').on("click", function() {
        console.warn("Exit");

        printAllTopicsToHTML();

        console.debug(JSON.stringify(allTopics));

        exitChangeVisualTopics();
    });

    


    
    // Navbar - Rules Stuff
    
    // Iniciate the change menu in the rules
    $('#navBtn-changeVisualRules').on("click", function() {
        console.warn("Change Visuals Rules");

        $("#navBtn-dashboard").hide();
        $('#navBtn-rules').hide()
        $("#navBtn-options").hide();

        $("#btn-addRule").show();
        $("#navBtn-saveExitVisualRules").show();
        $("#navBtn-exitVisualRules").show();
        

        let arrJSON = []        
  
        allRules.forEach(ruleObj => {
            arrJSON.push(ruleObj.toJSON());

            ruleObj.toggleRuleOptions();
        });

        allRulesCopy = []
        JSON.parse(JSON.stringify(arrJSON)).forEach(ruleJSON => {
            allRulesCopy.push(RuleContainer.fromJSON(ruleJSON));
        });; 

        //console.log(allRowsCopy)
    });

    function exitChangeVisualRules() {
        $("#btn-addRule").hide();
        $("#navBtn-saveExitVisualRules").hide();
        $("#navBtn-exitVisualRules").hide();

        $("#navBtn-dashboard").show();
        $('#navBtn-rules').show()
        $("#navBtn-options").show();
    }

    // Save the change menu
    $('#navBtn-saveExitVisualRules').on("click", function() {
        console.warn("Rules Exit - Save Changes");

        allRules = []
        allRulesCopy.forEach(ruleJSON => {
            allRules.push(RuleContainer.fromJSON(ruleJSON));
        });

        allRules.forEach(ruleObj => {
            ruleObj.toggleRuleOptions();
        });

        console.debug(JSON.stringify(allRules));

        exitChangeVisualRules();
    });

    // Don´t save the change menu
    $('#navBtn-exitVisualRules').on("click", function() {
        console.warn("Rules Exit");

        printAllRulesToHTML();

        console.debug(JSON.stringify(allTopics));

        exitChangeVisualRules();
    });





    // Topic - Stuff
    
    // Add new topic obj
    $("#btn-addTopic").on("click", function() {
        console.warn("Add Topic"); 
        console.debug(JSON.stringify(allTopicsCopy)); 

        let id;

        do {
            id = "Topic_" + Math.floor(Math.random() * 10000);
        } while (allTopicsCopy.find(topicObj => topicObj.id === id));

        let newTopic = new TopicContainer(id, id);
        $("#topics-bottom").append($(newTopic.createHTMLString()));
        allTopicsCopy.push(newTopic);

        console.debug(JSON.stringify(newTopic)); // JSON.stringify() need cause the cons.log is async
    });

    //Bubbling and capturing
    //Capture click event of created topics

    // Add API
    $("#topics-bottom").on("click", "." + TopicContainer.classIdAddBtnHeader, function() {
        console.debug("Add API");
        //console.debug($(this).closest(".topic-topParent").attr("id").split("-").pop());
        $('#addAPIModal').modal('show');
        idTopicAux = $(this).closest("." + TopicContainer.classIdRow).attr("id");
    });

    // Delete Topics
    $("#topics-bottom").on("click", "." + TopicContainer.classIdDelBtnHeader, function() {
        console.warn("Delete Topic"); 
        let topicId = $(this).closest("." + TopicContainer.classIdRow).attr("id");

        console.debug(topicId);
        console.debug(JSON.stringify(allTopicsCopy)); 

        allTopicsCopy.find(obj => obj.id === topicId).getHTMLTop().remove(); // Remove HTML Row
        delete allTopicsCopy.splice(allTopicsCopy.findIndex(topicObj => topicObj.id === topicId), 1); // Remove from allRows
        
        console.debug(JSON.stringify(allTopicsCopy));
    });

    // Topic - API - Stuff

    // Change API Col Size
    $("#topics-bottom").on("click", "." +  APIContainer.classIdSizeBtnHeader, function() {
        console.warn("Alter API"); 
        console.debug(JSON.stringify(allTopicsCopy));

        let topicId = $(this).closest("." + TopicContainer.classIdRow).attr("id");
        let APIId = $(this).closest("." + APIContainer.classIDDiv).attr("id");

        allTopicsCopy.find(topicObj => topicObj.id === topicId).APIs.find(APIObj => APIObj.id === APIId).incLoopColSize(); // Remove HTML Row
        
        console.debug(JSON.stringify(allTopicsCopy));
    });

    // Delete API
    $("#topics-bottom").on("click", "." +  APIContainer.classIdDelBtnHeader, function() {
        console.warn("Del API"); 
        console.debug(JSON.stringify(allTopicsCopy));

        let topicId = $(this).closest("." + TopicContainer.classIdRow).attr("id");
        let APIId = $(this).closest("." + APIContainer.classIDDiv).attr("id");


        let topicObj = allTopicsCopy.find(topicObj => topicObj.id === topicId);
        topicObj.APIs.find(APIObj => APIObj.id === APIId).getHTMLTop().remove(); // Remove HTML Row
        delete topicObj.APIs.splice(topicObj.APIs.findIndex(APIObj => APIObj.id === APIId), 1); 
        
        console.debug(JSON.stringify(allTopicsCopy));
    });

    // Refresh API
    $("#topics-bottom").on("click", "." +  APIContainer.classIdRefreshBtnHeader, function() {
        console.warn("Refresh API"); 
        console.debug(JSON.stringify(allTopicsCopy));

        let topicId = $(this).closest("." + TopicContainer.classIdRow).attr("id");
        let APIId = $(this).closest("." + APIContainer.classIDDiv).attr("id");

        let APIObj = allTopicsCopy.find(topicObj => topicObj.id === topicId).APIs.find(APIObj => APIObj.id === APIId);
        
        console.debug("APIObj Sent: " + JSON.stringify(APIObj));

        console.debug(JSON.stringify(allTopicsCopy));
    });

    // Interact with interface btn
    $("#topics-bottom").on("click", "." +  APIContainer.classIdBtnContainerBody, function() {
        console.warn("Interact Vals: Btn"); 
        console.debug(JSON.stringify(allTopicsCopy));

        let topicId = $(this).closest("." + TopicContainer.classIdRow).attr("id");
        let APIId = $(this).closest("." + APIContainer.classIDDiv).attr("id");
        let valsId = $(this).closest("." + APIContainer.classIdContainerBody).attr("id");

        let valObj = allTopicsCopy.find(topicObj => topicObj.id === topicId).APIs.find(APIObj => APIObj.id === APIId).vals.find(valsObj => valsObj.id === valsId); // Remove HTML Row
        
        console.debug("valObj Sent: " + JSON.stringify(valObj));

        // TODO: Sed valObj to server

        console.debug(JSON.stringify(allTopicsCopy));
    });

    // Interact with interface toggle
    $("#topics-bottom").on("click", "." +  APIContainer.classIdToggleContainerBody, function() {
        console.warn("Interact Vals: Toggle"); 
        console.debug(JSON.stringify(allTopicsCopy));

        let topicId = $(this).closest("." + TopicContainer.classIdRow).attr("id");
        let APIId = $(this).closest("." + APIContainer.classIDDiv).attr("id");
        let valsId = $(this).closest("." + APIContainer.classIdContainerBody).attr("id");

        let valObj = allTopicsCopy.find(topicObj => topicObj.id === topicId).APIs.find(APIObj => APIObj.id === APIId).vals.find(valsObj => valsObj.id === valsId); // Remove HTML Row
        
        console.error($(this).prop("checked"));
        valObj.val = $(this).prop("checked");

        console.debug("valObj Sent: " + JSON.stringify(valObj));

        // TODO: Sed valObj to server

        console.debug(JSON.stringify(allTopicsCopy));
    });

    // Add API - API modal
    let idTopicAux = "";

    // Control the style of the auto time
    $("#addAPIModal-APISelect").on('change', function() {
        let selectVal = Number.parseInt($("#addAPIModal-APISelect").val());
        console.debug("selectVal: " + selectVal);
        if (selectVal === 1){
            $("#addAPIModal-APIAutoTime").hide();
        } else {
            $("#addAPIModal-APIAutoTime").show();
        }
    });

    // Control the btn color of the type
    $("#addAPIModal-valHolder").on('change', '.addAPIModal-APIValSelect', function() {
        let selectVal = Number.parseInt($(this).val());
        console.debug("selectVal: " + selectVal);
        switch (selectVal) {
            case 1:
                $(this).css("background", "darkgreen");
                break;
            case 2:
                $(this).css("background", "darkred");
                break;
            case 3:
                $(this).css("background", "darkblue");
                break;
        }
    });

    // Add a new variable
    $("#addAPIModal-addNewVal").on("click", function() {
        $("#addAPIModal-valHolder").append('<div class="input-group"> \
                                                <select class="costum-selector addAPIModal-APIValSelect"> \
                                                    <option selected value="1">Read</option> \
                                                    <option value="2">Button</option> \
                                                    <option value="3">Toggle</option> \
                                                </select> \
                                                <input type="text" class="form-control addAPIModal-APIValName" placeholder="Name of value"> \
                                                <input type="text" class="form-control addAPIModal-APIVal" placeholder="Value access"> \
                                            </div>');
    });

    function exitAPIModal() {
        $("#addAPIModal-APIName").val("");
        $("#addAPIModal-APILink").val("");

        $("#addAPIModal-APISelect").val(1).change();
        
        $("#addAPIModal-valHolder").empty();
        $("#addAPIModal-valHolder").append('<div class="input-group"> \
                                                <select class="costum-selector addAPIModal-APIValSelect"> \
                                                    <option selected value="1">Read</option> \
                                                    <option value="2">Button</option> \
                                                    <option value="3">Toggle</option> \
                                                </select> \
                                                <input type="text" class="form-control addAPIModal-APIValName" placeholder="Name of value"> \
                                                <input type="text" class="form-control addAPIModal-APIVal" placeholder="Value access"> \
                                            </div>');
        $('#addAPIModal').modal('hide');
    }

    // Create the API
    $("#addAPIModal-btnCreate").on("click", function() {
        console.warn("Add API"); 

        let visibleName = $("#addAPIModal-APIName").val();

        let topicId = idTopicAux.split("-").pop();
        console.debug(topicId);
        let topicObj = allTopicsCopy.find(topicObj => topicObj.id === topicId);
        let id;
        do {
            id = topicObj.id + "-API_" + Math.floor(Math.random() * 10000);
        } while (topicObj.APIs.find(APIObj => APIObj.id === id));

        let link = $("#addAPIModal-APILink").val();

        let vals = [] 
        //console.debug(Object.values($("#addAPIModal-valHolder").children()).slice(0, $("#addAPIModal-valHolder").children().length))

        Object.values($("#addAPIModal-valHolder").children()).slice(0, $("#addAPIModal-valHolder").children().length).forEach(val => {
            let children = $(val).children()
            //console.error(val + ".children(): type: " + $(children[0]).val() + " name: " + $(children[1]).val() + " code: " + $(children[2]).val())
            
            let valId;

            do {
                valId = id + "-Val_" + Math.floor(Math.random() * 10000);
            } while (vals.find(valObj => valObj.id === valId));

            let valsObj = APIContainer.createValsObj($(children[0]).val(), valId, $(children[1]).val(), $(children[2]).val());
            vals.push(valsObj);
        });
        console.log(vals);

        let autoTime = 0;
        if($("#addAPIModal-valHolder").val() === 2){
            autoTime = Number.parseInt($("#addAPIModal-APIAutoTime").val());
        };


        console.debug(JSON.stringify(allTopicsCopy)); 

        let newAPI = new APIContainer(id, visibleName, 1, link, vals, autoTime);
        
        topicObj.getHTMLCardBody().append($(newAPI.createHTMLString()));
        
        console.debug(topicObj)
        topicObj.APIs.push(newAPI);

        console.debug(JSON.stringify(newAPI));
        console.debug(JSON.stringify(allTopicsCopy));

        exitAPIModal();
    });

    // Close the modal without saving
    $("#addAPIModal-btnClose").on("click", function(){
        exitAPIModal();
    });

    



    // Rules - Stuff

    // Add Rules
    $("#btn-addRule").on("click", function(){
        console.warn("Add Rule"); 

        console.debug(JSON.stringify(allRulesCopy)); 

        let allAPI = allTopics.flatMap(topicObj => topicObj.APIs);

        if (allAPI.length === 0){
            alert("Create some APIs first!!!");
            return;
        }

        let id;

        do {
            id = "Rule_" + Math.floor(Math.random() * 10000);
        } while (allRulesCopy.find(ruleObj => ruleObj.id === id));

        let newRule = new RuleContainer(id, id);
        $("#rules-bottom").append($(newRule.createHTMLString()));
        allRulesCopy.push(newRule);

        newRule.populateAPIDropdownLists(allTopics);

        console.debug(JSON.stringify(newRule));
        console.debug(JSON.stringify(allRulesCopy));
    });

    // Control rules IF values when API change 
    $("#rules-bottom").on("change", "." + RuleContainer.classIdAPICompSelBody, function (){
        console.warn("Interact Rules: IF"); 
        console.debug(JSON.stringify(allTopicsCopy));

        let ruleID = $(this).closest("." + RuleContainer.classIdRow).attr("id");
        let APIIndex = $(this).val();

        //let allAPI = arrTopics.flatMap(topicObj => topicObj.APIs);


        allRulesCopy.find(ruleObj => ruleObj.id === ruleID).populateValsDropdownList("IF", RuleContainer.arrPopulatedAPIs[APIIndex]);
    });

    // Control rules THEN values when API change 
    $("#rules-bottom").on("change", "." + RuleContainer.classIdAPIAlterSelBody, function (){
        console.warn("Interact Rules: THEN"); 
        console.debug(JSON.stringify(allTopicsCopy));

        let ruleID = $(this).closest("." + RuleContainer.classIdRow).attr("id");
        let APIIndex = $(this).val();

        //let allAPI = arrTopics.flatMap(topicObj => topicObj.APIs);


        allRulesCopy.find(ruleObj => ruleObj.id === ruleID).populateValsDropdownList("THEN", RuleContainer.arrPopulatedAPIs[APIIndex]);
    });

    




    
    
    




















    let ceilingLRLights = {name: "ceilingLRLights", value: "OFF"};

    myLib.hello();

    //let clockInterval = setInterval(getTime, 1000);
    function getTime(){
        let fullDate = new Date();

        let date = fullDate.toISOString().split('T')[0];
        let time = fullDate.toISOString().split('T')[1].split('.')[0];

        document.getElementById("Time").innerHTML = time;
        document.getElementById("Date").innerHTML = date;
    }

    function changeIcons (labelIDJSON) {
        switch (labelIDJSON.name) {
            case "ceilingLRLights": 
                myLib.switchLightsIcons("ceilingLRLightsToggle", "ceilingLRLightsIcon", "ceilingLRLightsTime", labelIDJSON.value);
                ceilingLRLights = labelIDJSON;
                break;
            default: console.log("Out of scope!");
        }
    }

    document.getElementById("ceilingLRLightsToggle").onclick = function() {
        if (ceilingLRLights.value === "OFF")
            ceilingLRLights.value = "ON";
        else
            ceilingLRLights.value = "OFF";

        changeIcons(ceilingLRLights)
        
        //console.log(JSON.stringify(ceilingLRLights));
        ws.send(JSON.stringify(ceilingLRLights));
    }




    $("#OWMGet").on("click", function() {
        let link = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
        let key = "e4718b98d69efbf5bbc4796691129fd4";

        let city = $("#OWMInput").val();

        $.get(link + city + "&appid=" + key, function (data) {
            //console.log(data);

            $("#OWMCurrTemp").text(data.main.temp + "ºC");
            $("#OWMMaxTemp").text(data.main.temp_max + "ºC");
            $("#OWMMinTemp").text(data.main.temp_min + "ºC");
            $("#OWMHum").text(data.main.humidity + "%HR");

            let obj = JSON.parse(localStorage.getItem("objWeatherClockInterval"));

            if (obj === null){
                obj = {"clockIntervalID": 0, "time": 0};
            } else {
                clearInterval(obj.clockIntervalID);
                obj.time = 0;
            }

            //obj.clockIntervalID = setInterval(timeOWMGet, 1000, "objWeatherClockInterval");
            
            localStorage.setItem("objWeatherClockInterval", JSON.stringify(obj));
        });
    });

    function timeOWMGet(localStorageVal){
        let obj = JSON.parse(localStorage.getItem(localStorageVal));
        console.log(obj);
        let timeCount = parseInt(++(obj.time));
        localStorage.setItem(localStorageVal, JSON.stringify(obj));

        let timeMinCount = Math.floor(timeCount / 60);
        let timeHoursCount = Math.floor(timeMinCount / 60);

        if (timeCount < 60){
            $("#OWMLastUp").text(timeCount + " seconds ago");
        } else if (timeMinCount < 60) {
            $("#OWMLastUp").text(timeMinCount + ":" + (timeCount % 60) + " seconds ago");
        } else {
            $("#OWMLastUp").text(timeHoursCount + ":" + (timeMinCount % 60) + ":" + (timeCount % 60) + " seconds ago");
        }
    }


    let ws;

    (function initWebSocket() {
        if (ws) {
            ws.onerror = ws.onopen = ws.onclose = null;
            ws.close();
        }

        ws = new WebSocket("ws://127.0.0.1:8081");
        ws.onopen = () => {
            console.log("Connection opened!");
        }

        ws.onmessage = function({data}) {
            data = data.toString("utf8");
            data = JSON.parse(data);

            console.log(data);

            changeIcons(data);
        }

        ws.onclose = function() {
            ws = null;
        }
    })();


    /*
    setInterval(teste, 1000);

    function teste(){
        console.log("teste");
        ws.send(JSON.stringify("teste"));
    }*/


    

})();