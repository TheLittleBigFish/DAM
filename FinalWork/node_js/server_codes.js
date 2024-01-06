// Data types

/**
 * @name CLIENT_CODES
 *  Cliente Requests:
 * - @property {String} GET_ALL_DATA: Requests all data of topics and rules
 * - @property {String} CONFIG_TOPICS_REQUEST: Request to alter the topics data in the server
 * - @property {String} CONFIG_TOPICS_DONE: Request to alter de data in the server (Add topics, APIs, etc)
 *      - "altered": {boolean} if the data was altered
 *      - "topics": all the data on topics
 * - @property {String} CONFIG_RULES_REQUEST: Request to alter the topics data in the server
 * - @property {String} CONFIG_RULES_DONE: Request to alter de data in the server (Add topics, APIs, etc)
 *      - "altered": if the data was altered
 *      - "rules": all the data on topics
 * - @property {String} REFRESH_API: Asks for API values update
 *      - "API": the API to refresh
 * - @property {String} API_INTERACT: Request to interact with API Value
 *      - "link": the link for the API
 *      - "value": the value of the interaction
 * - @property {String} RULE_INTERACT: Request to interact with Rule Value
 *      - "rule": the rule to alter
 * 
 *  Special:
 * - @property {String} CLIENT_TEST: Used in client testing
 * - @property {String} TYPE_UNKOWN: Server/Client do not know the sent type
 */

exports.CLIENT_CODES = {
    GET_ALL_DATA: "Get_All_Data",
    CONFIG_TOPICS_REQUEST: "Config_Topics_Request",
    CONFIG_TOPICS_DONE: "Config_Topics_Done",
    CONFIG_RULES_REQUEST: "Config_Rules_Request",
    CONFIG_RULES_DONE: "Config_Rules_Done",
    REFRESH_API: "Refresh_API",
    API_INTERACT: "API_Interact",
    RULE_INTERACT: "Rule_Interact",
    SPECIAL: {
        CLIENT_TEST: "Client_Test",
        TYPE_UNKOWN: "Type_Unkown" }
}


/**
 * @name SERVER_CODES
 *  Server Responses:
 * - "All_Data": Sends all the data on topics and rules
 *      - "topics": all the data on topics
 *      - "rules": all the data on rules
 * 
 * - "All_Topics": Sends all the data on topics and rules
 *      - "topics": all the data on topics
 * 
 * - "All_Rules": Sends all the data on topics and rules
 *      - "rules": all the data on rules
 * 
 * - "Config_Topics_Response": "Config_Topics_Request" response
 *      - "ans": true or false depending if it was accepted or not
 * 
 * - "Config_Rules_Response": "Config_Rules_Request" response
 *      - "ans": true or false depending if it was accepted or not
 * 
 * - "Refresh_Topics": Send request to cliente to soft refresh the topics page
 *      - "topics": all the data on topics 
 *      - "rules": all the data on rules
 * 
 * - "Refresh_Rules": Send request to cliente to soft refresh the rules page
 *      - "rules": all the data on rules
 *      - "topics": all the data on topics
 *
 * - "API_Update": Send when timer reaches 0 
 *      - "API": the API data updated 
 *
 *  Special:
 * - "Refresh_Client": When config is done ask for global refresh
 * 
 * - "Server_Test": Used in server testing
 * 
 * - "Type_Unkown": Server/Client do not know the sent type
 */

exports.SERVER_CODES = {
    ALL_DATA: "All_Data",
    ALL_TOPICS: "All_Topics",
    ALL_RULES: "All_Rules",
    CONFIG_TOPICS_RESPONSE: "Config_Topics_Response",
    CONFIG_RULES_RESPONSE: "Config_Rules_Response",
    REFRESH_TOPICS: "Refresh_Topics",
    REFRESH_RULES: "Refresh_Rules",
    API_UPDATE: "API_Update",
    RULE_UPDATE: "Rule_Update",
    SPECIAL: {
        REFRESH_CLIENT: "Refresh_Client",
        SERVER_TEST: "Server_Test",
        TYPE_UNKOWN: "Type_Unkown" }
}