// this setup is outside of document.ready per doc linked below.
//https://stackoverflow.com/questions/34625764/moment-js-dynamically-update-time-in-seconds

var datetime = null,
        date = null;

var update = function () {
    date = moment(new Date())
    datetime.html(date.format('dddd, DD MMM YY, hh:mm:ss a'));
};

$( document ).ready(function() {
	
//---- Initialize Firebase ------------------------------------

var config = {
	apiKey: "AIzaSyDyYQs0CmPun2h_Ahon3SHzH96AUHW98yQ",
	authDomain: "my-first-firebase-projec-f4684.firebaseapp.com",
	databaseURL: "https://my-first-firebase-projec-f4684.firebaseio.com",
	projectId: "my-first-firebase-projec-f4684",
	storageBucket: "my-first-firebase-projec-f4684.appspot.com",
	messagingSenderId: "9734100086"
};
firebase.initializeApp(config);

//---- VARIABLES -----------------------------------------------

var database = firebase.database();
// Get the modal
var modal = document.getElementById('myModal');
// Get the <span> element that closes the modal	
var span = document.getElementsByClassName("close")[0];	


//---- FUNCTIONS -----------------------------------------------

function modalality() {	
	// Open the modal 
	modal.style.display = "block";
	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
		modal.style.display = "none";
	}
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}
}

//---- Capture button click -------------------------------------
/*---- tried to add some basic validation for the form fields without using any additional plug-ins. after several attempts, including bootstrap and it's forms for validation (which I never got working correctly) i settled on a simple check to see if any of the fields are empty and if so show a modal ( Thanks https://www.w3schools.com ) and don't submit form. I then used the same modal to show when a record is added successfully ----*/
$("#submit").on("click", function() {
	var name = $("#nameInput").val().trim();
    var dest = $("#destInput").val().trim();
    var time = $("#timeInput").val().trim();
    var freq = $("#freqInput").val().trim();
	
	if (name === "" || dest === "" || time === "" || freq === "") {
		//$("#feedback").removeClass("invisible");
		var modCont = $("#modCont");
		modCont.addClass("modal-content-1");
        modCont.removeClass("modal-content-2");
		$("p").empty().append("Please fill in all fields before submitting.");
		modalality();
		return false;		
	}
	else {
		database.ref("/trainTime").push({
			name: name,
			dest: dest,
			time: time,
			freq: freq,
			//timeAdded: firebase.database.ServerValue.TIMESTAMP	
		});
        var modAdded = $("#modCont");
		modAdded.removeClass("modal-content-1");
		modAdded.addClass("modal-content-2");
		$("p").empty().append("Train Schedule Added Successfully.");
		modalality();
		$("input").val("");
		return false;
	}
});

//---- onClick child function -------------------------------------

database.ref("/trainTime").on("child_added", function(childSnapshot){
	var name = childSnapshot.val().name;
	var dest = childSnapshot.val().dest;
	var time = childSnapshot.val().time;
	var freq = childSnapshot.val().freq;

	/*---- START console.logs 
	
	console.log(childSnapshot.val());
	console.log("Name: " + name);
	console.log("Destination: " + dest);
	console.log("Time: " + time);
	console.log("Frequency: " + freq);
	console.log("HH:mm: " + moment().format("HH:mm"));
	console.log("hh:mm A: " + moment().format("hh:mm A"));
	console.log("===================================================");
	
	END console.logs ----*/

	//Time Conversions -------------------------------------

	var freq = parseInt(freq);
	//Current Time
	var currentTime = moment();
	var dConverted = moment(childSnapshot.val().time, "HH:mm").subtract(1, "years");
	var trainTime = moment(dConverted).format("HH:mm");
	//Diff Btw Times -------------------------------------
	var tConverted = moment(trainTime, "HH:mm").subtract(1, "years");
	var tDifference = moment().diff(moment(tConverted), "minutes");
	//Remainder ------------------------------------- 
	var tRemainder = tDifference % freq;
	//Mins til next Train -------------------------------------
	var minsAway = freq - tRemainder;
	//Next Train -------------------------------------
	var nextTrain = moment().add(minsAway, "minutes");

	/*---- START console.logs 

	console.log("Current Time: " + moment().format("hh:mm A"));
	console.log("Date Converted: " + dConverted);
	console.log("Train Time : " + trainTime);
	console.log("Time Dif : " + tDifference);	
	console.log("Remaining Time: " + tRemainder);	
	console.log("Minutes til: " + minsAway);	
	console.log("Arr Time: " + moment(nextTrain).format("hh:mm A"));
	console.log("END===END===END====================================");	

	END console.logs ----*/
	
	//---- HEADER CLOCK -------------------------------------	

    datetime = $("#currentTime")
    update();
    setInterval(update, 1000);

	//$("#currentTime").text(currentTime.format("hh:mm:ss A"));
	
	//---- TABLE DATA -------------------------------------	
	
	$("#trainTable").append(
			"<tr><td id='nameDisplay'>" + childSnapshot.val().name +
			"</td><td id='destDisplay'>" + childSnapshot.val().dest +
			"</td><td id='freqDisplay'>" + childSnapshot.val().freq +
			"</td><td id='nextDisplay'>" + moment(nextTrain).format("hh:mm A") +
			"</td><td id='awayDisplay'>" + minsAway  + " minutes away</td></tr>");
},

function(errorObject){
    console.log("Read failed: " + errorObject.code)
	console.log("===================================================");	
});

}); // END document.ready