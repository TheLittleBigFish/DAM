export class TopicContainer {
    static classID = "topic-"
    static classIdRow = TopicContainer.classID + "row";
    static classIdCardHeader = TopicContainer.classID + "cardHeader"
    static classIdBHeader = TopicContainer.classID + "b"
    static classIdInputHeader = TopicContainer.classID + "input"
    static classIdAddBtnHeader = TopicContainer.classID + "addBtn"
    static classIdDelBtnHeader = TopicContainer.classID + "delBtn"
    static classIdCardBody = TopicContainer.classID + "cardBody"

    /**
     * @param {String} id 
     * @param {String} visibleName 
     * @param {Array} APIs 
     */
    constructor(id, visibleName, APIs = []) {
        this.id = id;
        this.visibleName = visibleName;
        this.APIs = APIs;
    }
    
    createHTMLString() {
        let API = '<div id=' + this.id + ' class="py-2 ' + TopicContainer.classIdRow + '"> \
                        <div class="card text-white bg-secondary"> \
                            <h2 class="card-header d-flex flex-row ' + TopicContainer.classIdCardHeader + '"> \
                                <b style="display: none" class="' + TopicContainer.classIdBHeader + ' overflow-hidden">' + this.visibleName + '</b> \
                                <input type="text" class="form-control ' + TopicContainer.classIdInputHeader + '" value="' + this.visibleName + '"> \
                                <button type="button" class="btn btn-secondary fa fa-plus ' + TopicContainer.classIdAddBtnHeader + '"></button> \
                                <button type="button" class="btn btn-danger fa fa-trash ' + TopicContainer.classIdDelBtnHeader + '"></button> \
                            </h2> \
                            <div class="card-body px-2 py-2"> \
                                <div class="row gx-2 gy-2 ' + TopicContainer.classIdCardBody + '"></div>\
                            </div> \
                        </div> \
                    </div>'
        return API;
    };

    getHTMLTop() {
        return $("#" + this.id);
    };

    getHTMLCardHeader() {
        return $("#" + this.id).find("." + TopicContainer.classIdCardHeader);
    }

    getHTMLCardBody() {
        return $("#" + this.id).find("." + TopicContainer.classIdCardBody);
    }

    toggleTopicOptions() {
        $("#" + this.id).find("." + TopicContainer.classIdBHeader).toggle();
        $("#" + this.id).find("." + TopicContainer.classIdInputHeader).toggle();
        $("#" + this.id).find("." + TopicContainer.classIdDelBtnHeader).toggle();
        $("#" + this.id).find("." + TopicContainer.classIdAddBtnHeader).toggle();

        if ($("#" + this.id).find("." + TopicContainer.classIdBHeader).is(':visible')) {
            let newName = $("#" + this.id).find("." + TopicContainer.classIdInputHeader).val();
            $("#" + this.id).find("." + TopicContainer.classIdBHeader).text(newName);

            //$("#" + this.id).attr("id", newName);
            this.visibleName = newName;
        }
    } 

    toJSON() {
        let APIArrParsed = [];
        this.APIs.forEach(APIObj => {
            APIArrParsed.push(APIObj.toJSON());
        });
        return {id: this.id,
                visibleName: this.visibleName,
                APIs: APIArrParsed};
    }

    static fromJSON(rowJSON) {
        let arrAPIs = [];
        rowJSON.APIs.forEach(APIJSON => {
            arrAPIs.push(APIContainer.fromJSON(APIJSON));
        });

        return new TopicContainer(rowJSON.id, rowJSON.visibleName, arrAPIs)
    }
}

export class APIContainer {
    static classID = "API-";
    static classIDDiv = APIContainer.classID + "div";
    static classIdCardHeader = APIContainer.classID + "cardHeader";
    static classIdBHeader = APIContainer.classID + "b";
    static classIdRefreshBtnHeader = APIContainer.classID + "refreshBtn";
    static classIdInputHeader = APIContainer.classID + "input";
    static classIdDropBtnHeader = APIContainer.classID + "dropBtn";
    static classIdSizeBtnHeader = APIContainer.classID + "sizeBtn";
    static classIdAlterBtnHeader = APIContainer.classID + "alterBtn";
    static classIdDelBtnHeader = APIContainer.classID + "delBtn";
    static classIdCardBody = APIContainer.classID + "cardBody";
    static classIdContainerBody = APIContainer.classID + "infContainer-";
    static classIdReadContainerBody = APIContainer.classID + "readContainer";
    static classIdBtnContainerBody = APIContainer.classID + "btnContainer";
    static classIdToggleContainerBody = APIContainer.classID + "toggleContainer";
    static classIdInputBtnContainerBody = APIContainer.classID + "inputBtnContainer";
    


