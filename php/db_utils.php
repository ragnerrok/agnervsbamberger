<?php
	function get_music_suggestions($party_id, $db_conn) {
		$music_query = $db_conn->prepare("CALL get_music_suggestions(:party_id)");
		$music_query->bindParam(":party_id", $party_id);
		$music_query->execute();
		return $music_query->fetchAll(PDO::FETCH_ASSOC);
	}
	
	function get_party_data($party_id, $db_conn) {
		$party_data_query = $db_conn->prepare("CALL get_single_party(:party_id)");
		$party_data_query->bindParam(":party_id", $party_id);
		$party_data_query->execute();
		$results = $party_data_query->fetchAll(PDO::FETCH_ASSOC);
		return $results[0];
	}
	
	function get_party_people($party_id, $db_conn) {
		// First, get all of the people
		$party_people_query = $db_conn->prepare("CALL get_people_in_party(:party_id)");
		$party_people_query->bindParam(":party_id", $party_id);
		$party_people_query->execute();
		$people = $party_people_query->fetchAll(PDO::FETCH_ASSOC);
		$party_people_query->closeCursor();
		
		// Get the available food choices
		$food_choices = get_food_choices($db_conn);
		
		// Next, get the allergy information for each person
		$allergy_query = $db_conn->prepare("CALL get_allergies(:person_id)");
		for ($i = 0; $i < count($people); ++$i) {
			$allergy_query->bindParam(":person_id", $people[$i]["person_id"]);
			$allergy_query->execute();
			$allergies = array();
			while ($allergy = $allergy_query->fetch(PDO::FETCH_ASSOC)) {
				array_push($allergies, $allergy["food_allergy"]);
			}
			$people[$i]["allergies"] = $allergies;
			$allergy_query->closeCursor();
			
			// Determine the index of the selected food choice
			$people[$i]["selected_food_choice"] = food_choice_index($food_choices, $people[$i]["food_pref"]);
		}
		
		return $people;
	}
	
	function new_token_exp_time() {
		return time() + (30 * 60); // 30 minutes
	}
	
	function generate_login_token($party_id, $db_conn) {
		$token_exp_time = new_token_exp_time();
		$token = md5(mt_rand());
		$set_token_query = $db_conn->prepare("CALL set_login_token(:party_id, :token, :token_exp_time)");
		$set_token_query->bindParam(":party_id", $party_id);
		$set_token_query->bindParam(":token", $token);
		$set_token_query->bindParam(":token_exp_time", $token_exp_time);
		$set_token_query->execute();
		return $token;
	}
	
	define("NOT_LOGGED_IN", 1);
	define("TOKEN_EXPIRED", 2);
	define("LOGGED_IN", 3);
	
	function check_login_status($party_id, $token, $db_conn) {
		$token_query = $db_conn->prepare("CALL get_token_info(:party_id)");
		$token_query->bindParam(":party_id", $party_id);
		$token_query->execute();
		$results = $token_query->fetch(PDO::FETCH_ASSOC);
		$token_query->closeCursor();
		if (is_null($results["current_login_token"]) || is_null($results["token_expiration_time"])) {
			return NOT_LOGGED_IN;
		}
		
		if ($results["current_login_token"] != $token) {
			return NOT_LOGGED_IN;
		}
		
		if (time() > $results["token_expiration_time"]) {
			return TOKEN_EXPIRED;
		}
		
		// If we're here, the user is logged in
		// Go ahead and update the token expiration time
		$token_update_query = $db_conn->prepare("CALL update_login_token_exp_time(:party_id, :new_exp_time)");
		$token_update_query->bindParam(":party_id", $party_id);
		$new_exp_time = new_token_exp_time();
		$token_update_query->bindParam(":new_exp_time", $new_exp_time);
		$token_update_query->execute();
		
		return LOGGED_IN;
	}
	
	function music_suggestion_count($party_id, $db_conn) {
		$suggestion_query = $db_conn->prepare("SELECT music_suggestion_count(:party_id)");
		$suggestion_query->bindParam(":party_id", $party_id);
		$suggestion_query->execute();
		
		return $suggestion_query->fetch(PDO::FETCH_NUM)[0];
	}
	
	function add_music_suggestion($party_id, $artist_name, $song_title, $db_conn) {
		$add_music_query = $db_conn->prepare("CALL add_music_suggestion(:party_id, :artist_name, :song_title)");
		$add_music_query->bindParam(":party_id", $party_id);
		$add_music_query->bindParam(":artist_name", $artist_name);
		$add_music_query->bindParam(":song_title", $song_title);
		
		return $add_music_query->execute();
	}
	
	function remove_music_suggestion($party_id, $artist_name, $song_title, $db_conn) {
		$remove_music_query = $db_conn->prepare("CALL remove_music_suggestion(:party_id, :artist_name, :song_title)");
		$remove_music_query->bindParam(":party_id", $party_id);
		$remove_music_query->bindParam(":artist_name", $artist_name);
		$remove_music_query->bindParam(":song_title", $song_title);
		
		return $remove_music_query->execute();
	}
	
	function add_allergy($person_id, $allergy, $db_conn) {
		$add_allergy_query = $db_conn->prepare("CALL add_allergy(:person_id, :allergy)");
		$add_allergy_query->bindParam(":person_id", $person_id);
		$add_allergy_query->bindParam(":allergy", $allergy);
		
		return $add_allergy_query->execute();
	}
	
	function remove_allergy($person_id, $allergy, $db_conn) {
		$remove_allergy_query = $db_conn->prepare("CALL remove_allergy(:person_id, :allergy)");
		$remove_allergy_query->bindParam(":person_id", $person_id);
		$remove_allergy_query->bindParam(":allergy", $allergy);
		
		return $remove_allergy_query->execute();
	}
	
	function update_address($party_id, $addr_house_num, $addr_street, $addr_apt, $addr_city, $addr_state, $addr_zip, $db_conn) {
		$update_address_query = $db_conn->prepare("CALL update_address(:party_id, :addr_house_num, :addr_street, :addr_apt, :addr_city, :addr_state, :addr_zip)");
		$update_address_query->bindParam(":party_id", $party_id);
		$update_address_query->bindParam(":addr_house_num", $addr_house_num);
		$update_address_query->bindParam(":addr_street", $addr_street);
		$update_address_query->bindParam(":addr_apt", $addr_apt);
		$update_address_query->bindParam(":addr_city", $addr_city);
		$update_address_query->bindParam(":addr_state", $addr_state);
		$update_address_query->bindParam(":addr_zip", $addr_zip);
		
		return $update_address_query->execute();
	}
	
	function add_plus_one($first_name, $last_name, $food_pref, $over_21, $is_attending, $party_id, $db_conn) {
		$add_plus_one_query = $db_conn->prepare("CALL add_plus_one(:first_name, :last_name, :food_pref, :over_21, :is_attending, :party_id)");
		$add_plus_one_query->bindParam(":first_name", $first_name);
		$add_plus_one_query->bindParam(":last_name", $last_name);
		$add_plus_one_query->bindParam(":food_pref", $food_pref);
		$add_plus_one_query->bindParam(":over_21", $over_21);
		$add_plus_one_query->bindParam(":is_attending", $is_attending);
		$add_plus_one_query->bindParam(":party_id", $party_id);
		
		if (!$add_plus_one_query->execute()) {
			return 0;
		} else {
			return $db_conn->lastInsertId();
		}
	}
	
	function get_food_choices($db_conn) {
		$food_choices_query = $db_conn->prepare("CALL get_food_choices()");
		$food_choices_query->execute();
		$food_choices_string = $food_choices_query->fetch(PDO::FETCH_ASSOC)["Type"];
		$food_choices = array();
		preg_match("/enum\((.*)\)/", $food_choices_string, $food_choices);
		$food_choices_array = explode(",", $food_choices[1]);
		
		// Remove the quotes from the array entries
		for ($i = 0; $i < count($food_choices_array); ++$i) {
			$food_choices_array[$i] = substr($food_choices_array[$i], 1, -1);
		}
		return $food_choices_array;
	}
	
	function food_choice_index($choices, $selected_choice) {
		$selected_index = -1;
		for ($i = 0; $i < count($choices); ++$i) {
			if ($selected_choice == $choices[$i]) {
				$selected_index = $i;
				break;
			}
		}
		
		return $selected_index;
	}
?>