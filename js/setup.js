/**
 * Created by Rachel on 1/16/2016.
 */
var ContentEnum = Object.freeze({
    RSVP_CONTENT: "rsvp-content",
    LOCATION_CONTENT: "location-content",
    HOTEL_CONTENT: "hotel-content",
    REGISTRY_CONTENT: "registry-content",
    SCHEDULE_CONTENT: 'schedule-content',
    FAQ_CONTENT: "faq-content",
    CONTACT_CONTENT: "contact-content",
    HOME_CONTENT: "home-content"
});
var selectedContent = ContentEnum.HOME_CONTENT;

var disablePartyInfo = true;
var userLoggedIn = false;

var redmoorAddress = "The+Redmoor,3187+Linwood+Avenue,Cincinnati+OH+45208";
var hotelEmbassySuitesAddress = "Embassy+Suites+Cincinnati-RiverCenter,10+E.+RiverCenter+Blvd.,+Covington+KY+41011";
var hotelMariottAddress = "Mariott-RiverCenter,10+W.+RiverCenter+Blvd.,+Covington+KY+41011";
var mapsAPIKey = "AIzaSyB4SCh6diwyoIkFRZLRN_n7f_-ftJU27lM";

var globalPartyInfo;
var globalPartyLength;
var globalMusicLength = [];
var globalAllergiesArray = [];

function genMapPlaceQueryString(apiKey, address) {
	return "https://www.google.com/maps/embed/v1/place?key=" + apiKey + "&q=" + address + "&zoom=15";
}

function genDrivingDirectionsQueryString(apiKey, origin, destination) {
	return "https://www.google.com/maps/embed/v1/directions?key=" + apiKey + "&origin=" + origin + "&destination=" + destination + "&mode=driving";
}

function init() {
	// Set the initial query strings for the maps
	$("#redmoor-map")[0].src = genMapPlaceQueryString(mapsAPIKey, redmoorAddress);
	$("#embassy-suites-map")[0].src = genMapPlaceQueryString(mapsAPIKey, hotelEmbassySuitesAddress);
	$("#mariott-map")[0].src = genMapPlaceQueryString(mapsAPIKey, hotelMariottAddress);

    //Title to Home
    $("#title").click(function () {
        console.log("Clicked Title/Home");
        switchContent(ContentEnum.HOME_CONTENT);
    });


    //Side Menu
    $( "#rsvp-button" ).button().click(function() {
        console.log("Clicked RSVP");
        switchContent(ContentEnum.RSVP_CONTENT);
    });
    $( "#location-button" ).button().click(function() {
        console.log("Clicked location");
        switchContent(ContentEnum.LOCATION_CONTENT);
    });
    $( "#hotel-button" ).button().click(function() {
        console.log("Clicked hotel");
        switchContent(ContentEnum.HOTEL_CONTENT);
    });
    $( "#registry-button" ).button().click(function() {
        console.log("Clicked registry");
        switchContent(ContentEnum.REGISTRY_CONTENT);
    });
    $( "#schedule-button" ).button().click(function() {
        console.log("Clicked schedule");
        switchContent(ContentEnum.SCHEDULE_CONTENT);
    });
    $( "#faq-button" ).button().click(function() {
        console.log("Clicked faq");
        switchContent(ContentEnum.FAQ_CONTENT);
    });
    $( "#contact-button" ).button().click(function() {
        console.log("Clicked contact");
        switchContent(ContentEnum.CONTACT_CONTENT);
    });

    $("#log-in-button-home").button().click(function(event){
        var formData = serializeFormData(['guest-login-code-home']);
        $.post("php/login.php", formData, setUpRSVPContent);
    });

    //RSVP Content
    $("#log-in-button").button().click(function(event){
		var formData = serializeFormData(['guest-login-code']);
        $.post("php/login.php", formData, setUpRSVPContent);
    });
    $('#party-info-edit-button').button().click(function(){

        setUpPartyInfoEditButton("", 'party-info');
    });
    $('#party-info-save-button').button().click(function(){
        setUpPartyInfoSaveButton("", 'party-info');
    });
    $('#party-info-cancel-button').button().click(function(){
        setUpPartyInfoCancelButton("", 'party-info');
    });
    $('#plus-one-food').selectmenu({
        change: function(event, data){
            console.log(data.item.index);
            console.log(data.item.value);
        }
    });


    //POP UPS
    var hideEverythingElseBox = $('#hide-everything-else');
    var addPlusOneBox = $("#add-plus-one-box");
    var popUpBox = $('#pop-ups');
    $("#add-plus-one-button" ).button().click(showAddPlusOnePopup);
    $("#plus-one-cancel-button").button().click(function(){
        addPlusOneBox.hide();
        hideEverythingElseBox.hide();
        popUpBox.removeClass('pop-up-on');
        console.log("Clicked cancel plus one");
    });
    $("#plus-one-add-button").button().click(function(){
        addPlusOneBox.hide();
        console.log("Clicked save plus one");

        // Serialize all of the form data
        var formData = serializeFormData(['party_id', 'auth_token', 'plus-one-first-name', 'plus-one-last-name', 'plus-one-food', 'plus-one-over-21']);
		showLoadingWheel();
        $.post("php/add_plus_one.php", formData, function(returnData) {
            console.log(formData);
            console.log("Add plus one received:");
            console.log(returnData);

			hideLoadingWheel();
            if(returnData.status){
                console.log("added someone!")
                populatePlusOne(returnData);
                hideEverythingElseBox.hide();
                popUpBox.removeClass('pop-up-on');
                checkForMaxPlusOnes();
                clearAddPlusOneFields();
            }else{
                populateErrorMessage(returnData.reason, showAddPlusOnePopup);
            }
        });
    });

    //Music Suggestion
    var musicBox = $("#add-song-suggestion-box");
    $("#add-music-button" ).button().click(function() {
        musicBox.show();
        hideEverythingElseBox.show();
        popUpBox.addClass('pop-up-on');
        console.log("Clicked add music");
    });
    $("#song-suggestion-cancel-button").button().click(function(){
        musicBox.hide();
        hideEverythingElseBox.hide();
        popUpBox.removeClass('pop-up-on');
        console.log("Clicked cancel music");
        clearAddMusicFields();
    });
    $('#song-suggestion-add-button').button().click(function(){
        musicBox.hide();

        console.log("Clicked save music");
        // Serialize all of the form data
        var formData = serializeFormData(['party_id', 'auth_token', 'add-song-name', 'add-song-artist']);
		showLoadingWheel();
        $.post("php/add_music_suggestion.php", formData, function(returnData) {
            console.log("Add music suggestion received:");
            console.log(returnData);
			
			hideLoadingWheel();
            if(returnData.status){
                var songName = $('#add-song-name').val();
                var artistName = $('#add-song-artist').val();
                populateMusicSuggestion(songName, artistName);
                hideEverythingElseBox.hide();
                popUpBox.removeClass('pop-up-on');
                checkForMaxMusicSuggestions();
                clearAddMusicFields();
            }else{
                populateErrorMessage(returnData.reason, null);
            }
        });
    });
    $('#plus-one-over-21').selectmenu({
        change: function(event, data){
            console.log(data.item.index);
            console.log(data.item.value);
        }
    });
	
	// Location Content
	$("#redmoor-map-button").button().click(function() {
		$("#redmoor-map")[0].src = genMapPlaceQueryString(mapsAPIKey, redmoorAddress);
	});
	$("#redmoor-directions-embassy-suites-button").button().click(function() {
		$("#redmoor-map")[0].src = genDrivingDirectionsQueryString(mapsAPIKey, redmoorAddress, hotelEmbassySuitesAddress);
	});
	$("#redmoor-directions-mariott-button").button().click(function() {
		$("#redmoor-map")[0].src = genDrivingDirectionsQueryString(mapsAPIKey, redmoorAddress, hotelMariottAddress);
	});
	
	// Hotel Content
	$("#embassy-suites-map-button").button().click(function() {
		$("#embassy-suites-map")[0].src = genMapPlaceQueryString(mapsAPIKey, hotelEmbassySuitesAddress);
	});
	$("#embassy-suites-directions-button").button().click(function() {
		$("#embassy-suites-map")[0].src = genDrivingDirectionsQueryString(mapsAPIKey, hotelEmbassySuitesAddress, redmoorAddress);
	});
	$("#mariott-map-button").button().click(function() {
		$("#mariott-map")[0].src = genMapPlaceQueryString(mapsAPIKey, hotelMariottAddress);
	});
	$("#mariott-directions-button").button().click(function() {
		$("#mariott-map")[0].src = genDrivingDirectionsQueryString(mapsAPIKey, hotelMariottAddress, redmoorAddress);
	});

    $('#error-button').button().click(function(){
        $('#error-box').hide();
        hideEverythingElseBox.hide();
        popUpBox.removeClass('pop-up-on');
        clearLoginField();
		if ($('#error-box')[0].on_close_function) {
			$('#error-box')[0].on_close_function();
		}
    });

    //Contact Content
    $("#send-email-button").button().click(function() {
		var formData = serializeFormData(['guest-name', 'guest-email', 'guest-content']);
        $.post("php/send_question_email.php", formData, function(returnData) {
			if (returnData.status) {
				// If the email sent successfully, clear the form fields
                clearContactFields();
			} else {
				//TODO: Show error message
			}
		});
    });
}