    static colSizesTxt = {1: "Small", 2: "Medium", 3: "Large", 4: "XLarge"};

    static createValsObj =  function(type, id, visibleName, code, val = null){
                                switch (type) {
                                    case "1":
                                        val = "Def";
                                        break;
                                    case "2":
                                        val = true;
                                        break;
                                    case "3":
                                        val = false
                                        break;
                                    case "4":
                                        val = "";
                                        break;
                                }
        
                                return {type: type, 
                                        id: id, 
                                        visibleName: visibleName, 
                                        code: code, 
                                        val: val}
                            };
    static valsObjTypesTxt = {1: "Read", 2: "Button", 3: "Toggle"};

    /**
     * @param {String} id 
     * @param {String} visibleName 
     * @param {Number} cardSize 
     * @param {String} link 
     * @param {Array} vals 
     * @param {Number} autoTime 
     */
    constructor(id, visibleName, cardSize, link, vals, autoTime) {
        this.id = id;
        this.visibleName = visibleName;

        if (cardSize <= 0 || cardSize > 4 || !(Number.isInteger(cardSize))){
            throw new Error("Size must be int from 1 to 4, size: " + cardSize);
        }

        this.cardSize = cardSize;
        this.link = link;
        this.vals = vals;
        this.autoTime = autoTime; // if 0 its manual
    }

    getHTMLTop() {
        return $("#" + this.id);
    }

    getHTMLCardBody() {
        return $("#" + this.id).find("." + APIContainer.classIdCardBody);
    }

    setClassIdContainerBodyVals() {
        this.vals.forEach(valObj => {
            switch (valObj.type){
                        case "1":
                            $("#" + this.id).find("#" + valObj.id).find("." + APIContainer.classIdReadContainerBody).text(valObj.val);
                            break;
                        case "3":
                            $("#" + this.id).find("#" + valObj.id).find("." + APIContainer.classIdToggleContainerBody).prop("checked", valObj.val);
                            break;
                        case "4":
                            $("#" + this.id).find("#" + valObj.id).find("." + APIContainer.classIdInputBtnContainerBody).siblings("input").val(valObj.val);
                            break;
                        case "2":
                    }
        })  
    }

