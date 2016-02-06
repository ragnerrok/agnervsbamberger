/**
 * Created by Rachel on 1/16/2016.
 */
var ContentEnum = Object.freeze({
    RSVP_CONTENT: "rsvp-content",
    LOCATION_CONTENT: "location-content",
    HOTEL_CONTENT: "hotel-content",
    REGISTRY_CONTENT: "registry-content",
    FAQ_CONTENT: "faq-content",
    CONTACT_CONTENT: "contact-content",
    HOME_CONTENT: "home-content"
});
var selectedContent = ContentEnum.HOME_CONTENT;

var disablePartyInfo = true;
//TODO: Each person needs there own booleans
var disableNameInfo = true;
var disableLeftInfo = true;
var disableRightInfo = true;
var userLoggedIn = false;

var globalPartyInfo;

function init() {

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
    $( "#faq-button" ).button().click(function() {
        console.log("Clicked faq");
        switchContent(ContentEnum.FAQ_CONTENT);
    });
    $( "#contact-button" ).button().click(function() {
        console.log("Clicked contact");
        switchContent(ContentEnum.CONTACT_CONTENT);
    });


    //RSVP Content
    $("#log-in-button").click(function(event){
		var formData = serializeFormData(['guest-login-code']);
        $.post("php/login.php", formData, setUpRSVPContent);
    });
    $("#log-in-button" ).button();

    var addPlusOneBox = $("#add-plus-one-box");
    $("#add-plus-one-button" ).button().click(function() {
        addPlusOneBox.show();
        console.log("Clicked plus one");
    });
    $("#plus-one-cancel-button").button().click(function(){
        addPlusOneBox.hide();
        console.log("Clicked cancel plus one");
    });
    $("#plus-one-save-button").button().click(function(){
        addPlusOneBox.hide();
        console.log("Clicked save plus one");
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

    //Music Suggestion
    var musicBox = $("#add-song-suggestion-box");
    $("#add-music-button" ).button().click(function() {
        musicBox.show();
        console.log("Clicked add music");
    });
    $("#song-suggestion-cancel-button").button().click(function(){
        musicBox.hide();
        console.log("Clicked cancel music");
    });
    $("#song-suggestion-save-button").button().click(function(){
        musicBox.hide();
        console.log("Clicked save music");
    });

    //Contact Content
    $("#send-email-button" ).button().click(function() {
		var formData = serializeFormData(['guest-name', 'guest-email', 'guest-content']);
        $.post("php/send_question_email.php", formData, function(returnData) {
			if (returnData.status) {
				// If the email sent successfully, clear the form fields
				$('#guest-name').val("");
				$('#guest-email').val("");
				$('#guest-content').val("");
			} else {
				//TODO: Show error message
			}
		});
    });
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
    }else{
        if(!userLoggedIn) {
            $("#guest-not-logged-in").hide();
            $("#guest-logged-in").show();
            generatePartyInfo(jsonObject);
            userLoginedIn = true;
        }
    }
}

function generatePartyInfo(jsonObject){
	globalPartyInfo = jsonObject;
	
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
        //Party Person Name
        var partyPersonFirstName = partyPerson.first_name;
        var partyPersonLastName = partyPerson.last_name;
        partyAccordion.append('<h3 id="'+ i + '-person-name-container" class="person-label">' + '</h3>');
        var partyPersonH3 = $('#' + i + '-person-name-container');
        partyPersonH3.append('<textarea name="first_name" id="'+ i +'-person-first-name" class="person-label first-name larkspur-background" disabled>' + partyPersonFirstName + '</textarea>');
        partyPersonH3.append('<textarea name="last_name" id="'+ i +'-person-last-name" class="person-label last-name larkspur-background" disabled>' + partyPersonLastName + '</textarea>');
        partyPersonH3.append('<input  type="button" id="' + i + '-person-name-edit-button" class="form-button form-edit-button" value="edit"/>');
        partyPersonH3.append('<input  type="button" id="' + i + '-person-name-save-button" class="form-button form-save-button" value="save" style="display: none;"/>');
        partyPersonH3.append('<input  type="button" id="' + i + '-person-name-cancel-button" class="form-button form-cancel-button" value="cancel" style="display: none;"/>');

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
        var partyPersonAllergies = partyPerson.allergies;

        leftInfoDiv.append('<input  type="button" id="' + i + '-info-left-edit-button" class="form-button form-edit-float-button" value="edit"/>');
        leftInfoDiv.append('<input  type="button" id="' + i + '-info-left-cancel-button" class="form-button form-cancel-float-button" value="cancel" style="display: none;"/>');
        leftInfoDiv.append('<input  type="button" id="' + i + '-info-left-save-button" class="form-button form-save-float-button" value="save" style="display: none;"/>');

        rightInfoDiv.append('<input  type="button" id="' + i + '-info-right-edit-button" class="form-button form-edit-float-button" value="edit"/>');

        $('#' + i+ '-info-left-edit-button').button().click(setUpInfoLeftEditButton(i,'-info-left'));
        $('#' + i+ '-info-left-save-button').button().click(setUpInfoLeftSaveButton(i, '-info-left'));
        $('#' + i+ '-info-left-cancel-button').button().click(setUpInfoLeftCancelButton(i, '-info-left'));

        $('#' + i+ '-info-right-edit-button').button().click(setUpInfoRightEditButton(i, '-info-right', partyPersonAllergies));

        //TODO: Party Person Attending?
        var partyPersonComing = partyPerson.is_attending;
        leftInfoDiv.append('<div class="attending-label label">Are you joining us?</div>');
        //leftInfoDiv.append('<div id="' + i + '-person-attending" class="centuryGothicFont">' + partyPersonComing + '</div>');
        leftInfoDiv.append('<select name="is_attending" id="' + i + '-person-attending" class="centuryGothicFont" disabled>' +  '</select>');
        var isAttending = $('#' + i + '-person-attending');
        if(partyPersonComing == null){
            isAttending.append('<option selected="selected">Select an Option</option>');
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


        //Party Person Food Preference
        var partyPersonFood = partyPerson.selected_food_choice;
        leftInfoDiv.append('<div class="food-label label">Food Choice' + '</div>');
        leftInfoDiv.append('<select name="food_pref" id="' + i + '-person-food" class="select-food centuryGothicFont" disabled>' +  '</select>');
        var foodMenu = $('#' + i + '-person-food');
        var foodArray = jsonObject.food_choices;
        for(var k = 0; k < foodArray.length; k++){
            if(k == partyPersonFood){
                foodMenu.append('<option selected="selected">' + foodArray[k] + '</option>');
            }else{
                foodMenu.append('<option>' + foodArray[k] + '</option>');
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
        //leftInfoDiv.append('<div id="' + i + '-person-attending" class="centuryGothicFont">' + partyPersonComing + '</div>');
        leftInfoDiv.append('<select name="over_21" id="' + i + '-person-over-21" class="centuryGothicFont" disabled></select>');
        var over21 = $('#' + i + '-person-over-21');
        if(partyPerson21 == null){
            over21.append('<option selected="selected" disabled>Select an Option</option>');
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
        rightInfoDiv.append('<div class="allergies-label label">Allergies' + '</div>');
        rightInfoDiv.append('<ul id="' + i +'-person-allergies" class="centuryGothicFont allergy-list">' + '</ul>');
        var allergiesList = $('#' + i + '-person-allergies');
        if(partyPersonAllergies.length == 0){
            allergiesList.append('<li id="' + i + '-no-allergies" class="allergy">None</li>');
        }
        for(var k = 0; k < partyPersonAllergies.length; k++){
            allergiesList.append('<li id="'+ i + k +'-allergy-list-box" class="allergy"><span data-name="allergy" id="'+ i + k +'-allergy-list">' + partyPersonAllergies[k] + '</span></li>');
            var allergy = $('#' + i + k + '-allergy-list-box');
            allergy.append('<input  type="button" id="' + i + k + '-allergy-button" class="form-button form-delete-button" value="X" style="display: none;"/>');
            $('#' + i + k + '-allergy-button').button().click(deleteAllergy(i, k));
        }
        rightInfoDiv.append('<input name="allergy" type="text" id="' + i + '-new-allergy" class="form-add-allergy larkspur-background" style="display: none;"/>');
        rightInfoDiv.append('<input  type="button" id="' + i + '-new-allergy-button" class="form-button form-add-button" value="+" style="display: none;"/>');
        $('#' + i + '-new-allergy-button').button().click(addAllergy(i, partyPersonAllergies));

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
    partyInfoForm.append('<textarea name="addr_house_num" id="party-address-house-num" class="party-info-address party-info-address-first-row form-input larkspur-background centuryGothicFont" disabled>' + partyInfo.addr_house_num + '</textarea>');
    partyInfoForm.append('<textarea name="addr_street" id="party-address-street" class="party-info-address party-info-address-first-row form-input larkspur-background centuryGothicFont" disabled>' + partyInfo.addr_street + '</textarea>');
    partyInfoForm.append('<textarea name="addr_apt" id="party-address-apt" class="party-info-address party-info-address-second-row form-input larkspur-background centuryGothicFont" disabled>' + partyInfo.addr_apt + '</textarea>');
    partyInfoForm.append('<textarea name="addr_city" id="party-address-city" class="party-info-address party-info-address-third-row form-input larkspur-background centuryGothicFont" disabled>' + partyInfo.addr_city + '</textarea>');
    partyInfoForm.append('<textarea name="addr_state" id="party-address-state" class="party-info-address party-info-address-third-row form-input larkspur-background centuryGothicFont" disabled>' + partyInfo.addr_state + '</textarea>');
    partyInfoForm.append('<textarea name="addr_zip" id="party-address-zip" class="party-info-address party-info-address-third-row form-input larkspur-background centuryGothicFont" disabled>' + partyInfo.addr_zip + '</textarea>');


    //Music Suggestions
    var musicSuggestions = jsonObject.music_suggestions;
    var songTable = $('#song-table');

    for(var k = 0; k < musicSuggestions.length; k++){
        console.log(musicSuggestions[k]);
        songTable.append('<tr id="' + k + '-song">' + '</tr>');
        var songRow = $('#' + k + '-song');
        songRow.append('<td class="song-name centuryGothicFont dark-larkspur-text">' + musicSuggestions[k].song_title + '</td>');
        songRow.append('<td class="song-bond centuryGothicFont dark-larkspur-text">' + musicSuggestions[k].artist_name + '</td>');
    }

}
function addAllergy(personContainerId, allergyArray){
    return function(){
        console.log("ADD");
        //var allergy = $('#' + personId + '-new-allergy');
        var allergiesList = $('#' + personContainerId + '-person-allergies');
        var k = allergyArray.length;

        // Serialize all of the form data
        var formData = serializeFormData(['party_id', 'auth_token', personContainerId + '_person_id', personContainerId + '-new-allergy']);
        $.post("php/add_allergy.php", formData, function(returnData) {
            console.log("Update person received:");
            console.log(returnData);

            if(returnData.status){
                allergiesList.append('<li id="'+ personContainerId + k +'-allergy-list" class="allergy">'+ returnData.allergy +'</li>');
                var allergy = $('#' + personContainerId + k + '-allergy-list');
                allergy.append('<input  type="button" id="' + personContainerId + k + '-allergy-button" class="form-button form-delete-button" value="X"/>');
                $('#' + personContainerId + k + '-allergy-button').button().click(deleteAllergy(personContainerId, k));

                $('#' + personContainerId + '-new-allergy').val("");

                if(k == 0){
                    $('#' + personContainerId +'-no-allergies').remove();
                }
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
        $.post("php/remove_allergy.php", formData, function(returnData) {
            console.log("Update person received:");
            console.log(returnData);
            if(returnData.status){
                allergy.remove();
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
        disableLeftInfo = !disableLeftInfo;
        console.log(id + ' editButton');
        $('#' + id + '-person-attending').selectmenu("enable");
        $('#' + id + '-person-food').selectmenu("enable");
        $('#' + id + '-person-over-21').selectmenu("enable");

        setUpEditButton(id, buttonType);
    };
}
function setUpInfoLeftCancelButton(id, buttonType){
    return function(){
        disableLeftInfo = !disableLeftInfo;
        console.log(id + ' editButton');
        $('#' + id + '-person-attending').selectmenu("disable");
        $('#' + id + '-person-food').selectmenu("disable");
        $('#' + id + '-person-over-21').selectmenu("disable");

        setUpSaveOrCancelButton(id, buttonType);
    };
}
function setUpInfoLeftSaveButton(id, buttonType){
    return function(){
        disableLeftInfo = !disableLeftInfo;
        console.log(id + ' editButton');
        $('#' + id + '-person-attending').selectmenu("disable");
        $('#' + id + '-person-food').selectmenu("disable");
        $('#' + id + '-person-over-21').selectmenu("disable");

        setUpSaveOrCancelButton(id, buttonType);

        // Serialize all of the form data
        var formData = serializeFormData(['party_id', 'auth_token', id + '_person_id', id + '-person-attending', id + '-person-food', id + '-person-over-21']);
        $.post("php/update_person_info.php", formData, createUpdatePersonInfoCallback(globalPartyInfo, id));
    };
}

//RIGHT SIDE INFO
function setUpInfoRightEditButton(id, buttonType, allergies){
    return function(){
        disableRightInfo = !disableRightInfo;
        console.log(id + ' editButton');

        var newAllergy = $('#' + id + '-new-allergy');
        var newAllergyButton = $('#' + id + '-new-allergy-button');
        newAllergy.prop("disabled", disableRightInfo);
        newAllergyButton.prop("disabled", disableRightInfo);

        if(disableRightInfo){
            newAllergyButton.hide();
            newAllergy.hide();
        }else{
            newAllergyButton.show();
            newAllergy.show();
        }

        console.log(allergies.length);
        //TODO: Grab the current person's allergies. DONT pass it in.
        for(var k = 0; k < allergies.length; k++){
            var currentButton = $('#' + id + k + '-allergy-button');
            currentButton.prop("disabled", disableRightInfo);
            if(disableRightInfo){
                currentButton.hide();
            }else{
                currentButton.show();
            }
        }

        //setUpEditButton(id, buttonType);
    };
}

function setUpPersonNameEditButton(id, buttonType){
    return function(){
        disableNameInfo = !disableNameInfo;
        console.log(id + ' editButton');
        $('#' + id + '-person-first-name').prop("disabled", disableNameInfo);
        $('#' + id + '-person-last-name').prop("disabled", disableNameInfo);

        setUpEditButton(id, buttonType);
    };
}
function setUpPersonNameCancelButton(id, buttonType){
    return function(){
        disableNameInfo = !disableNameInfo;
        console.log(id + ' editButton');
        $('#' + id + '-person-first-name').prop("disabled", disableNameInfo);
        $('#' + id + '-person-last-name').prop("disabled", disableNameInfo);

        setUpSaveOrCancelButton(id, buttonType);
    };
}
function setUpPersonNameSaveButton(id, buttonType){
    return function(){
        disableNameInfo = !disableNameInfo;
        console.log(id + ' saveButton');
        $('#' + id + '-person-first-name').prop("disabled", disableNameInfo);
        $('#' + id + '-person-last-name').prop("disabled", disableNameInfo);

        setUpSaveOrCancelButton(id, buttonType);

        // Serialize all of the form data
        var formData = serializeFormData(['party_id', 'auth_token', id + '_person_id',id + '-person-first-name', id + '-person-last-name']);
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
}
function setUpPartyInfoSaveButton(id, buttonType){
    disablePartyInfo = !disablePartyInfo;
    $("#party-address-house-num").prop("disabled", disablePartyInfo);
    $("#party-address-street").prop("disabled", disablePartyInfo);
    $("#party-address-apt").prop("disabled", disablePartyInfo);
    $("#party-address-city").prop("disabled", disablePartyInfo);
    $("#party-address-state").prop("disabled", disablePartyInfo);
    $("#party-address-zip").prop("disabled", disablePartyInfo);

    setUpSaveOrCancelButton(id, buttonType);

    // Serialize all of the form data
    var formData = serializeFormData(['party_id', 'auth_token', 'party-address-house-num', 'party-address-street', 'party-address-apt', 'party-address-city', 'party-address-state', 'party-address-zip']);
    $.post("php/update_address.php", formData, createUpdateAddressCallback(globalPartyInfo));

}

function createUpdatePersonNameCallback(partyInfo, personContainerID) {
	return function(returnData) {
		console.log(returnData);
		if (!returnData.status) {
			// Restore the old values
			$('#' + personContainerID + '-person-first-name').val(partyInfo.party_people[personContainerID].first_name);
			$('#' + personContainerID + '-person-last-name').val(partyInfo.party_people[personContainerID].last_name);
		} else {
			// Remember the new values
			partyInfo.party_people[personContainerID].first_name = $('#' + personContainerID + '-person-first_name').val();
			partyInfo.party_people[personContainerID].last_name = $('#' + personContainerID + '-person-last-name').val();
		}
	};
}

function createUpdatePersonInfoCallback(partyInfo, personContainerID) {
	return function(returnData) {
		console.log(returnData);
		if (!returnData.status) {
			// Restore the old values
			$('#' + personContainerID + '-person-attending').val(partyInfo.party_people[personContainerID].is_attending).selectmenu('refresh', true);
			$('#' + personContainerID + '-person-food').val(partyInfo.party_people[personContainerID].food_pref).selectmenu('refresh', true);
			$('#' + personContainerID + '-person-over-21').val(partyInfo.party_people[personContainerID].over_21).selectmenu('refresh', true);
			// TODO: alert the user to the error
		} else {
			// Remember the new values
			partyInfo.party_people[personContainerID].is_attending = $('#' + personContainerID + '-person-attending').val();
			partyInfo.party_people[personContainerID].food_pref = $('#' + personContainerID + '-person-food').val();
			partyInfo.party_people[personContainerID].over_21 = $('#' + personContainerID + '-person-over-21').val();
		}
	};
}

function createUpdateAddressCallback(partyInfo) {
	return function(returnData) {
		console.log(returnData);
		if (!returnData.status) {
			// Restore the old values
			$('#party-address-house-num').val(partyInfo.party_info.addr_house_num);
			$('#party-address-street').val(partyInfo.party_info.addr_street);
			$('#party-address-apt').val(partyInfo.party_info.addr_apt);
			$('#party-address-city').val(partyInfo.party_info.addr_city);
			$('#party-address-state').val(partyInfo.party_info.addr_state);
			$('#party-address-zip').val(partyInfo.party_info.addr_zip);
			// TODO: alert the user to the error
		} else {
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
			if (element.value == "") {
				value = null;
			} else {
				value = encodeURI(element.value);
			}
			formData += (element.name + '=' + value + '&');
		}
	}
	
	// Remove the last & from the form data
	return formData.substring(0, formData.length - 1);
}