function showAddPlusOnePopup() {
	$('#hide-everything-else').show();
	$('#add-plus-one-box').show();
	$('#pop-ups').addClass('pop-up-on');
	console.log("Clicked plus one");
}

function populateErrorMessage(whatHappened, onCloseFunction) {
    console.log('ERROR!!! ' + whatHappened);
	$('#hide-everything-else').show();
	$('#pop-ups').addClass('pop-up-on');
    $('#error-box').show();
    $('#error-reason').html(whatHappened);
	$('#error-box')[0].on_close_function = onCloseFunction;
}

function showLoadingWheel() {
	$('#hide-everything-else').show();
	$('#pop-ups').addClass('pop-up-on');
	$('#loading-wheel-box').show();
}

function hideLoadingWheel() {
	$('#loading-wheel-box').hide();
	$('#hide-everything-else').hide();
	$('#pop-ups').removeClass('pop-up-on');
}

function populatePlusOne(partyPerson){
    console.log('You added Someone!');
    var partyLength = globalPartyInfo.party_people.length;
    var partyContainer = $('#rsvp-content');
    partyContainer.append('<input type="hidden" name="person_id" id="'+ partyLength + '_person_id'  +'" value="' + partyPerson.person_id + '" />');
    var partyAccordion = $('#people-accordion');

    //Party Person Name
    console.log('Party Person');
    console.log(partyPerson);
    var partyPersonFirstName = partyPerson.first_name;
    var partyPersonLastName = partyPerson.last_name;
    console.log(partyPersonFirstName + " " + partyPersonLastName);
    partyAccordion.append('<h3 id="'+ partyLength + '-person-name-container" class="person-label">' + '</h3>');
    var partyPersonH3 = $('#' + partyLength + '-person-name-container');
    partyPersonH3.append('<input type="text" name="first_name" id="'+ partyLength +'-person-first-name" class="person-label-input first-name larkspur-background" maxlength="20" value="' + partyPersonFirstName + '" disabled/>');
    partyPersonH3.append('<input type="text" name="last_name" id="'+ partyLength +'-person-last-name" class="person-label-input last-name larkspur-background" maxlength="20" value="' + partyPersonLastName + '" disabled/>');
    partyPersonH3.append('<input  type="button" id="' + partyLength + '-person-name-edit-button" class="form-button form-edit-button" value="edit"/>');
    partyPersonH3.append('<input  type="button" id="' + partyLength + '-person-name-save-button" class="form-button form-save-button" value="save" style="display: none;"/>');
    partyPersonH3.append('<input  type="button" id="' + partyLength + '-person-name-cancel-button" class="form-button form-cancel-button" value="cancel" style="display: none;"/>');
    partyPersonH3.click(clickedPerson(partyLength));
    $('#' + partyLength + '-person-name-edit-button').button().click(setUpPersonNameEditButton(partyLength, '-person-name'));
    $('#' + partyLength + '-person-name-save-button').button().click(setUpPersonNameSaveButton(partyLength, '-person-name'));
    $('#' + partyLength + '-person-name-cancel-button').button().click(setUpPersonNameCancelButton(partyLength, '-person-name'));


    //Party Person Info Div
    partyAccordion.append('<div id="' + partyLength + '-person-info" class="person-info">' + '</div>');
    var partyPersonInfoDiv = $('#' + partyLength + '-person-info');
    partyPersonInfoDiv.append('<div id="' + partyLength + '-person-info-left" class="left-info-side">' + '</div>');
    partyPersonInfoDiv.append('<div id="' + partyLength + '-person-info-right" class="right-info-side">' + '</div>');
    var leftInfoDiv = $('#' + partyLength + '-person-info-left');
    var rightInfoDiv = $('#' + partyLength + '-person-info-right');


    leftInfoDiv.append('<input  type="button" id="' + partyLength + '-info-left-edit-button" class="form-button form-edit-float-button" value="edit"/>');
    leftInfoDiv.append('<input  type="button" id="' + partyLength + '-info-left-cancel-button" class="form-button form-cancel-float-button" value="cancel" style="display: none;"/>');
    leftInfoDiv.append('<input  type="button" id="' + partyLength + '-info-left-save-button" class="form-button form-save-float-button" value="save" style="display: none;"/>');

    $('#' + partyLength + '-info-left-edit-button').button().click(setUpInfoLeftEditButton(partyLength,'-info-left'));
    $('#' + partyLength+ '-info-left-save-button').button().click(setUpInfoLeftSaveButton(partyLength, '-info-left'));
    $('#' + partyLength + '-info-left-cancel-button').button().click(setUpInfoLeftCancelButton(partyLength, '-info-left'));

    //TODO: Party Person Attending?
    leftInfoDiv.append('<div class="attending-label label">Are you joining us?</div>');
    leftInfoDiv.append('<select name="is_attending" id="' + partyLength + '-person-attending" class="centuryGothicFont" disabled>' +  '</select>');
    var isAttending = $('#' + partyLength + '-person-attending');
    isAttending.append('<option value="1" selected="selected">Yes</option>');
    isAttending.append('<option value="0">No</option>');


    isAttending.selectmenu({
        change: function(event, data){
            console.log(data.item.index);
            console.log(data.item.value);
        }
    });


    //Party Person Food Preference
    var partyPersonFood = partyPerson.food_pref;
    leftInfoDiv.append('<div class="food-label label">Food Choice' + '</div>');
    leftInfoDiv.append('<select name="food_pref" id="' + partyLength + '-person-food" class="select-food centuryGothicFont" disabled>' +  '</select>');
    var foodMenu = $('#' + partyLength + '-person-food');
    var foodArray = globalPartyInfo.food_choices;
    for(var k = 0; k < foodArray.length; k++){
        if(k == (partyPersonFood - 1)) {
            foodMenu.append('<option value="' + (k + 1) + '" selected="selected">' + foodArray[k] + '</option>');
        }else{
            foodMenu.append('<option value="' + (k + 1) + '">' + foodArray[k] + '</option>');
        }
    }
    foodMenu.selectmenu({
        change: function(event, data){
            console.log(data.item.index);
            console.log(data.item.value);
        }
    });

    //Is 21
    var partyPerson21 = partyPerson.over_21;
    leftInfoDiv.append('<div class="over-21-label label">Are you over 21?</div>');
    leftInfoDiv.append('<select name="over_21" id="' + partyLength + '-person-over-21" class="centuryGothicFont" disabled></select>');
    var over21 = $('#' + partyLength + '-person-over-21');
    if(partyPerson21){
        over21.append('<option value="1" selected="selected">Yes</option>');
        over21.append('<option value="0">No</option>');
    }else{
        over21.append('<option value="1">Yes</option>');
        over21.append('<option value="0" selected="selected">No</option>');
    }

    over21.selectmenu({
        change: function(event, data){
            console.log(data.item.index);
            console.log(data.item.value);
        }
    });

    //Allergies
    rightInfoDiv.append('<div class="allergies-label label">Allergies' + '</div>');
    rightInfoDiv.append('<ul id="' + partyLength +'-person-allergies" class="centuryGothicFont allergy-list">' + '</ul>');
    var allergiesList = $('#' + partyLength + '-person-allergies');
    allergiesList.append('<li id="' + partyLength + '-no-allergies" class="allergy">None</li>');

	rightInfoDiv.append('<input name="allergy" type="text" id="' + partyLength + '-new-allergy" placeholder="Add New Allergy" class="form-add-allergy larkspur-background" maxlength="20"/>');
    rightInfoDiv.append('<input  type="button" id="' + partyLength + '-new-allergy-button" class="form-button form-add-button" value="+"/>');
    $('#' + partyLength + '-new-allergy-button').button().click(addAllergy(partyLength));
    globalAllergiesArray[partyLength] = 0;

    //Refresh Accordion
    partyAccordion.accordion("refresh");

}
function populateMusicSuggestion(songTitle, artistName){
    console.log('You added music!');
    var songTable = $('#song-table');
    songTable.append('<tr id="' + globalMusicLength[1] + '-song">' + '</tr>');
    var songRow = $('#' + globalMusicLength[1] + '-song');
	songRow.append('<td class="song-band centuryGothicFont dark-larkspur-text"><span data-name="artist_name" id="' + globalMusicLength[1] + '-artist-name">' + artistName + '</span></td>');
    songRow.append('<td class="song-name centuryGothicFont dark-larkspur-text"><span data-name="song_title" id="' + globalMusicLength[1] +'-song-title">' + songTitle + '</span></td>');
    songRow.append('<td><input type="button" id="' + globalMusicLength[1] + '-song-button" class="form-button form-delete-button" value="X"/>');
    $('#' + globalMusicLength[1] + '-song-button').button().click(deleteMusicSuggestion(globalMusicLength[1]));

    globalMusicLength[0]++;
    globalMusicLength[1]++;
}

