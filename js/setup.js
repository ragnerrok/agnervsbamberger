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
var disableNameInfo = true;
var userLoggedIn = false;
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
    $("#add-plus-one-button" ).button().click(function() {
        console.log("Clicked plus one");
    });

    var editButton = $('#party-info-edit-button');
    var saveButton = $('#party-info-save-button');
    var cancelButton = $('#party-info-cancel-button');

    editButton.button().click(function(){
        disablePartyInfo = !disablePartyInfo;
        $("#party-address-house-num").prop("disabled", disablePartyInfo);
        $("#party-address-street").prop("disabled", disablePartyInfo);
        $("#party-address-apt").prop("disabled", disablePartyInfo);
        $("#party-address-city").prop("disabled", disablePartyInfo);
        $("#party-address-state").prop("disabled", disablePartyInfo);
        $("#party-address-zip").prop("disabled", disablePartyInfo);

        editButton.hide();
        saveButton.show();
        cancelButton.show();
    });
    saveButton.button().click(function(){
        disablePartyInfo = !disablePartyInfo;
        $("#party-address-house-num").prop("disabled", disablePartyInfo);
        $("#party-address-street").prop("disabled", disablePartyInfo);
        $("#party-address-apt").prop("disabled", disablePartyInfo);
        $("#party-address-city").prop("disabled", disablePartyInfo);
        $("#party-address-state").prop("disabled", disablePartyInfo);
        $("#party-address-zip").prop("disabled", disablePartyInfo);

        editButton.show();
        saveButton.hide();
        cancelButton.hide();
    });
    cancelButton.button().click(function(){
        disablePartyInfo = !disablePartyInfo;
        $("#party-address-house-num").prop("disabled", disablePartyInfo);
        $("#party-address-street").prop("disabled", disablePartyInfo);
        $("#party-address-apt").prop("disabled", disablePartyInfo);
        $("#party-address-city").prop("disabled", disablePartyInfo);
        $("#party-address-state").prop("disabled", disablePartyInfo);
        $("#party-address-zip").prop("disabled", disablePartyInfo);

        editButton.show();
        saveButton.hide();
        cancelButton.hide();
    });

    //Music Suggestion
    $("#add-music-button" ).button().click(function() {
        console.log("Clicked add music");
    });

    //Contact Content
    $("#send-email-button" ).button().click(function() {
        console.log("Clicked send message");
        sendMessageToEmail();
    });
}

function switchContent(newSelectedContent){
    $("#" + selectedContent).hide();
    selectedContent = newSelectedContent;
    $("#" + newSelectedContent).show();
}

