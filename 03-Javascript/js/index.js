var app = (function() {
'use strict';
    //alert("Hello World");

    var clockInterval = setInterval(getTime, 1000);
    function getTime(){
        var fullDate = new Date();

        var date = fullDate.toISOString().split('T')[0];
        var time = fullDate.toISOString().split('T')[1].split('.')[0];

        //console.log(time);
        //console.log(date);

        document.getElementById("Time").innerHTML = time;
        document.getElementById("Date").innerHTML = date;
    }
    
    document.getElementById("ceilingLRLightsToggle").onclick = function() {
        document.getElementById("ceilingLRLightsToggle").classList.toggle("fa-toggle-off");
        document.getElementById("ceilingLRLightsToggle").classList.toggle("fa-toggle-on");

        document.getElementById("ceilingLRLightsIcon").classList.toggle("text-warning");
        document.getElementById("ceilingLRLightsIcon").classList.toggle("fas");
        document.getElementById("ceilingLRLightsIcon").classList.toggle("far");

        document.getElementById("ceilingLRLightsTime").innerHTML = "bbbbb";
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
        var link = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
        var key = "e4718b98d69efbf5bbc4796691129fd4";

        var city = $("#OWMInput").val();

        $.get(link + city + "&appid=" + key, function (data) {
            console.log(data);

            $("#OWMCurrTemp").text(data.main.temp + "ºC");
            $("#OWMMaxTemp").text(data.main.temp_max + "ºC");
            $("#OWMMinTemp").text(data.main.temp_min + "ºC");
            $("#OWMHum").text(data.main.humidity + "%HR");

            var obj = JSON.parse(localStorage.getItem("objWeatherClockInterval"));

            if (obj === null){
                var obj = {"clockIntervalID": 0, "time": 0};
            } else {
                clearInterval(obj.clockIntervalID);
                obj.time = 0;
            }

            obj.clockIntervalID = setInterval(timeOWMGet, 1000, "objWeatherClockInterval");
            
            localStorage.setItem("objWeatherClockInterval", JSON.stringify(obj));
        });
    });

    function timeOWMGet(localStorageVal){
        var obj = JSON.parse(localStorage.getItem(localStorageVal));
        console.log(obj);
        var timeCount = parseInt(++(obj.time));
        localStorage.setItem(localStorageVal, JSON.stringify(obj));

        var timeMinCount = Math.floor(timeCount / 60);
        var timeHoursCount = Math.floor(timeMinCount / 60);

        if (timeCount < 60){
            $("#OWMLastUp").text(timeCount + " seconds ago");
        } else if (timeMinCount < 60) {
            $("#OWMLastUp").text(timeMinCount + ":" + (timeCount % 60) + " seconds ago");
        } else {
            $("#OWMLastUp").text(timeHoursCount + ":" + (timeMinCount % 60) + ":" + (timeCount % 60) + " seconds ago");
        }
    }

    
})();