function switchContent(newSelectedContent){
    $("#" + selectedContent).hide();
    selectedContent = newSelectedContent;
    $("#" + newSelectedContent).show();
}

function setUpRSVPContent(jsonObject){
    console.log("Json Object");
    console.log(jsonObject);
    if(!jsonObject.login_successful){
        console.log("NOPE!!!");
        populateErrorMessage(jsonObject.reason, null);
    }else{
        if(!userLoggedIn) {
            switchContent(ContentEnum.RSVP_CONTENT);
            $("#guest-not-logged-in").hide();
            $("#guest-logged-in").show();
            $("#guest-not-logged-in-home").hide();
            $("#guest-logged-in-home").show();
            generatePartyInfo(jsonObject);
            $("#0-person-last-name").click();
            userLoginedIn = true;
        }
    }
}
function checkForMaxPlusOnes(){
    var currentPlusOnes = globalPartyLength;
    var maxPlusOnes = globalPartyInfo.party_info.max_plus_ones;
    if(currentPlusOnes == maxPlusOnes){
        $('#add-plus-one-button').hide();
    }
    globalPartyLength++;
}
function checkForMaxMusicSuggestions(){
    var currentNumMusicSuggestions = globalMusicLength[0];
    var maxMusicSuggestions = 10;

    if(currentNumMusicSuggestions == maxMusicSuggestions){
        $('#add-music-button').hide();
    }else{
        $('#add-music-button').show();
    }
}
function clickedPerson(personContainerId){
    return function(){
        console.log(personContainerId + 'person');

        for(var k = 0; k <= globalPartyLength; k++){
            var firstName = $('#' + k + '-person-first-name');
            var lastName = $('#' + k + '-person-last-name');
            if(personContainerId != k){
                console.log('remove');
                firstName.removeClass('larkspur-background');
                lastName.removeClass('larkspur-background');
                firstName.addClass('light-brown-background');
                lastName.addClass('light-brown-background');
                firstName.addClass('hover-person-background');
                lastName.addClass('hover-person-background');
            }else{
                console.log('add')
                firstName.removeClass('light-brown-background');
                lastName.removeClass('light-brown-background');
                firstName.addClass('larkspur-background');
                lastName.addClass('larkspur-background');
                firstName.removeClass('hover-person-background');
                lastName.removeClass('hover-person-background');
            }
        }
    };
}
function generatePartyInfo(jsonObject){
	globalPartyInfo = jsonObject;
    globalMusicLength[0] = globalMusicLength[1] = globalPartyInfo.music_suggestions.length;
    globalPartyLength = jsonObject.party_info.current_plus_ones;
    checkForMaxPlusOnes();
    checkForMaxMusicSuggestions();
	
	// Populate the add plus one popup with the appropriate food choices
	var addPlusOneFoodSelect = $('#plus-one-food');
	for (var i = 0; i < jsonObject.food_choices.length; ++i) {
		addPlusOneFoodSelect.append('<option value="' + (i + 1) + '">' + jsonObject.food_choices[i] + '</option>');
	}
	
	var partyContainer = $('#rsvp-content');
	partyContainer.append('<input type="hidden" name="party_id" id="party_id" value="' + jsonObject.party_id + '" />');
	partyContainer.append('<input type="hidden" name="auth_token" id="auth_token" value="' + jsonObject.auth_token + '" />');
	
    var partyAccordion = $('#people-accordion');

    var partyPeople = jsonObject.party_people;
    var partyId = jsonObject.party_id;
    var partyAuthToken = jsonObject.auth_token;

    for(var i = 0; i < partyPeople.length; i++){
        partyContainer.append('<input type="hidden" name="person_id" id="'+ i + '_person_id'  +'" value="' + partyPeople[i].person_id + '" />');
        var partyPerson = partyPeople[i];
		
		// Add some state tracking variables we need to each person
		partyPerson.disableNameInfo = true;
		partyPerson.disableLeftInfo = true;
		
        //Party Person Name
        var partyPersonFirstName = partyPerson.first_name;
        var partyPersonLastName = partyPerson.last_name;
        partyAccordion.append('<h3 id="'+ i + '-person-name-container" class="person-label">' + '</h3>');
        var partyPersonH3 = $('#' + i + '-person-name-container');
        partyPersonH3.append('<input type="text" name="first_name" id="'+ i +'-person-first-name" class="person-label-input first-name larkspur-background" maxlength="20" value="' + partyPersonFirstName + '" disabled/>');
        partyPersonH3.append('<input type="text" name="last_name" id="'+ i +'-person-last-name" class="person-label-input last-name larkspur-background" maxlength="20" value="' + partyPersonLastName + '" disabled/>');
        partyPersonH3.append('<input  type="button" id="' + i + '-person-name-edit-button" class="form-button form-edit-button" value="edit"/>');
        partyPersonH3.append('<input  type="button" id="' + i + '-person-name-save-button" class="form-button form-save-button" value="save" style="display: none;"/>');
        partyPersonH3.append('<input  type="button" id="' + i + '-person-name-cancel-button" class="form-button form-cancel-button" value="cancel" style="display: none;"/>');
        partyPersonH3.click(clickedPerson(i));

        $('#' + i+ '-person-name-edit-button').button().click(setUpPersonNameEditButton(i, '-person-name'));
        $('#' + i+ '-person-name-save-button').button().click(setUpPersonNameSaveButton(i, '-person-name'));
        $('#' + i+ '-person-name-cancel-button').button().click(setUpPersonNameCancelButton(i, '-person-name'));


        //Party Person Info Div
        partyAccordion.append('<div id="' + i + '-person-info" class="person-info">' + '</div>');
        var partyPersonInfoDiv = $('#' + i + '-person-info');
        partyPersonInfoDiv.append('<div id="' + i + '-person-info-left" class="left-info-side">' + '</div>');
        partyPersonInfoDiv.append('<div id="' + i + '-person-info-right" class="right-info-side">' + '</div>');
        var leftInfoDiv = $('#' + i + '-person-info-left');
        var rightInfoDiv = $('#' + i + '-person-info-right');

        leftInfoDiv.append('<input  type="button" id="' + i + '-info-left-edit-button" class="form-button form-edit-float-button" value="edit"/>');
        leftInfoDiv.append('<input  type="button" id="' + i + '-info-left-cancel-button" class="form-button form-cancel-float-button" value="cancel" style="display: none;"/>');
        leftInfoDiv.append('<input  type="button" id="' + i + '-info-left-save-button" class="form-button form-save-float-button" value="save" style="display: none;"/>');

        $('#' + i+ '-info-left-edit-button').button().click(setUpInfoLeftEditButton(i,'-info-left'));
        $('#' + i+ '-info-left-save-button').button().click(setUpInfoLeftSaveButton(i, '-info-left'));
        $('#' + i+ '-info-left-cancel-button').button().click(setUpInfoLeftCancelButton(i, '-info-left'));

        //TODO: Party Person Attending?
        var partyPersonComing = partyPerson.is_attending;
        leftInfoDiv.append('<div class="attending-label label">Are you joining us?</div>');
        //leftInfoDiv.append('<div id="' + i + '-person-attending" class="centuryGothicFont">' + partyPersonComing + '</div>');
        leftInfoDiv.append('<select name="is_attending" id="' + i + '-person-attending" class="centuryGothicFont" disabled>' +  '</select>');
        var isAttending = $('#' + i + '-person-attending');
        if(partyPersonComing == null){
            isAttending.append('<option value="-1" selected="selected" disabled>Select an Option</option>');
            isAttending.append('<option value="1">Yes</option>');
            isAttending.append('<option value="0">No</option>');
        }else if(partyPersonComing){
            isAttending.append('<option value="1" selected="selected">Yes</option>');
            isAttending.append('<option value="0">No</option>');
        }else{
            isAttending.append('<option value="1">Yes</option>');
            isAttending.append('<option value="0" selected="selected">No</option>');
        }

        isAttending.selectmenu({
            change: function(event, data){
                console.log(data.item.index);
                console.log(data.item.value);
            }
        });

        //TODO: Party Person Attending Rehearsal?
        if(partyPerson.is_invited_to_rehearsal){
            var partyPersonRehearsalComing = partyPerson.is_attending_rehearsal;
            leftInfoDiv.append('<div class="attending-label label">Are you joining us for the rehearsal dinner?</div>');
            leftInfoDiv.append('<select name="is_attending_rehearsal" id="' + i + '-person-attending-rehearsal" class="centuryGothicFont" disabled>' +  '</select>');
            var isAttendingRehearsal = $('#' + i + '-person-attending-rehearsal');
            if(partyPersonRehearsalComing == null){
                isAttendingRehearsal.append('<option value="-1" selected="selected" disabled>Select an Option</option>');
                isAttendingRehearsal.append('<option value="1">Yes</option>');
                isAttendingRehearsal.append('<option value="0">No</option>');
            }else if(partyPersonRehearsalComing){
                isAttendingRehearsal.append('<option value="1" selected="selected">Yes</option>');
                isAttendingRehearsal.append('<option value="0">No</option>');
            }else{
                isAttendingRehearsal.append('<option value="1">Yes</option>');
                isAttendingRehearsal.append('<option value="0" selected="selected">No</option>');
            }

            isAttendingRehearsal.selectmenu({
                change: function(event, data){
                    console.log(data.item.index);
                    console.log(data.item.value);
                }
            });
        }

        //TODO: Party Person Attending Movie?
        if (partyPerson.is_invited_to_movie) {
            var partyPersonMovieComing = partyPerson.is_attending_movie;
            leftInfoDiv.append('<div class="attending-label label">Are you joining us for the Warcraft movie?</div>');
            leftInfoDiv.append('<select name="is_attending_movie" id="' + i + '-person-attending-movie" class="centuryGothicFont" disabled>' +  '</select>');
            var isAttendingMovie = $('#' + i + '-person-attending-movie');
            if(partyPersonMovieComing == null){
                isAttendingMovie.append('<option value="-1" selected="selected" disabled>Select an Option</option>');
                isAttendingMovie.append('<option value="1">Yes</option>');
                isAttendingMovie.append('<option value="0">No</option>');
            }else if(partyPersonMovieComing){
                isAttendingMovie.append('<option value="1" selected="selected">Yes</option>');
                isAttendingMovie.append('<option value="0">No</option>');
            }else{
                isAttendingMovie.append('<option value="1">Yes</option>');
                isAttendingMovie.append('<option value="0" selected="selected">No</option>');
            }

            isAttendingMovie.selectmenu({
                change: function(event, data){
                    console.log(data.item.index);
                    console.log(data.item.value);
                }
            });
        }

        //Party Person Food Preference
        var partyPersonFood = partyPerson.food_pref;
        leftInfoDiv.append('<div class="food-label label">Food Choice' + '</div>');
        leftInfoDiv.append('<select name="food_pref" id="' + i + '-person-food" class="select-food centuryGothicFont" disabled>' +  '</select>');
        var foodMenu = $('#' + i + '-person-food');
        var foodArray = jsonObject.food_choices;
        if(partyPersonFood == null){
            foodMenu.append('<option selected="selected" value="-1" disabled>Select an Option</option>');
        }
		
        for(var k = 0; k < foodArray.length; k++){
            if(k == (partyPersonFood - 1)){
                foodMenu.append('<option selected="selected" value="' + (k + 1) +'">' + foodArray[k] + '</option>');
            }else{
                foodMenu.append('<option value="' + (k + 1) + '">' + foodArray[k] + '</option>');
            }
        }
        foodMenu.selectmenu({
            change: function(event, data){
                console.log(data.item.index);
                console.log(data.item.value);
            }
        });

        //Is 21
        var partyPerson21 = partyPerson.over_21;
        leftInfoDiv.append('<div class="over-21-label label">Are you over 21?</div>');
        leftInfoDiv.append('<select name="over_21" id="' + i + '-person-over-21" class="centuryGothicFont" disabled></select>');
        var over21 = $('#' + i + '-person-over-21');
        if(partyPerson21 == null){
            over21.append('<option value="-1" selected="selected" disabled>Select an Option</option>');
            over21.append('<option value="1">Yes</option>');
            over21.append('<option value="0">No</option>');
        }else if(partyPerson21){
            over21.append('<option value="1" selected="selected">Yes</option>');
            over21.append('<option value="0">No</option>');
        }else{
            over21.append('<option value="1">Yes</option>');
            over21.append('<option value="0" selected="selected">No</option>');
        }

        over21.selectmenu({
            change: function(event, data){
                console.log(data.item.index);
                console.log(data.item.value);
            }
        });

		//Allergies
        var partyPersonAllergies = partyPerson.allergies;
        rightInfoDiv.append('<div class="allergies-label label">Allergies' + '</div>');
        rightInfoDiv.append('<ul id="' + i +'-person-allergies" class="centuryGothicFont allergy-list">' + '</ul>');
        var allergiesList = $('#' + i + '-person-allergies');
        if(partyPersonAllergies.length == 0){
            allergiesList.append('<li id="' + i + '-no-allergies" class="allergy">None</li>');
        }
        var allergiesLength = 0;
        for(var k = 0; k < partyPersonAllergies.length; k++){
            allergiesList.append('<li id="'+ i + k +'-allergy-list-box" class="allergy"><span data-name="allergy" id="'+ i + k +'-allergy-list">' + partyPersonAllergies[k] + '</span></li>');
            var allergy = $('#' + i + k + '-allergy-list-box');
			allergy.append('<input  type="button" id="' + i + k + '-allergy-button" class="form-button form-delete-button" value="X"/>');
            $('#' + i + k + '-allergy-button').button().click(deleteAllergy(i, k));
            allergiesLength++;
        }
        globalAllergiesArray[i] = allergiesLength;
		rightInfoDiv.append('<input name="allergy" type="text" placeholder="Add New Allergy" id="' + i + '-new-allergy" class="form-add-allergy larkspur-background" maxlength="20"/>');
        rightInfoDiv.append('<input  type="button" id="' + i + '-new-allergy-button" class="form-button form-add-button" value="+"/>');
        $('#' + i + '-new-allergy-button').button().click(addAllergy(i));

    }

    //Initialize Accordion
    partyAccordion.accordion({
        heightStyle: "content"
    });


    //Group Info
    var partyInfoContainer = $('#party-info-content');
    var partyInfo = jsonObject.party_info;

    partyInfoContainer.append('<form id="party-info-form"><input type="hidden" value="' + partyId +'" />' + '<input type="hidden" value="' + partyId +'" />' + '</form>');
    var partyInfoForm = $('#party-info-form');
    partyInfoForm.append('<input type="text" name="addr_house_num" id="party-address-house-num" class="party-info-address party-info-address-first-row form-input larkspur-background centuryGothicFont" maxlength="20" value="' + partyInfo.addr_house_num + '" disabled/>');
    partyInfoForm.append('<input type="text" name="addr_street" id="party-address-street" class="party-info-address party-info-address-first-row form-input larkspur-background centuryGothicFont" maxlength="50" value="' + partyInfo.addr_street +'" disabled/>');
    partyInfoForm.append('<input type="text" name="addr_apt" id="party-address-apt" class="party-info-address party-info-address-second-row form-input larkspur-background centuryGothicFont" maxlength="20" value="'+ partyInfo.addr_apt + '" disabled/>');
    partyInfoForm.append('<input type="text" name="addr_city" id="party-address-city" class="party-info-address party-info-address-third-row form-input larkspur-background centuryGothicFont" maxlength="50" value="' + partyInfo.addr_city + '" disabled/>');
    partyInfoForm.append('<input type="text" name="addr_state" id="party-address-state" class="party-info-address party-info-address-third-row form-input larkspur-background centuryGothicFont" maxlength="2"value="' + partyInfo.addr_state + '" disabled/>');
    partyInfoForm.append('<input type="text" name="addr_zip" id="party-address-zip" class="party-info-address party-info-address-third-row form-input larkspur-background centuryGothicFont" maxlength="5" value="' + partyInfo.addr_zip +'" disabled/>');


    //Music Suggestions
    var musicSuggestions = jsonObject.music_suggestions;
    var songTable = $('#song-table');

    for(var k = 0; k < musicSuggestions.length; k++){
        console.log(musicSuggestions[k]);
        songTable.append('<tr id="' + k + '-song">' + '</tr>');
        var songRow = $('#' + k + '-song');
		songRow.append('<td class="song-band centuryGothicFont dark-larkspur-text"><span data-name="artist_name" id="' + k + '-artist-name">' + musicSuggestions[k].artist_name + '</span></td>');
        songRow.append('<td class="song-name centuryGothicFont dark-larkspur-text"><span data-name="song_title" id="' + k +'-song-title">' + musicSuggestions[k].song_title + '</span></td>');
        songRow.append('<td><input type="button" id="' + k + '-song-button" class="form-button form-delete-button" value="X"/>');
        $('#' + k + '-song-button').button().click(deleteMusicSuggestion(k));
    }

}