function sendMessageToEmail(){
    var guestName = $("#guest-name");
    var questEmail = $("#")
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
	var partyContainer = $('#rsvp-content');
	partyContainer.append('<input type="hidden" name="party_id" id="party_id" value="' + jsonObject.party_id + '" />');
	partyContainer.append('<input type="hidden" name="auth_token" id="auth_token" value="' + jsonObject.auth_token + '" />');
	
    var partyAccordion = $('#people-accordion');

    var partyPeople = jsonObject.party_people;
    var partyId = jsonObject.party_id;
    var partyAuthToken = jsonObject.auth_token;

    for(var i = 0; i < jsonObject.party_people.length; i++){
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

        leftInfoDiv.append('<input  type="button" id="' + i + '-info-left-edit-button" class="form-button form-edit-button" value="edit"/>');
        leftInfoDiv.append('<input  type="button" id="' + i + '-info-left-save-button" class="form-button form-save-button" value="save" style="display: none;"/>');
        leftInfoDiv.append('<input  type="button" id="' + i + '-info-left-cancel-button" class="form-button form-cancel-button" value="cancel" style="display: none;"/>');

        rightInfoDiv.append('<input  type="button" id="' + i + '-info-right-edit-button" class="form-button form-edit-button" value="edit"/>');
        rightInfoDiv.append('<input  type="button" id="' + i + '-info-right-save-button" class="form-button form-save-button" value="save" style="display: none;"/>');
        rightInfoDiv.append('<input  type="button" id="' + i + '-info-right-cancel-button" class="form-button form-cancel-button" value="cancel" style="display: none;"/>');

        $('#' + i+ '-info-left-edit-button').button().click(setUpInfoLeftEditButton('#' + i+ '-info-left-edit-button'));
        $('#' + i+ '-info-left-save-button').button().click(setUpInfoLeftSaveButton('#' + i+ '-info-left-save-button'));
        $('#' + i+ '-info-left-cancel-button').button().click(setUpInfoLeftCancelButton('#' + i+ '-info-left-cancel-button'));

        $('#' + i+ '-info-right-edit-button').button().click(setUpInfoRightEditButton('#' + i+ '-info-right-edit-button'));
        $('#' + i+ '-info-right-save-button').button().click(setUpInfoRightSaveButton('#' + i+ '-info-right-save-button'));
        $('#' + i+ '-info-right-cancel-button').button().click(setUpInfoRightCancelButton('#' + i+ '-info-right-cancel-button'));

        //TODO: Party Person Attending?
        var partyPersonComing = partyPerson.is_attending;
        leftInfoDiv.append('<div class="attending-label label">Are you joining us?' + '</div>');
        leftInfoDiv.append('<div id="' + i + '-person-attending" class="centuryGothicFont">' + partyPersonComing + '</div>');

        //Party Person Food Preference
        var partyPersonFood = partyPerson.food_pref;
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

        //TODO: Is 21


        //Party Person Allergies
        var partyPersonAllergies = partyPerson.allergies;
        rightInfoDiv.append('<div class="allergies-label label">Allergies' + '</div>');
        rightInfoDiv.append('<ul id="' + i +'-person-allergies" class="centuryGothicFont allergy-list">' + '</ul>');
        var allergiesList = $('#' + i + '-person-allergies');
        for(var k = 0; k < partyPersonAllergies.length; k++){
            allergiesList.append('<li class="allergy">' + partyPersonAllergies[k] + '</li>');
        }
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
function setUpInfoLeftEditButton(id, buttonType){
    return function(){
        disableNameInfo = !disableNameInfo;
        console.log(id + ' editButton');
        $('#' + id + '-person-first-name').prop("disabled", disableNameInfo);
        $('#' + id + '-person-last-name').prop("disabled", disableNameInfo);

        setUpEditButton(id, buttonType);
    };
}
function setUpInfoLeftCancelButton(id, buttonType){
    return function(){
        disableNameInfo = !disableNameInfo;
        console.log(id + ' editButton');
        $('#' + id + '-person-first-name').prop("disabled", disableNameInfo);
        $('#' + id + '-person-last-name').prop("disabled", disableNameInfo);

        setUpSaveOrCancelButton(id, buttonType);
    };
}
function setUpInfoLeftSaveButton(id, buttonType){
    return function(){
        disableNameInfo = !disableNameInfo;
        console.log(id + ' saveButton');
        $('#' + id + '-person-first-name').prop("disabled", disableNameInfo);
        $('#' + id + '-person-last-name').prop("disabled", disableNameInfo);

        setUpSaveOrCancelButton(id, buttonType);

        // Serialize all of the form data
        var formData = serializeFormData(['party_id', 'auth_token', id + '-person-first-name', id + '-person-last-name'])
        $.post("php/update_person.php", formData, function(returnData) {
            console.log("Update person received:");
            console.log(returnData);
        });
    };
}
function setUpInfoRightEditButton(id, buttonType){
    return function(){
        disableNameInfo = !disableNameInfo;
        console.log(id + ' editButton');
        $('#' + id + '-person-first-name').prop("disabled", disableNameInfo);
        $('#' + id + '-person-last-name').prop("disabled", disableNameInfo);

        setUpEditButton(id, buttonType);
    };
}
function setUpInfoRightCancelButton(id, buttonType){
    return function(){
        disableNameInfo = !disableNameInfo;
        console.log(id + ' editButton');
        $('#' + id + '-person-first-name').prop("disabled", disableNameInfo);
        $('#' + id + '-person-last-name').prop("disabled", disableNameInfo);

        setUpSaveOrCancelButton(id, buttonType);
    };
}
function setUpInfoRightSaveButton(id, buttonType){
    return function(){
        disableNameInfo = !disableNameInfo;
        console.log(id + ' saveButton');
        $('#' + id + '-person-first-name').prop("disabled", disableNameInfo);
        $('#' + id + '-person-last-name').prop("disabled", disableNameInfo);

        setUpSaveOrCancelButton(id, buttonType);

        // Serialize all of the form data
        var formData = serializeFormData(['party_id', 'auth_token', id + '-person-first-name', id + '-person-last-name'])
        $.post("php/update_person.php", formData, function(returnData) {
            console.log("Update person received:");
            console.log(returnData);
        });
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
        var formData = serializeFormData(['party_id', 'auth_token', id + '-person-first-name', id + '-person-last-name'])
        $.post("php/update_person.php", formData, function(returnData) {
            console.log("Update person received:");
            console.log(returnData);
        });
    };
}

function serializeFormData(ids) {
	var formData = "";
	for (var i = 0; i < ids.length; ++i) {
		var element = $('#' + ids[i])[0];
		var value;
		if (element.value == "") {
			value = null;
		} else {
			value = encodeURI(element.value);
		}
		formData += (element.name + '=' + value + '&');
	}
	
	// Remove the last & from the form data
	return formData.substring(0, formData.length - 1);
}
