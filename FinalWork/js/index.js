//import { getDatabase } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
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

    
    // All Topics and APIs
    let allTopics = [];
    let allTopicsCopy = [];

    // All Rules
    let allRules = [];
    let allRulesCopy = [];





    // Websocket - Stuff

    let ws;

    (function initWebSocket() {
        if (ws) {
            ws.onerror = ws.onopen = ws.onclose = null;
            ws.close();
        }

        ws = new WebSocket("ws://127.0.0.1:8081");
        ws.onopen = () => {
            console.log("Connection opened!");


            let sentObj = {"type": "Get_All_Data"};
            sentObj = JSON.stringify(sentObj);

            ws.send(sentObj);
        }

        ws.onmessage = function({data}) {
            data = data.toString("utf8");
            data = JSON.parse(data);

            console.warn(data["type"]);

            switch(data["type"]) {
                case "All_Data":
                    //console.debug('Server response: "All_Data"');
                    onMsgAllData(data);
                    break;

                case "Config_Topics_Response":
                    if (data["ans"] === "true"){
                        configTopicsRequestAccepted();
                    } else {
                        alert("Someone is already configuring!!!");
                    }
                    break;

                case "Config_Rules_Response":
                    if (data["ans"] === "true"){
                        configRulesRequestAccepted();
                    } else {
                        alert("Someone is already configuring!!!");
                    }
                    break;

                case "Refresh_Topics":
                    onMsgAllData(data);
                    break;

                case "Refresh_Rules":
                    onMsgRefreshRules(data);
                    break;

                case "API_Update":
                    console.debug(data["API"].id)
                    let searchTopicId = data["API"].id.split("-")[0];
                    let searchAPIId = data["API"].id

                    let alterAPI = allTopics.find(topicObj => topicObj.id === searchTopicId).APIs.find(APIObj => APIObj.id === searchAPIId); 

                    console.debug(data["API"].vals)

                    alterAPI.vals = data["API"].vals;

                    alterAPI.setClassIdContainerBodyVals()
                    break;

                case "Type_Unkown":
                    console.debug('Server response: "Type_Unkown"');
                    break;

                default:
                    console.warn('Server response type is unkown!! Type: ' + data["type"]);
            }
        }

        ws.onclose = function() {
            ws = null;
        }

        ws.onerror = function(event) {
            console.debug(event)
            alert("There was an error with your WebSocket, the server is probably down");
        }
    })();

    function onMsgAllData(data){
        onMsgRefreshTopics(data);
        onMsgRefreshRules(data);
    }

    function onMsgRefreshTopics(data){
        let newAllTopics = data["topics"];

        allTopics = []
        newAllTopics.forEach(topicJSON => {
            allTopics.push(TopicContainer.fromJSON(topicJSON));
        });

        console.debug(allTopics);

        printAllTopicsToHTML();
    }

    function onMsgRefreshRules(data){
        let newAllRules = data["rules"];

        allRules = []

        newAllRules.forEach(ruleJSON => {
            allRules.push(RuleContainer.fromJSON(ruleJSON));
        });

        console.debug(allRules);

        printAllRulesToHTML();
    }






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
        printAllRulesToHTML();
    });





    // Navbar - Topics Stuff

    // Iniciate the change menu in the dashboard
    $('#navBtn-changeVisualTopics').on("click", function() {
        console.warn("Change Visuals Topics");

        ws.send(JSON.stringify({"type": "Config_Topics_Request"}));
    });

    function configTopicsRequestAccepted() {
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
    }

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

        ws.send(JSON.stringify({"type": "Config_Topics_Done", "altered": "true", "topics": allTopics}));

        exitChangeVisualTopics();
    });

    // Don´t save the change menu
    $('#navBtn-exitVisualTopics').on("click", function() {
        console.warn("Exit");

        printAllTopicsToHTML();

        console.debug(JSON.stringify(allTopics));

        ws.send(JSON.stringify({"type": "Config_Topics_Done", "altered": "false", "topics": []}));

        exitChangeVisualTopics();
    });

    


    
    // Navbar - Rules Stuff
    
    // Iniciate the change menu in the rules
    $('#navBtn-changeVisualRules').on("click", function() {
        console.warn("Change Visuals Rules");

        ws.send(JSON.stringify({"type": "Config_Rules_Request"}));
    });

    function configRulesRequestAccepted() {
        ws.send(JSON.stringify({"type": "Config_Request"}));

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
    }

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

        ws.send(JSON.stringify({"type": "Config_Rules_Done", "altered": "true", "rules": allRules}));

        exitChangeVisualRules();
    });

    // Don´t save the change menu
    $('#navBtn-exitVisualRules').on("click", function() {
        console.warn("Rules Exit");

        printAllRulesToHTML();

        console.debug(JSON.stringify(allRules));

        ws.send(JSON.stringify({"type": "Config_Rules_Done", "altered": "false", "rules": []}));

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
        $('#addAPIModal-btnCreate').show();
        $('#addAPIModal-btnSave').hide();

        $('#addAPIModal').modal('show');

        $("#addAPIModal-valHolder").empty();
        createModalAPInewVariable("1", "", "");

        idTopicAux = $(this).closest("." + TopicContainer.classIdRow).attr("id");
    });

    // Delete Topics
    $("#topics-bottom").on("click", "." + TopicContainer.classIdDelBtnHeader, function() {
        console.warn("Delete Topic"); 
        let topicId = $(this).closest("." + TopicContainer.classIdRow).attr("id");

        console.debug(topicId);
        console.debug(JSON.stringify(allTopicsCopy)); 

        allTopicsCopy.find(obj => obj.id === topicId).getHTMLTop().remove(); // Remove HTML Row
        allTopicsCopy.splice(allTopicsCopy.findIndex(topicObj => topicObj.id === topicId), 1); // Remove from allRows
        
        console.debug(JSON.stringify(allTopicsCopy));
    });

    // Topic - API - Stuff

    // Change API Col Size
    $("#topics-bottom").on("click", "." +  APIContainer.classIdSizeBtnHeader, function() {
        console.warn("Alter Col API"); 
        console.debug(JSON.stringify(allTopicsCopy));

        let topicId = $(this).closest("." + TopicContainer.classIdRow).attr("id");
        let APIId = $(this).closest("." + APIContainer.classIDDiv).attr("id");

        allTopicsCopy.find(topicObj => topicObj.id === topicId).APIs.find(APIObj => APIObj.id === APIId).incLoopColSize(); // Remove HTML Row
        
        console.debug(JSON.stringify(allTopicsCopy));
    });

    // Alter API
    $("#topics-bottom").on("click", "." +  APIContainer.classIdAlterBtnHeader, function() {
        console.warn("Alter API"); 
        console.debug(JSON.stringify(allTopicsCopy));

        let topicId = $(this).closest("." + TopicContainer.classIdRow).attr("id");
        let APIId = $(this).closest("." + APIContainer.classIDDiv).attr("id");
        let APIObj = allTopicsCopy.find(topicObj => topicObj.id === topicId).APIs.find(APIObj => APIObj.id === APIId);
        
        $('#addAPIModal-btnCreate').hide();
        $('#addAPIModal-btnSave').show();

        $('#addAPIModal').modal('show');


        $("#addAPIModal-APIName").val(APIObj.visibleName);
        $("#addAPIModal-APILink").val(APIObj.link);

        if (APIObj.autoTime !== "0"){
            $("#addAPIModal-APISelect").val("2");
            $("#addAPIModal-APIAutoTime").show();
            $("#addAPIModal-APIAutoTime").val(APIObj.autoTime);
        }

        $("#addAPIModal-valHolder").empty();

        APIObj.vals.forEach(valObj => {
            createModalAPInewVariable(valObj.type, valObj.visibleName, valObj.code)
        })

        APITopicAux = APIObj;

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
        topicObj.APIs.splice(topicObj.APIs.findIndex(APIObj => APIObj.id === APIId), 1); 
        
        console.debug(JSON.stringify(allTopicsCopy));
    });

    // Refresh API - Normal Screen
    $("#topics-bottom").on("click", "." +  APIContainer.classIdRefreshBtnHeader, function() {
        console.warn("Refresh API"); 
        console.debug(JSON.stringify(allTopics));

        let topicId = $(this).closest("." + TopicContainer.classIdRow).attr("id");
        let APIId = $(this).closest("." + APIContainer.classIDDiv).attr("id");

        let APIObj = allTopics.find(topicObj => topicObj.id === topicId).APIs.find(APIObj => APIObj.id === APIId);
        
        console.debug("APIObj Sent: " + JSON.stringify(APIObj));

        ws.send(JSON.stringify({"type": "Refresh_API", "API": APIObj}))

        console.debug(JSON.stringify(allTopics));
    });

    // Interact with interface btn
    $("#topics-bottom").on("click", "." +  APIContainer.classIdBtnContainerBody, function() {
        console.warn("Interact Vals: Btn"); 
        //console.debug(JSON.stringify(allTopics));

        let topicId = $(this).closest("." + TopicContainer.classIdRow).attr("id");
        let APIId = $(this).closest("." + APIContainer.classIDDiv).attr("id");
        let valsId = $(this).closest("." + APIContainer.classIdContainerBody).attr("id");

        let APIObj = allTopics.find(topicObj => topicObj.id === topicId).APIs.find(APIObj => APIObj.id === APIId);
        let valObj = APIObj.vals.find(valsObj => valsObj.id === valsId);
        
        console.debug("valObj Sent: " + JSON.stringify(valObj));

        ws.send(JSON.stringify({"type": "API_Interact", "link": APIObj.link, "value": valObj}));

        //console.debug(JSON.stringify(allTopics));
    });

    // Interact with interface toggle
    $("#topics-bottom").on("click", "." +  APIContainer.classIdToggleContainerBody, function() {
        console.warn("Interact Vals: Toggle"); 
        //console.debug(JSON.stringify(allTopics));

        let topicId = $(this).closest("." + TopicContainer.classIdRow).attr("id");
        let APIId = $(this).closest("." + APIContainer.classIDDiv).attr("id");
        let valsId = $(this).closest("." + APIContainer.classIdContainerBody).attr("id");

        let APIObj = allTopics.find(topicObj => topicObj.id === topicId).APIs.find(APIObj => APIObj.id === APIId);
        let valObj = APIObj.vals.find(valsObj => valsObj.id === valsId);

        //console.error($(this).prop("checked"));
        valObj.val = $(this).prop("checked");

        console.debug("valObj Sent: " + JSON.stringify(valObj));

        ws.send(JSON.stringify({"type": "API_Interact", "link": APIObj.link, "value": valObj}));

        //console.debug(JSON.stringify(allTopics));
    });

    // Interact with interface input btn
    $("#topics-bottom").on("click", "." +  APIContainer.classIdInputBtnContainerBody, function() {
        console.warn("Interact Vals: Input btn"); 
        //console.debug(JSON.stringify(allTopics));

        let topicId = $(this).closest("." + TopicContainer.classIdRow).attr("id");
        let APIId = $(this).closest("." + APIContainer.classIDDiv).attr("id");
        let valsId = $(this).closest("." + APIContainer.classIdContainerBody).attr("id");

        let APIObj = allTopics.find(topicObj => topicObj.id === topicId).APIs.find(APIObj => APIObj.id === APIId);
        let valObj = APIObj.vals.find(valsObj => valsObj.id === valsId);

        valObj.val = $(this).siblings("input").val();

        console.debug("valObj Sent: " + JSON.stringify(valObj));

        ws.send(JSON.stringify({"type": "API_Interact", "link": APIObj.link, "value": valObj}));

        //console.debug(JSON.stringify(allTopics));
    });


    // Add API - API modal
    let idTopicAux;
    let APITopicAux;

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
            case 4:
                $(this).css("background", "goldenrod");
                break;
        }
    });

    // Delete the variable
    $("#addAPIModal-valHolder").on('click', '.addAPIModal-APIValDel', function() {
        $(this).parent().remove();
    });


    function createModalAPInewVariable(type, name, code){
        $("#addAPIModal-valHolder").append('<div class="input-group"> \
                                                <select class="costum-selector addAPIModal-APIValSelect"> \
                                                    <option ' + ((type === "1") ? "selected" : "") + ' value="1">Read</option> \
                                                    <option ' + ((type === "2") ? "selected" : "") + ' value="2">Button</option> \
                                                    <option ' + ((type === "3") ? "selected" : "") + ' value="3">Toggle</option> \
                                                    <option ' + ((type === "4") ? "selected" : "") + ' value="4">Input</option> \
                                                </select> \
                                                <input type="text" class="form-control addAPIModal-APIValName" placeholder="Name of value" value="' + name + '"> \
                                                <input type="text" class="form-control addAPIModal-APIVal" placeholder="Value access" value="' + code + '"> \
                                                <button type="button" class="btn btn-danger fa fa-trash addAPIModal-APIValDel"></button> \
                                            </div>');
    }

    // Add a new variable
    $("#addAPIModal-addNewVal").on("click", function() {
        createModalAPInewVariable("1", "", "");
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
        if($("#addAPIModal-APISelect").val() === "2"){
            console.log("In val Holder")
            console.log(typeof $("#addAPIModal-APIAutoTime").val())
            autoTime = $("#addAPIModal-APIAutoTime").val();
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

    // Save the API
    $("#addAPIModal-btnSave").on("click", function() {
        console.warn("Save API"); 

        let id = APITopicAux.id
        let visibleName = $("#addAPIModal-APIName").val();
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
        if($("#addAPIModal-APISelect").val() === "2"){
            console.log("In val Holder")
            console.log(typeof $("#addAPIModal-APIAutoTime").val())
            autoTime = $("#addAPIModal-APIAutoTime").val();
        };


        console.debug(JSON.stringify(allTopicsCopy)); 

        APITopicAux.visibleName = visibleName;
        APITopicAux.link = link;
        APITopicAux.vals = vals;
        APITopicAux.autoTime = autoTime;

        APITopicAux.getHTMLCardBody().empty();
        APITopicAux.getHTMLCardBody().append(APITopicAux.createHTMLValsString());

        //let newAPI = new APIContainer(id, visibleName, 1, link, vals, autoTime);

        console.debug(JSON.stringify(APITopicAux));
        console.debug(JSON.stringify(allTopicsCopy));

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

    // Delete Rule
    $("#rules-bottom").on("click", "." + RuleContainer.classIdDelBtnHeader, function() {
        console.warn("Delete Rule"); 
        let ruleId = $(this).closest("." + RuleContainer.classIdRow).attr("id");

        console.debug(ruleId);
        console.debug(JSON.stringify(allRulesCopy)); 

        allRulesCopy.find(ruleObj => ruleObj.id === ruleId).getHTMLTop().remove(); // Remove HTML Row
        allRulesCopy.splice(allRulesCopy.findIndex(ruleObj => ruleObj.id === ruleId), 1); // Remove from allRules
        
        console.debug(JSON.stringify(allRulesCopy));
    });

    // Control rules IF values when API change 
    $("#rules-bottom").on("change", "." + RuleContainer.classIdAPICompSelBody, function (){
        console.warn("Interact Rules: IF"); 
        console.debug(JSON.stringify(allRulesCopy));

        let ruleID = $(this).closest("." + RuleContainer.classIdRow).attr("id");
        let APIIndex = $(this).val();

        //let allAPI = arrTopics.flatMap(topicObj => topicObj.APIs);


        allRulesCopy.find(ruleObj => ruleObj.id === ruleID).populateValsDropdownList("IF", RuleContainer.arrPopulatedAPIs[APIIndex]);
    });

    // Control rules THEN values when API change 
    $("#rules-bottom").on("change", "." + RuleContainer.classIdAPIAlterSelBody, function (){
        console.warn("Interact Rules: THEN"); 
        console.debug(JSON.stringify(allRulesCopy));

        let ruleID = $(this).closest("." + RuleContainer.classIdRow).attr("id");
        let APIIndex = $(this).val();

        //let allAPI = arrTopics.flatMap(topicObj => topicObj.APIs);


        allRulesCopy.find(ruleObj => ruleObj.id === ruleID).populateValsDropdownList("THEN", RuleContainer.arrPopulatedAPIs[APIIndex]);
    });

    // Check if rule is applied or not
    $("#rules-bottom").on("change", "." + RuleContainer.classIdRuleOnHeader, function (){
        console.warn("Check Avtivate Rule"); 
        console.debug(JSON.stringify(allRules));

        let ruleID = $(this).closest("." + RuleContainer.classIdRow).attr("id");
        let ruleObj = allRules.find(ruleObj => ruleObj.id === ruleID);

        ruleObj.ruleOn = $(this).prop("checked")

        ws.send(JSON.stringify({"type": "Rule_Interact", "rule": ruleObj}))
    });
})();