function clearAddMusicFields(){
    console.log("clear music");
    $('#add-song-name').val('');
    $('#add-song-artist').val('');
}

function clearAddPlusOneFields(){
    console.log("clear add plus one");
    $('#plus-one-first-name').val('');
    $('#plus-one-last-name').val('');
    $('#plus-one-food').val('Select an Option').selectmenu('refresh', true);
    $('#plus-one-over-21').val(-1).selectmenu('refresh', true);

}

function clearLoginField(){
    $('#guest-login-code').val('');
    $('#guest-login-code-home').val('');
}

function clearContactFields(){
    $('#guest-name').val('');
    $('#guest-email').val('');
    $('#guest-content').val('');
}

function deleteMusicSuggestion(songId){
    return function(){
        console.log("DELETE");
        var songSuggestion = $('#' + songId +'-song');

        // Serialize all of the form data
        var formData = serializeFormData(['party_id', 'auth_token', songId +'-song-title', songId + '-artist-name']);
		showLoadingWheel();
        $.post("php/remove_music_suggestion.php", formData, function(returnData) {
            console.log("Update person received:");
            console.log(returnData);
			hideLoadingWheel();
            if(returnData.status){
                songSuggestion.remove();
                globalMusicLength[0]--;
                checkForMaxMusicSuggestions();
            }else{
                populateErrorMessage(returnData.reason, null);
            }
        });
    };
}

