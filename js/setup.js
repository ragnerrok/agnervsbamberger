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
        $.post("php/login.php", formData, function(){
            console.log("WE DID THINGS");
        });
        event.preventDefault();
    });
    $( "#log-in-button" ).button().click(function() {
        console.log("Clicked Log In");
        $("#guest-not-logged-in").hide();
        $("#guest-logged-in").show();
    });
    $( "#add-plus-one-button" ).button().click(function() {
        console.log("Clicked plus one");
    });
    $( "#people-accordion" ).accordion({
        heightStyle: "content"
    });

    //Music Suggestion
    $( "#add-music-button" ).button().click(function() {
        console.log("Clicked add music");
    });

    //Contact Content
    $( "#send-email-button" ).button().click(function() {
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
}