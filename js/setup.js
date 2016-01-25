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
    $("#login-form").submit(function(event){
        var formData = $(this).serialize();
        $.post("php/login.php", formData, setUpRSVPContent);
        event.preventDefault();
    });
    $("#log-in-button" ).button();
    $("#add-plus-one-button" ).button().click(function() {
        console.log("Clicked plus one");
    });

    $("#party-info-edit-button").button().click(function(){
        disablePartyInfo = !disablePartyInfo;
       $("#party-info-address").prop("disabled", disablePartyInfo);
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
    var partyAccordion = $('#people-accordion');

    var partyPeople = jsonObject.party_people;
    for(var i = 0; i < jsonObject.party_people.length; i++){
        var partyPerson = partyPeople[i];
        //Party Person Name
        var partyPersonFirstName = partyPerson.first_name;
        var partyPersonLastName = partyPerson.last_name;
        partyAccordion.append('<h3 id="'+ i + '-person-name-container" class="person-label">' + '</h3>');
        var partyPersonH3 = $('#' + i + '-person-name-container');
        partyPersonH3.append('<textarea id="'+ i +'-person-first-name" class="person-label first-name larkspur-background" disabled>' + partyPersonFirstName + '</textarea>');
        partyPersonH3.append('<textarea id="'+ i +'-person-last-name" class="person-label last-name larkspur-background" disabled>' + partyPersonLastName + '</textarea>');
        partyPersonH3.append('<input  type="submit" id="' + i + '-person-name-edit-button" class="form-button form-edit-button" value="edit"/>');
        partyPersonH3.append('<input  type="submit" id="' + i + '-person-name-save-button" class="form-button form-save-button" value="save" style="display: none;"/>');
        partyPersonH3.append('<input  type="submit" id="' + i + '-person-name-cancel-button" class="form-button form-cancel-button" value="cancel" style="display: none;"/>');

        $('#' + i+ '-person-name-edit-button').button().click(setUpEditButton(i));
        $('#' + i+ '-person-name-save-button').button().click(setUpSaveButton(i));
        $('#' + i+ '-person-name-cancel-button').button().click(setUpCancelButton(i));


        //Party Person Info Div
        partyAccordion.append('<div id="' + i + '-person-info" class="person-info">' + '</div>');
        var partyPersonInfoDiv = $('#' + i + '-person-info');

        //Party Person Attending?
        var partyPersonComing = partyPerson.is_attending;
        partyPersonInfoDiv.append('<div class="attending-label label">Are you joining us?' + '</div>');
        partyPersonInfoDiv.append('<div id="' + i + '-person-attending" class="centuryGothicFont">' + partyPersonComing + '</div>');

        //Party Person Food Preference
        var partyPersonFood = partyPerson.food_pref;
        partyPersonInfoDiv.append('<div class="food-label label">Food Choice' + '</div>');
        partyPersonInfoDiv.append('<select id="' + i + '-person-food" class="select-food centuryGothicFont" disabled>' +  '</select>');
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
            }
        });

        //Party Person Allergies
        var partyPersonAllergies = partyPerson.allergies;
        partyPersonInfoDiv.append('<div class="allergies-label label">Allergies' + '</div>');
        partyPersonInfoDiv.append('<ul id="' + i +'-person-allergies" class="centuryGothicFont allergy-list">' + '</ul>');
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
    partyInfoContainer.append('<form><textarea id="party-address-house-num" class="party-info-address form-input larkspur-background centuryGothicFont" disabled>' + partyInfo.addr_house_num + '</textarea>');
    partyInfoContainer.append('<textarea id="party-address-street" class="party-info-address form-input larkspur-background centuryGothicFont" disabled>' + partyInfo.addr_street + '</textarea>');
    partyInfoContainer.append('<textarea id="party-address-apt" class="party-info-address form-input larkspur-background centuryGothicFont" disabled>' + partyInfo.addr_apt + '</textarea>');
    partyInfoContainer.append('<textarea id="party-address-city" class="party-info-address form-input larkspur-background centuryGothicFont" disabled>' + partyInfo.addr_city + '</textarea>');
    partyInfoContainer.append('<textarea id="party-address-state" class="party-info-address form-input larkspur-background centuryGothicFont" disabled>' + partyInfo.addr_state + '</textarea>');
    partyInfoContainer.append('<textarea id="party-address-zip" class="party-info-address form-input larkspur-background centuryGothicFont" disabled>' + partyInfo.addr_zip + '</textarea></form>');


}

function setUpEditButton(id){
    return function(){
        disableNameInfo = !disableNameInfo;
        console.log(id + ' editButton');
        $('#' + id + '-person-first-name').prop("disabled", disableNameInfo);
        $('#' + id + '-person-last-name').prop("disabled", disableNameInfo);

        var editButton = $('#'+ id + '-person-name-edit-button');
        var saveButton = $('#'+ id + '-person-name-save-button');
        var cancelButton = $('#'+ id + '-person-name-cancel-button');

        editButton.hide();
        saveButton.show();
        cancelButton.show();
    };
}

function setUpSaveButton(id){
    return function(){
        disableNameInfo = !disableNameInfo;
        console.log(id + ' saveButton');
        $('#' + id + '-person-first-name').prop("disabled", disableNameInfo);
        $('#' + id + '-person-last-name').prop("disabled", disableNameInfo);

        var editButton = $('#'+ id + '-person-name-edit-button');
        var saveButton = $('#'+ id + '-person-name-save-button');
        var cancelButton = $('#'+ id + '-person-name-cancel-button');

        editButton.show();
        saveButton.hide();
        cancelButton.hide();
    };
}

function setUpCancelButton(id){
    return function(){
        disableNameInfo = !disableNameInfo;
        console.log(id + ' cancelButton');
        $('#' + id + '-person-first-name').prop("disabled", disableNameInfo);
        $('#' + id + '-person-last-name').prop("disabled", disableNameInfo);

        var editButton = $('#'+ id + '-person-name-edit-button');
        var saveButton = $('#'+ id + '-person-name-save-button');
        var cancelButton = $('#'+ id + '-person-name-cancel-button');

        editButton.show();
        saveButton.hide();
        cancelButton.hide();
    };
}