    #colSize(colType) {
        return ({   "md": (this.cardSize * 6 > 12) ? 12 : this.cardSize * 6,
                    "lg": (this.cardSize * 4 > 12) ? 12 : this.cardSize * 4,
                    "xl": (this.cardSize * 3 > 12) ? 12 : this.cardSize * 3})[colType];
    }

    createHTMLValsString() {
        let valsHTML = "";

        this.vals.forEach(valObj => {
            let valStr = '<div class="row my-2 mx-0 ' + APIContainer.classIdContainerBody + '" id="' + valObj.id + '"> \
                        <label class="col-5 col-form-label">' + valObj.visibleName + '</label>'

            switch (valObj.type){
                case "2": // Button
                    valStr += '<button class="btn btn-secondary col-7 ' + APIContainer.classIdBtnContainerBody + '" disabled>Send</button>';
                    break;
                case "3": // Toggle
                    valStr += '<div class="form-check form-switch col-7 align-self-center"><input style="width: 3rem; height: 1.5rem;" class="form-check-input float-end ' + APIContainer.classIdToggleContainerBody + '" type="checkbox" role="switch" disabled ' + ((valObj.val === true) ? "checked" : "") + '></div>';
                    break;
                case "4": // Input val
                    valStr += '<div class="form-check form-switch col-7 align-self-center px-0"><div class="input-group"><input type="text" class="form-control" placeholder="Value send" value="' + valObj.val + '"><button type="button" class="btn btn-secondary ' + APIContainer.classIdInputBtnContainerBody + '" disabled>\>\></button></div></div>';
                    break;
                case "1": // Read
                default: // Read
                    valStr += '<span class="col-7 align-self-center text-center ' + APIContainer.classIdReadContainerBody + '">' + valObj.val + '</span>';
            }
            
            valStr += '</div>';   
            valsHTML += valStr;
        });

        return valsHTML;
    }

    createHTMLString() {
        let APIHTML;

        console.debug("md: " + this.#colSize("md") + " lg: " + this.#colSize("lg") + " xl: " + this.#colSize("xl"))

        APIHTML = '<div id="' + this.id + '" class="col-sm-12 col-md-' + this.#colSize("md") + ' col-lg-' + this.#colSize("lg") + ' col-xl-' + this.#colSize("xl") + ' ' + APIContainer.classIDDiv + '"> \
                    <div class="card"> \
                        <h5 class="card-header d-flex flex-row ' + APIContainer.classIdCardHeader + '"> \
                            <b style="display: none" class="align-self-center ' + APIContainer.classIdBHeader + ' overflow-hidden">' + this.visibleName + '</b>'
        

        if (this.autoTime === 0){APIHTML += '<button style="display: none" type="button" class="btn btn-light fa fa-refresh ms-auto py-0 ' + APIContainer.classIdRefreshBtnHeader + '"></button>'}                    
                            
        APIHTML +=          '<input type="text" class="form-control ' + APIContainer.classIdInputHeader + '" value="' + this.visibleName + '"> \
                            <div class="dropdown align-self-center"> \
                                <button type="button" class="btn btn-light dropdown-toggle fa fa-cog ' + APIContainer.classIdDropBtnHeader + '" data-bs-toggle="dropdown" aria-expanded="false"></button> \
                                <ul class="dropdown-menu"> \
                                    <li><a class="dropdown-item ' + APIContainer.classIdSizeBtnHeader + '" href="#">Size: ' + APIContainer.colSizesTxt[this.cardSize] + '</a></li> \
                                    <li><a class="dropdown-item ' + APIContainer.classIdAlterBtnHeader + '" href="#">Alter Card</a></li> \
                                    <li><a class="dropdown-item ' + APIContainer.classIdDelBtnHeader + '" href="#">Delete Card</a></li> \
                                </ul> \
                            </div> \
                        </h5> \
                        <div class="card-body px-py-2 ' + APIContainer.classIdCardBody + '">';

        let valStr = this.createHTMLValsString(); 

        APIHTML += valStr + '</div> \
                    </div> \
                </div>';

        return APIHTML;
    }

    incLoopColSize() {
        let newSize = (this.cardSize == 4) ? 1 : (this.cardSize + 1);
        this.changeColSize(newSize)
    }

    /**
     * @param {Number} newSize 
     */
    changeColSize(newSize) {
        $("#" + this.id).removeClass("col-md-" + this.#colSize("md") + " col-lg-" + this.#colSize("lg") + " col-xl-" + this.#colSize("xl"))
        this.cardSize = newSize;
        $("#" + this.id).addClass("col-md-" + this.#colSize("md") + " col-lg-" + this.#colSize("lg") + " col-xl-" + this.#colSize("xl"))
        $("#" + this.id).find("." + APIContainer.classIdSizeBtnHeader).text("Size: " + APIContainer.colSizesTxt[newSize]);
    }

    toggleAPIOptions() {
        let bHeaderObj = $("#" + this.id).find("." + APIContainer.classIdBHeader);
        let inputObj = $("#" + this.id).find("." + APIContainer.classIdInputHeader);
        let refreshBtnObj = $("#" + this.id).find("." + APIContainer.classIdRefreshBtnHeader);

        this.vals.forEach(valObj => {
            switch (valObj.type) {
                case "2":
                    $("#" + valObj.id).find("." + APIContainer.classIdBtnContainerBody).prop("disabled", (i,v) => !v);
                    break;
                case "3":
                    $("#" + valObj.id).find("." + APIContainer.classIdToggleContainerBody).prop("disabled", (i,v) => !v);
                    break;
                case "4":
                    $("#" + valObj.id).find("." + APIContainer.classIdInputBtnContainerBody).prop("disabled", (i,v) => !v);
                    break;
            }
        });

        bHeaderObj.toggle();
        inputObj.toggle();
        refreshBtnObj.toggle();

        $("#" + this.id).find("." + APIContainer.classIdDropBtnHeader).toggle();
        //$("#" + APIContainer.classID + this.name).find("." + APIContainer.classIdSizeBtnHeader).toggle();
        //$("#" + APIContainer.classID + this.name).find("." + APIContainer.classIdDelBtnHeader).toggle();

        
        if (bHeaderObj.is(':visible')) {
            let newName = inputObj.val();
            bHeaderObj.text(newName);

            //$("#" + this.id).attr("id", APIContainer.classID + newName);
            this.visibleName = newName;
        } 
    } 


    toJSON() {
        return {id: this.id,
                visibleName: this.visibleName,
                cardSize: this.cardSize,
                link: this.link,
                vals: this.vals,
                autoTime: this.autoTime};
    }

    static fromJSON(APIJSON) {
        return new APIContainer(APIJSON.id, APIJSON.visibleName, APIJSON.cardSize, APIJSON.link, APIJSON.vals, APIJSON.autoTime);
    }
}

export class RuleContainer {
    static classID = "rule-"
    static classIdRow = RuleContainer.classID + "row";
    static classIdCardHeader = RuleContainer.classID + "cardHeader"
    static classIdRuleOnHeader = RuleContainer.classID + "ruleOn"
    static classIdBHeader = RuleContainer.classID + "b"
    static classIdInputHeader = RuleContainer.classID + "input"
    static classIdDelBtnHeader = RuleContainer.classID + "delBtn"
    static classIdCardBody = RuleContainer.classID + "cardBody"
    static classIdAPICompSelBody = RuleContainer.classID + "APICompSel"
    static classIdAPICompValSelBody = RuleContainer.classID + "APICompValSel"
    static classIdCompOpSelBody = RuleContainer.classID + "compOpSel"
    static classIdCompToValBody = RuleContainer.classID + "compToVal"
    static classIdAPIAlterSelBody = RuleContainer.classID + "APIAlterSel"
    static classIdAPIAlterValSelBody = RuleContainer.classID + "APIAlterValSel"
    static classIdAPIAlterValToValBody = RuleContainer.classID + "APIAlterValToSel"

    static compareOperatorValues = {"eq": "&equals;", "gt": "&gt;", "lt": "&lt;", "ge": "&ge;", "le": "&le;"};

    /**
     * @param {String} id 
     * @param {String} visibleName 
     * @param {String} APICompareId 
     * @param {String} valCompareId 
     * @param {String} compareOperator 
     * @param {String} compareToValue 
     * @param {String} APIAlterId 
     * @param {String} valAlterId 
     * @param {String} alterTo 
     * @param {Boolean} ruleOn 
     */
    constructor(id, visibleName, APICompareId = null, 
                valCompareId = null, compareOperator = null, 
                compareToValue = "", APIAlterId = null, 
                valAlterId = null, alterTo = "", ruleOn = true) {
        this.id = id;
        this.visibleName = visibleName;

        this.APICompareId = APICompareId;
        this.valCompareId = valCompareId;
        
        this.compareOperator = compareOperator;
        this.compareToValue = compareToValue;

        this.APIAlterId = APIAlterId;
        this.valAlterId = valAlterId;

        this.alterTo = alterTo;

        this.ruleOn = ruleOn;
    }

    createHTMLString () { // row px-2 py-2 gx-0
        return '<div id=' + this.id + ' class="py-2 ' + RuleContainer.classIdRow + '">\
                    <div class="card text-white bg-secondary"> \
                        <h2 class="card-header d-flex flex-row ' + RuleContainer.classIdCardHeader + '" autocomplete="off"> \
                            <input style="display: none" type="checkbox" class="form-check-input my-1 mx-1 ' + RuleContainer.classIdRuleOnHeader + '" ' + ((this.ruleOn) ? "checked" : "") + '>\
                            <b style="display: none" class="' + RuleContainer.classIdBHeader + ' overflow-hidden">' + this.visibleName + '</b> \
                            <input type="text" class="form-control ' + RuleContainer.classIdInputHeader + '" value="' + this.visibleName + '"> \
                            <button type="button" class="btn btn-danger fa fa-trash h-100 ' + RuleContainer.classIdDelBtnHeader + '"></button>\
                        </h2>\
                        <div class="card-body px-2 py-2">\
                            <div class="row row-cols-1 gx-2 gy-2 mx-0">\
                                <div class="col input-group px-0">\
                                    <label class="col-1 input-group-text fw-bold">IF</label>\
                                    <select class="col-5 form-select ' + RuleContainer.classIdAPICompSelBody + '">\
                                    </select>\
                                    <label class="col-1 input-group-text fw-bold">\'s</label>\
                                    <select class="col-5 form-select ' + RuleContainer.classIdAPICompValSelBody + '">\
                                    </select>\
                                </div>\
                                <div class="col input-group px-0">\
                                    <label class="col-1 input-group-text fw-bold">IS</label>\
                                    <select style="max-width: 17%;" class="col-2 form-select form-select-costum ' + RuleContainer.classIdCompOpSelBody + '" data-width="auto">\
                                        <option value="eq" ' + ((this.compareOperator === "eq") ? "selected" : "") + '>&equals;</option>\
                                        <option value="gt" ' + ((this.compareOperator === "gt") ? "selected" : "") + '>&gt;</option>\
                                        <option value="lt" ' + ((this.compareOperator === "lt") ? "selected" : "") + '>&lt;</option>\
                                        <option value="ge" ' + ((this.compareOperator === "ge") ? "selected" : "") + '>&ge;</option>\
                                        <option value="le" ' + ((this.compareOperator === "le") ? "selected" : "") + '>&le;</option>\
                                    </select>\
                                    <label class="col-1 input-group-text fw-bold">TO</label>\
                                    <input style="max-width: 25%;" type="text" class="col-9 form-control text-center ' + RuleContainer.classIdCompToValBody + '" placeholder="Expected Value" value="' + this.compareToValue + '">\
                                </div>\
                                <div class="col input-group px-0">\
                                    <label class="col-1 input-group-text fw-bold">THEN</label>\
                                    <select class="col-4 form-select ' + RuleContainer.classIdAPIAlterSelBody + '">\
                                    </select>\
                                    <label class="col-1 input-group-text fw-bold">\'s</label>\
                                    <select class="col-4 form-select ' + RuleContainer.classIdAPIAlterValSelBody + '">\
                                    </select>\
                                </div>\
                                <div class="col input-group px-0">\
                                    <label class="col-1 input-group-text fw-bold">IS</label>\
                                    <input style="max-width: 25%;" type="text" class="col-2 form-control text-center ' + RuleContainer.classIdAPIAlterValToValBody + '" placeholder="Expected Value" value="' + this.alterTo + '">\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>'
    }

    getHTMLTop() {
        return $("#" + this.id);
    };

    static arrPopulatedAPIs = [];

    /**
     * @param {TopicContainer} arrTopics 
     */
    populateAPIDropdownLists(arrTopics){
        let allAPI = arrTopics.flatMap(topicObj => topicObj.APIs);
        RuleContainer.arrPopulatedAPIs = allAPI;
        //console.debug(JSON.stringify(allAPI));

        
        let seletedCompIndex = 0;
        if (this.APICompareId !== null){
            seletedCompIndex = allAPI.findIndex(APIObj => APIObj.id === this.APICompareId)
        }

        let seletedAlterIndex = 0;
        if (this.APIAlterId !== null){
            seletedAlterIndex = allAPI.findIndex(APIObj => APIObj.id === this.APIAlterId)
        }
        
        let thisObj = $("#" + this.id);
        thisObj.find("." + RuleContainer.classIdAPICompSelBody).empty();
        thisObj.find("." + RuleContainer.classIdAPIAlterSelBody).empty();

        
        allAPI.forEach((APIObj, index) => {
            thisObj.find("." + RuleContainer.classIdAPICompSelBody).append('<option value="' + index + '" ' + ((index === seletedCompIndex) ? "selected" : "") + '>' + APIObj.visibleName + '</option>');
            thisObj.find("." + RuleContainer.classIdAPIAlterSelBody).append('<option value="' + index + '" ' + ((index === seletedAlterIndex) ? "selected" : "") + '>' + APIObj.visibleName + '</option>');
        })

        this.populateValsDropdownList("IF", allAPI[seletedCompIndex]);
        this.populateValsDropdownList("THEN", allAPI[seletedAlterIndex]);
    }

    /**
     * @param {String} listType can be "IF" or "THEN" list
     * @param {APIContainer} APIObj 
     */
    populateValsDropdownList(listType, APIObj){
        listType = listType.toUpperCase();
        
        if (listType !== "IF" && listType !== "THEN"){
            throw new RangeError("listType must be 'IF' or 'THEN'")
        }

        let thisObj = $("#" + this.id);

        if (listType === "IF"){
            thisObj.find("." + RuleContainer.classIdAPICompValSelBody).empty();

            APIObj.vals.forEach((valObj, index) => {
                console.error(valObj.id);
                console.error(this.valCompareId);
                thisObj.find("." + RuleContainer.classIdAPICompValSelBody).append('<option value="' + index + '" ' + ((valObj.id === this.valCompareId) ? "selected" : "") + '>' + valObj.visibleName + '</option>');
            })
        } else {
            thisObj.find("." + RuleContainer.classIdAPIAlterValSelBody).empty();

            APIObj.vals.forEach((valObj, index) => {

                thisObj.find("." + RuleContainer.classIdAPIAlterValSelBody).append('<option value="' + index + '" ' + ((valObj.id === this.valAlterId) ? "selected" : "") + '>' + valObj.visibleName + '</option>');
            })
        }
    }

    toggleRuleOptions() {
        let thisObj = $("#" + this.id);

        thisObj.find("." + RuleContainer.classIdRuleOnHeader).toggle();

        let inputObj = thisObj.find("." + RuleContainer.classIdInputHeader);
        inputObj.toggle()

        let bHeaderObj = thisObj.find("." + RuleContainer.classIdBHeader);
        bHeaderObj.toggle()
        
        thisObj.find("." + RuleContainer.classIdDelBtnHeader).toggle();

        let APICompObj = thisObj.find("." + RuleContainer.classIdAPICompSelBody)
        APICompObj.prop("disabled", (i, v) => !v);
        APICompObj.toggleClass("form-select-costum-disabled");

        let APICompValObj = thisObj.find("." + RuleContainer.classIdAPICompValSelBody)
        APICompValObj.prop("disabled", (i, v) => !v);
        APICompValObj.toggleClass("form-select-costum-disabled");

        let compOpObj = thisObj.find("." + RuleContainer.classIdCompOpSelBody)
        compOpObj.prop("disabled", (i, v) => !v);

        let compToValObj = thisObj.find("." + RuleContainer.classIdCompToValBody)
        compToValObj.prop("disabled", (i, v) => !v);

        let APIAlterObj = thisObj.find("." + RuleContainer.classIdAPIAlterSelBody)
        APIAlterObj.prop("disabled", (i, v) => !v);
        APIAlterObj.toggleClass("form-select-costum-disabled");

        let APIAlterValObj = thisObj.find("." + RuleContainer.classIdAPIAlterValSelBody)
        APIAlterValObj.prop("disabled", (i, v) => !v);
        APIAlterValObj.toggleClass("form-select-costum-disabled");

        let APIAlterValToObj = thisObj.find("." + RuleContainer.classIdAPIAlterValToValBody)
        APIAlterValToObj.prop("disabled", (i, v) => !v);
        APIAlterValToObj.toggleClass("form-select-costum-disabled");

        if (bHeaderObj.is(':visible')) {
            let newName = inputObj.val();
            bHeaderObj.text(newName);

            this.visibleName = newName;
            this.APICompareId = RuleContainer.arrPopulatedAPIs[APICompObj.val()].id;
            this.valCompareId = RuleContainer.arrPopulatedAPIs[APICompObj.val()].vals[APICompValObj.val()].id;

            this.compareOperator = compOpObj.val();
            this.compareToValue = compToValObj.val();

            this.APIAlterId = RuleContainer.arrPopulatedAPIs[APIAlterObj.val()].id;
            this.valAlterId = RuleContainer.arrPopulatedAPIs[APIAlterObj.val()].vals[APIAlterValObj.val()].id;

            this.alterTo = APIAlterValToObj.val();
        } 
    }

    toJSON() {
        return {id: this.id,
                visibleName: this.visibleName,
                APICompareId: this.APICompareId,
                valCompareId: this.valCompareId,
                compareOperator: this.compareOperator,
                compareToValue: this.compareToValue,
                APIAlterId: this.APIAlterId,
                valAlterId: this.valAlterId,
                alterTo: this.alterTo,
                ruleOn: this.ruleOn};
    }

    static fromJSON(ruleJSON) {
        return new RuleContainer(ruleJSON.id,
                                    ruleJSON.visibleName, 
                                    ruleJSON.APICompareId, 
                                    ruleJSON.valCompareId, 
                                    ruleJSON.compareOperator, 
                                    ruleJSON.compareToValue, 
                                    ruleJSON.APIAlterId, 
                                    ruleJSON.valAlterId, 
                                    ruleJSON.alterTo,
                                    ruleJSON.ruleOn);
    }
}