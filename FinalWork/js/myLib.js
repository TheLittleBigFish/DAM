export default {
    hello: function() {
        console.log("hello");
    },

    switchLightsIcons: function (labelToggle, labelIcon, LabelTime, ONOFF) {
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

}

//myLib.prototype.hello = function 