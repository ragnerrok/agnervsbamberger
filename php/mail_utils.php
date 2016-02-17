<?php
	require_once("utils.php");

	function log_add_allergy($person_info, $allergy) {
		$subject = "[Add Allergy] Person " . $person_info["person_id"] . " (" . $person_info["first_name"] . " " . $person_info["last_name"] . ")";
		$message = "Person ID " . $person_info["person_id"] . " added an allergy\r\n";
		$message .= "New Allergy: " . $allergy . "\r\n";
		return send_log_email($subject, $message);
	}
	
	function log_remove_allergy($person_info, $allergy) {
		$subject = "[Remove Allergy] Person " . $person_info["person_id"] . " (" . $person_info["first_name"] . " " . $person_info["last_name"] . ")";
		$message = "Person ID " . $person_info["person_id"] . " removed an allergy\r\n";
		$message .= "Removed Allergy: " . $allergy . "\r\n";
		return send_log_email($subject, $message);
	}
	
	function log_add_music($party_id, $artist_name, $song_title) {
		$subject = "[Add Music] Party " . $party_id;
		$message = "Party ID " . $party_id . " added a music suggestion\r\n";
		$message .= "New Music:\r\n";
		$message .= "Artist: " . $artist_name . "\r\n";
		$message .= "Song Title: " . $song_title . "\r\n";
		return send_log_email($subject, $message);
	}
	
	function log_remove_music($party_id, $artist_name, $song_title) {
		$subject = "[Remove Music] Party " . $party_id;
		$message = "Party ID " . $party_id . " removed a music suggestion\r\n";
		$message .= "Removed Music:\r\n";
		$message .= "Artist: " . $artist_name . "\r\n";
		$message .= "Song Title: " . $song_title . "\r\n";
		return send_log_email($subject, $message);
	}
	
	function log_address_update($old_info, $new_addr_house_num, $new_addr_street, $new_addr_apt, $new_addr_city, $new_addr_state, $new_addr_zip) {
		$subject = "[Update Address] Party " . $old_info["party_id"];
		$message = "Party ID " . $old_info["party_id"] . " updated their address\r\n";
		$message .= "New Address:\r\n";
		$message .= "House Number: " . $new_addr_house_num . "\r\n";
		$message .= "Street: " . $new_addr_street . "\r\n";
		$message .= "Apt: " . $new_addr_apt . "\r\n";
		$message .= "City: " . $new_addr_city . "\r\n";
		$message .= "State: " . $new_addr_state . "\r\n";
		$message .= "Zip: " . $new_addr_zip . "\r\n";
		$message .= "Old Address:\r\n";
		$message .= "House Number: " . $old_info["addr_house_num"] . "\r\n";
		$message .= "Street: " . $old_info["addr_street"] . "\r\n";
		$message .= "Apt: " . $old_info["addr_apt"] . "\r\n";
		$message .= "City: " . $old_info["addr_city"] . "\r\n";
		$message .= "State: " . $old_info["addr_state"] . "\r\n";
		$message .= "Zip: " . $old_info["addr_zip"] . "\r\n";
		return send_log_email($subject, $message);
	}
	
	function log_add_plus_one($party_id, $person_id, $first_name, $last_name, $food_choice, $over_21) {
		$subject = "[Add Plus One] New Person " . $person_id . " (" . $first_name . " " . $last_name . ")";
		$message = "New person added to party " . $party_id . ":\r\n";
		$message .= "Person ID: " . $person_id . "\r\n";
		$message .= "First Name: " . $first_name . "\r\n";
		$message .= "Last Name: " . $last_name . "\r\n";
		$message .= "Food Choice: " . $food_choice . "\r\n";
		$message .= "Over 21: " . $over_21 . "\r\n";
		return send_log_email($subject, $message);
	}

	function log_info_update($old_info, $new_is_attending, $new_food_choice, $new_over_21, $new_is_attending_rehearsal, $new_is_attending_movie) {
		$subject = "[Info Update] Person " . $old_info["person_id"] . " (" . $old_info["first_name"] . " " . $old_info["last_name"] . ")";
		$message = "Person ID " . $old_info["person_id"] . " updated their info\r\n";
		$message .= "New Info:\r\n";
		$message .= "Is attending: " . $new_is_attending . "\r\n";
		$message .= "Food Choice: " . $new_food_choice . "\r\n";
		$message .= "Over 21: " . $new_over_21 . "\r\n";
		$message .= "Attending rehearsal dinner: " . $new_is_attending_rehearsal . "\r\n";
		$message .= "Attending movie: " . $new_is_attending_movie . "\r\n";
		$message .= "Old Info:\r\n";
		$message .= "Is attending: " . $old_info["is_attending"] . "\r\n";
		$message .= "Food Choice: " . $old_info["food_pref"] . "\r\n";
		$message .= "Over 21: " . $old_info["over_21"] . "\r\n";
		$message .= "Attending rehearsal dinner: " . $old_info["is_attending_rehearsal"] . "\r\n";
		$message .= "Attending movie: " . $old_info["is_attending_movie"] . "\r\n";
		return send_log_email($subject, $message);
	}

	function log_name_update($old_info, $new_first_name, $new_last_name) {
		$subject = "[Name Update] Person " . $old_info["person_id"] . " (" . $old_info["first_name"] . " " . $old_info["last_name"] . ")";
		$message = "Person ID " . $old_info["person_id"] . " updated their name\r\n";
		$message .= "New Name:\r\n";
		$message .= $new_first_name . " " . $new_last_name . "\r\n";
		$message .= "Old Name:\r\n";
		$message .= $old_info["first_name"] . " " . $old_info["last_name"] . "\r\n";
		return send_log_email($subject, $message);
	}
	
	function send_log_email($subject, $message) {
		$to = "agnervsbamberger@gmail.com";
		return mail($to, $subject, $message);
	}
	
	function send_question_email($name, $from, $message) {
		$to = "agnervsbamberger@gmail.com";
		$name = filterName($name);
		$from = filterEmail($from);
		$subject = "[Question] Question from " . $name . " (" . $from . ")";
		$message = wordwrap(filterOther($message), 70, "\r\n");
		$message = "A question from " . $name . ":\r\n" . $message;
		$headers = "From: " . $from . "\r\n" . "Reply-To: " . $from . "\r\n";
		return mail($to, $subject, $message, $headers);
	}
	
	function send_login_trouble_email($name, $from, $login_code, $message) {
		$to = "agnervsbamberger@gmail.com";
		$name = filterName($name);
		$from = filterEmail($from);
		$subject = "[Login Trouble] " . $name . " (" . $from . ") is having login trouble";
		$message = wordwrap(filterOther($message), 70, "\r\n");
		$login_code = filterOther($login_code);
		$message = $name . " is having trouble logging in with code " . $login_code . "\r\nMessage:\r\n" . $message;
		$headers = "From: " . $from . "\r\n" . "Reply-To: " . $from . "\r\n";
		return mail($to, $subject, $message, $headers);
	}
?>