function addAllergy(personContainerId){
    return function(){
        console.log("ADD");
        //var allergy = $('#' + personId + '-new-allergy');
        var allergiesList = $('#' + personContainerId + '-person-allergies');
        //var allergyArray = globalPartyInfo.party_people[personContainerId].allergies;


        // Serialize all of the form data
        var formData = serializeFormData(['party_id', 'auth_token', personContainerId + '_person_id', personContainerId + '-new-allergy']);
		showLoadingWheel();
        $.post("php/add_allergy.php", formData, function(returnData) {
            console.log("Update person received:");
            console.log(returnData);

			hideLoadingWheel();
            if(returnData.status){
                var k = globalAllergiesArray[personContainerId];
                allergiesList.append('<li id="'+ personContainerId + k +'-allergy-list-box" class="allergy"><span data-name="allergy" id="'+ personContainerId + k +'-allergy-list">'+ returnData.allergy +'</span></li>');
                var allergy = $('#' + personContainerId + k + '-allergy-list-box');
                allergy.append('<input  type="button" id="' + personContainerId + k + '-allergy-button" class="form-button form-delete-button" value="X"/>');
                $('#' + personContainerId + k + '-allergy-button').button().click(deleteAllergy(personContainerId, k));

                $('#' + personContainerId + '-new-allergy').val("");

                if(k == 0){
                    $('#' + personContainerId +'-no-allergies').remove();
                }
                globalAllergiesArray[personContainerId]++;
            }
        });
    };
}
function deleteAllergy(personContainerId, allergyId){
    return function(){
        console.log("DELETE");
        var allergy = $('#' + personContainerId + allergyId +'-allergy-list-box');

        // Serialize all of the form data
        var formData = serializeFormData(['party_id', 'auth_token', personContainerId + '_person_id', personContainerId +''+ allergyId + '-allergy-list']);
		showLoadingWheel();
        $.post("php/remove_allergy.php", formData, function(returnData) {
            console.log("Update person received:");
            console.log(formData);
            console.log(returnData);
			
			hideLoadingWheel();
            if(returnData.status){
                allergy.remove();
            }else{
                populateErrorMessage(returnData.reason, null);
            }
        });
    };
}
function setUpEditButton(id, buttonType){
    var editButton = $('#'+ id + buttonType + '-edit-button');
    var saveButton = $('#'+ id + buttonType + '-save-button');
    var cancelButton = $('#'+ id + buttonType + '-cancel-button');

    editButton.hide();
    saveButton.show();
    cancelButton.show();
}
function setUpSaveOrCancelButton(id, buttonType){
    var editButton = $('#'+ id + buttonType + '-edit-button');
    var saveButton = $('#'+ id + buttonType + '-save-button');
    var cancelButton = $('#'+ id + buttonType + '-cancel-button');

    editButton.show();
    saveButton.hide();
    cancelButton.hide();
}

