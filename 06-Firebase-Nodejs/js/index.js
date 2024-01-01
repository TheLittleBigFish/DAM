import { getDatabase } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

var app = (function() {
'use strict';
    //alert("Hello World");

    let ceilingLRLights = {name: "ceilingLRLights", value: "OFF"};

    window.app2.hello();



    let clockInterval = setInterval(getTime, 1000);
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
                toggleLightsIcons("ceilingLRLightsToggle", "ceilingLRLightsIcon", "ceilingLRLightsTime", labelIDJSON.value);
                ceilingLRLights = labelIDJSON;
                break;
            default: console.log("Out of scope!");
        }
    }

    
    function toggleLightsIcons (labelToggle, labelIcon, LabelTime, ONOFF) {
        if (ONOFF === "ON"){
            document.getElementById(labelToggle).classList.remove("fa-toggle-off");
            document.getElementById(labelToggle).classList.add("fa-toggle-on");
            document.getElementById(labelIcon).classList.remove("far");
            document.getElementById(labelIcon).classList.add("fas");
            document.getElementById(labelIcon).classList.add("text-warning");
        } else {
            document.getElementById(labelToggle).classList.remove("fa-toggle-on");
            document.getElementById(labelToggle).classList.add("fa-toggle-off");
            document.getElementById(labelIcon).classList.remove("fas");
            document.getElementById(labelIcon).classList.remove("text-warning");
            document.getElementById(labelIcon).classList.add("far");
        }
        //document.getElementById(labelToggle).classList.toggle("fa-toggle-off");

        document.getElementById(LabelTime).innerHTML = "bbbbb";
    }

    document.getElementById("ceilingLRLightsToggle").onclick = function() {
        if (ceilingLRLights.value === "OFF")
            ceilingLRLights.value = "ON";
        else
            ceilingLRLights.value = "OFF";

        changeIcons(ceilingLRLights)
        
        console.log(JSON.stringify(ceilingLRLights));
        ws.send(JSON.stringify(ceilingLRLights));
    }






    $("#ceilingLRMusicToggle").on("click", function() {
        $("#ceilingLRMusicToggle").toggleClass("fa-toggle-off");
        $("#ceilingLRMusicToggle").toggleClass("fa-toggle-on");

        $("#ceilingLRMusicIcon").toggleClass("fa-spin");

        if ($("#ceilingLRMusicIcon").hasClass("fa-spin")){
            $("#ceilingLRMusicIcon").css("color", "#00ff80");
        } else {
            $("#ceilingLRMusicIcon").css("color", "#000000");
        }   
    });


    $("#OWMGet").on("click", function() {
        let link = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
        let key = "e4718b98d69efbf5bbc4796691129fd4";

        let city = $("#OWMInput").val();

        $.get(link + city + "&appid=" + key, function (data) {
            console.log(data);

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

            obj.clockIntervalID = setInterval(timeOWMGet, 1000, "objWeatherClockInterval");
            
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