//Left Side Info
function setUpInfoLeftEditButton(id, buttonType){
    return function(){
		globalPartyInfo.party_people[id].disableLeftInfo = !globalPartyInfo.party_people[id].disableLeftInfo;
        console.log(id + ' editButton');
        $('#' + id + '-person-attending').selectmenu("enable");
        $('#' + id + '-person-food').selectmenu("enable");
        $('#' + id + '-person-over-21').selectmenu("enable");		
		if (globalPartyInfo.party_people[id].is_invited_to_rehearsal) {
			$('#' + id + '-person-attending-rehearsal').selectmenu("enable");
		}
		if (globalPartyInfo.party_people[id].is_invited_to_movie) {
			$('#' + id + '-person-attending-movie').selectmenu("enable");
		}

        setUpEditButton(id, buttonType);
    };
}
function setUpInfoLeftCancelButton(id, buttonType){
    return function(){
        globalPartyInfo.party_people[id].disableLeftInfo = !globalPartyInfo.party_people[id].disableLeftInfo;
        console.log(id + ' editButton');
        $('#' + id + '-person-attending').selectmenu("disable");
        $('#' + id + '-person-food').selectmenu("disable");
        $('#' + id + '-person-over-21').selectmenu("disable");
		if (globalPartyInfo.party_people[id].is_invited_to_rehearsal) {
			$('#' + id + '-person-attending-rehearsal').selectmenu("disable");
		}
		if (globalPartyInfo.party_people[id].is_invited_to_movie) {
			$('#' + id + '-person-attending-movie').selectmenu("disable");
		}

        setUpSaveOrCancelButton(id, buttonType);
		
		// Restore old values
		if (globalPartyInfo.party_people[id].is_attending === null) {
			$('#' + id + '-person-attending').val(-1).selectmenu('refresh', true);
		} else {
			$('#' + id + '-person-attending').val(globalPartyInfo.party_people[id].is_attending ? '1' : '0').selectmenu('refresh', true);
		}
		if (globalPartyInfo.party_people[id].food_pref === null) {
			$('#' + id + '-person-food').val(-1).selectmenu('refresh', true);
		} else {
			$('#' + id + '-person-food').val(globalPartyInfo.party_people[id].food_pref).selectmenu('refresh', true);
		}
		
		if (globalPartyInfo.party_people[id].over_21 === null) {
			$('#' + id + '-person-over-21').val(-1).selectmenu('refresh', true);
		} else {
			$('#' + id + '-person-over-21').val(globalPartyInfo.party_people[id].over_21 ? '1' : '0').selectmenu('refresh', true);
		}
		
		if (globalPartyInfo.party_people[id].is_invited_to_rehearsal) {
			if (globalPartyInfo.party_people[id].is_attending_rehearsal === null) {
				$('#' + id + '-person-attending-rehearsal').val(-1).selectmenu('refresh', true);
			} else {
				$('#' + id + '-person-attending-rehearsal').val(globalPartyInfo.party_people[id].is_attending_rehearsal ? '1' : '0').selectmenu('refresh', true);
			}
		}
		
		if (globalPartyInfo.party_people[id].is_invited_to_movie) {
			if (globalPartyInfo.party_people[id].is_attending_movie === null) {
				$('#' + id + '-person-attending-movie').val(-1).selectmenu('refresh', true);
			} else {
				$('#' + id + '-person-attending-movie').val(globalPartyInfo.party_people[id].is_attending_movie ? '1' : '0').selectmenu('refresh', true);
			}
		}
    };
}
function setUpInfoLeftSaveButton(id, buttonType){
    return function(){
        // Serialize all of the form data
		var formFields = ['party_id', 'auth_token', id + '_person_id', id + '-person-attending', id + '-person-food', id + '-person-over-21'];
		if (globalPartyInfo.party_people[id].is_invited_to_rehearsal) {
			formFields.push(id + '-person-attending-rehearsal');
		}
		if (globalPartyInfo.party_people[id].is_invited_to_movie) {
			formFields.push(id + '-person-attending-movie');
		}
		
        var formData = serializeFormData(formFields);
		showLoadingWheel();
        $.post("php/update_person_info.php", formData, createUpdatePersonInfoCallback(globalPartyInfo, id));
    };
}

function setUpPersonNameEditButton(id, buttonType){
    return function(){
		globalPartyInfo.party_people[id].disableNameInfo = !globalPartyInfo.party_people[id].disableNameInfo;
        console.log(id + ' editButton');
        $('#' + id + '-person-first-name').prop("disabled", globalPartyInfo.party_people[id].disableNameInfo);
        $('#' + id + '-person-last-name').prop("disabled", globalPartyInfo.party_people[id].disableNameInfo);

        setUpEditButton(id, buttonType);
    };
}
function setUpPersonNameCancelButton(id, buttonType){
    return function(){
		globalPartyInfo.party_people[id].disableNameInfo = !globalPartyInfo.party_people[id].disableNameInfo;
        console.log(id + ' editButton');
        $('#' + id + '-person-first-name').prop("disabled", globalPartyInfo.party_people[id].disableNameInfo);
        $('#' + id + '-person-last-name').prop("disabled", globalPartyInfo.party_people[id].disableNameInfo);

        setUpSaveOrCancelButton(id, buttonType);
		
		// Restore the old values
		$('#' + id + '-person-first-name').val(globalPartyInfo.party_people[id].first_name);
		$('#' + id + '-person-last-name').val(globalPartyInfo.party_people[id].last_name);
    };
}
function setUpPersonNameSaveButton(id, buttonType){
    return function(){
        // Serialize all of the form data
        var formData = serializeFormData(['party_id', 'auth_token', id + '_person_id',id + '-person-first-name', id + '-person-last-name']);
		showLoadingWheel();
        $.post("php/update_person_name.php", formData, createUpdatePersonNameCallback(globalPartyInfo, id));
    };
}

function setUpPartyInfoEditButton(id, buttonType){
    disablePartyInfo = !disablePartyInfo;
    $("#party-address-house-num").prop("disabled", disablePartyInfo);
    $("#party-address-street").prop("disabled", disablePartyInfo);
    $("#party-address-apt").prop("disabled", disablePartyInfo);
    $("#party-address-city").prop("disabled", disablePartyInfo);
    $("#party-address-state").prop("disabled", disablePartyInfo);
    $("#party-address-zip").prop("disabled", disablePartyInfo);

    setUpEditButton(id, buttonType);
}
function setUpPartyInfoCancelButton(id, buttonType){

    disablePartyInfo = !disablePartyInfo;
    $("#party-address-house-num").prop("disabled", disablePartyInfo);
    $("#party-address-street").prop("disabled", disablePartyInfo);
    $("#party-address-apt").prop("disabled", disablePartyInfo);
    $("#party-address-city").prop("disabled", disablePartyInfo);
    $("#party-address-state").prop("disabled", disablePartyInfo);
    $("#party-address-zip").prop("disabled", disablePartyInfo);

    setUpSaveOrCancelButton(id, buttonType);
	
	// Restore previous data
	console.log(globalPartyInfo);
	$("#party-address-house-num").val(globalPartyInfo.party_info.addr_house_num);
	$("#party-address-street").val(globalPartyInfo.party_info.addr_street);
	$("#party-address-apt").val(globalPartyInfo.party_info.addr_apt);
	$("#party-address-city").val(globalPartyInfo.party_info.addr_city);
	$("#party-address-state").val(globalPartyInfo.party_info.addr_state);
	$("#party-address-zip").val(globalPartyInfo.party_info.addr_zip);
}
function setUpPartyInfoSaveButton(id, buttonType){
    // Serialize all of the form data
    var formData = serializeFormData(['party_id', 'auth_token', 'party-address-house-num', 'party-address-street', 'party-address-apt', 'party-address-city', 'party-address-state', 'party-address-zip']);
	showLoadingWheel();
    $.post("php/update_address.php", formData, createUpdateAddressCallback(globalPartyInfo));

}

function createUpdatePersonNameCallback(partyInfo, personContainerID) {
	return function(returnData) {
		console.log(returnData);
		hideLoadingWheel();
		if (!returnData.status) {
			// Restore the old values
			$('#' + personContainerID + '-person-first-name').val(partyInfo.party_people[personContainerID].first_name);
			$('#' + personContainerID + '-person-last-name').val(partyInfo.party_people[personContainerID].last_name);
		} else {
			// Exit edit mode
			partyInfo.party_people[personContainerID].disableNameInfo = !partyInfo.party_people[personContainerID].disableNameInfo;
			console.log(personContainerID + ' saveButton');
			$('#' + personContainerID + '-person-first-name').prop("disabled", partyInfo.party_people[personContainerID].disableNameInfo);
			$('#' + personContainerID + '-person-last-name').prop("disabled", partyInfo.party_people[personContainerID].disableNameInfo);

			setUpSaveOrCancelButton(personContainerID, "-person-name");
			
			// Remember the new values
			partyInfo.party_people[personContainerID].first_name = $('#' + personContainerID + '-person-first_name').val();
			partyInfo.party_people[personContainerID].last_name = $('#' + personContainerID + '-person-last-name').val();
		}
	};
}

function createUpdatePersonInfoCallback(partyInfo, personContainerID) {
	return function(returnData) {
		console.log(returnData);
		hideLoadingWheel();
		if (!returnData.status) {
			populateErrorMessage(returnData.reason, null);
		} else {
			// Disable editing
			partyInfo.party_people[personContainerID].disableLeftInfo = !partyInfo.party_people[personContainerID].disableLeftInfo;
			console.log(personContainerID + ' editButton');
			$('#' + personContainerID + '-person-attending').selectmenu("disable");
			$('#' + personContainerID + '-person-food').selectmenu("disable");
			$('#' + personContainerID + '-person-over-21').selectmenu("disable");
			if (globalPartyInfo.party_people[personContainerID].is_invited_to_rehearsal) {
				$('#' + personContainerID + '-person-attending-rehearsal').selectmenu("disable");
			}
			if (globalPartyInfo.party_people[personContainerID].is_invited_to_movie) {
				$('#' + personContainerID + '-person-attending-movie').selectmenu("disable");
			}
			setUpSaveOrCancelButton(personContainerID, "-info-left");
			
			// Remember the new values
			partyInfo.party_people[personContainerID].is_attending = ($('#' + personContainerID + '-person-attending').val() == "1") ? true : false;
			partyInfo.party_people[personContainerID].food_pref = $('#' + personContainerID + '-person-food').val();
			partyInfo.party_people[personContainerID].over_21 = ($('#' + personContainerID + '-person-over-21').val() == "1") ? true : false;
			if (partyInfo.party_people[personContainerID].is_invited_to_rehearsal) {
				partyInfo.party_people[personContainerID].is_attending_rehearsal = ($('#' + personContainerID + '-person-attending-rehearsal').val() == "1") ? true : false;
			}
			if (partyInfo.party_people[personContainerID].is_invited_to_movie) {
				partyInfo.party_people[personContainerID].is_attending_movie = ($('#' + personContainerID + '-person-attending-movie').val() == "1") ? true : false;
			}
		}
	};
}

function createUpdateAddressCallback(partyInfo) {
	return function(returnData) {
		console.log(returnData);
		hideLoadingWheel();
		if (!returnData.status) {
			populateErrorMessage(returnData.reason, null);
		} else {
			// Disable edit mode
			disablePartyInfo = !disablePartyInfo;
			$("#party-address-house-num").prop("disabled", disablePartyInfo);
			$("#party-address-street").prop("disabled", disablePartyInfo);
			$("#party-address-apt").prop("disabled", disablePartyInfo);
			$("#party-address-city").prop("disabled", disablePartyInfo);
			$("#party-address-state").prop("disabled", disablePartyInfo);
			$("#party-address-zip").prop("disabled", disablePartyInfo);

			setUpSaveOrCancelButton('', 'party-info');
			
			// Remember the new values
			partyInfo.party_info.addr_house_num = $('#party-address-house-num').val();
			partyInfo.party_info.addr_street = $('#party-address-street').val();
			partyInfo.party_info.addr_apt = $('#party-address-apt').val();
			partyInfo.party_info.addr_city = $('#party-address-city').val();
			partyInfo.party_info.addr_state = $('#party-address-state').val();
			partyInfo.party_info.addr_zip = $('#party-address-zip').val();
		}
	};
}

function serializeFormData(ids) {
	var formData = "";
	for (var i = 0; i < ids.length; ++i) {
		var element = $('#' + ids[i])[0];
		var value;
		if (element.tagName.toLowerCase() == "span") {
			value = encodeURI(element.innerHTML);
			formData += (element.dataset.name + '=' + value + '&');
		} else {
			value = encodeURI(element.value);
			formData += (element.name + '=' + value + '&');
		}
	}
	
	// Remove the last & from the form data
	return formData.substring(0, formData.length - 1);
}
