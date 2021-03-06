<?php
	require_once("mail_utils.php");

	function map_to_boolean($value) {
		if ($value == null) {
			return null;
		} else {
			if ($value == 1) {
				return true;
			} else {
				return false;
			}
		}
	}

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
		$results = $party_data_query->fetchAll(PDO::FETCH_ASSOC)[0];
		// Fixup null apartments to empty string for display
		if (is_null($results["addr_apt"])) {
			$results["addr_apt"] = "";
		}
		// Fixup zip codes to always be 5 digits (possibly zero padded)
		$results["addr_zip"] = sprintf("%05s", $results["addr_zip"]);
		return $results;
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
			// Map all boolean results to actual booleans (for javascript)
			$people[$i]["is_attending"] = map_to_boolean($people[$i]["is_attending"]);
			$people[$i]["is_attending_rehearsal"] = map_to_boolean($people[$i]["is_attending_rehearsal"]);
			$people[$i]["is_attending_movie"] = map_to_boolean($people[$i]["is_attending_movie"]);
			$people[$i]["is_invited_to_movie"] = map_to_boolean($people[$i]["is_invited_to_movie"]);
			$people[$i]["is_invited_to_rehearsal"] = map_to_boolean($people[$i]["is_invited_to_rehearsal"]);
			$people[$i]["is_plus_one"] = map_to_boolean($people[$i]["is_plus_one"]);
			$people[$i]["over_21"] = map_to_boolean($people[$i]["over_21"]);
			
			$allergy_query->bindParam(":person_id", $people[$i]["person_id"]);
			$allergy_query->execute();
			$allergies = array();
			while ($allergy = $allergy_query->fetch(PDO::FETCH_ASSOC)) {
				array_push($allergies, $allergy["food_allergy"]);
			}
			$people[$i]["allergies"] = $allergies;
			$allergy_query->closeCursor();
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
		
		if ($add_music_query->execute()) {
			// If the update was successful, log it first
			log_add_music($party_id, $artist_name, $song_title);
			return true;
		} else {
			return false;
		}
	}
	
	function remove_music_suggestion($party_id, $artist_name, $song_title, $db_conn) {
		$remove_music_query = $db_conn->prepare("CALL remove_music_suggestion(:party_id, :artist_name, :song_title)");
		$remove_music_query->bindParam(":party_id", $party_id);
		$remove_music_query->bindParam(":artist_name", $artist_name);
		$remove_music_query->bindParam(":song_title", $song_title);
		
		if ($remove_music_query->execute()) {
			// If the update was successful, log it first
			log_remove_music($party_id, $artist_name, $song_title);
			return true;
		} else {
			return false;
		}
	}
	
	function add_allergy($person_id, $allergy, $db_conn) {
		// First, get the person info
		$person_info = get_single_person($person_id, $db_conn);
		if (is_null($person_info)) {
			return false;
		} else {
			$add_allergy_query = $db_conn->prepare("CALL add_allergy(:person_id, :allergy)");
			$add_allergy_query->bindParam(":person_id", $person_id);
			$add_allergy_query->bindParam(":allergy", $allergy);
			if ($add_allergy_query->execute()) {
				// If the update was successful, log it first
				log_add_allergy($person_info, $allergy);
				return true;
			} else {
				return false;
			}
		}
	}
	
	function remove_allergy($person_id, $allergy, $db_conn) {
		// First, get the person info
		$person_info = get_single_person($person_id, $db_conn);
		if (is_null($person_info)) {
			return false;
		} else {
			$remove_allergy_query = $db_conn->prepare("CALL remove_allergy(:person_id, :allergy)");
			$remove_allergy_query->bindParam(":person_id", $person_id);
			$remove_allergy_query->bindParam(":allergy", $allergy);
			if ($remove_allergy_query->execute()) {
				// If the update was successful, log it first
				log_remove_allergy($person_info, $allergy);
				return true;
			} else {
				return false;
			}
		}
	}
	
	function update_address($party_id, $addr_house_num, $addr_street, $addr_apt, $addr_city, $addr_state, $addr_zip, $db_conn) {
		// First, get the old info
		$old_info = get_party_data($party_id, $db_conn);
		
		if (is_null($old_info)) {
			return false;
		} else {
			$update_address_query = $db_conn->prepare("CALL update_address(:party_id, :addr_house_num, :addr_street, :addr_apt, :addr_city, :addr_state, :addr_zip)");
			$update_address_query->bindParam(":party_id", $party_id);
			$update_address_query->bindParam(":addr_house_num", $addr_house_num);
			$update_address_query->bindParam(":addr_street", $addr_street);
			$update_address_query->bindParam(":addr_apt", $addr_apt);
			$update_address_query->bindParam(":addr_city", $addr_city);
			$update_address_query->bindParam(":addr_state", $addr_state);
			$update_address_query->bindParam(":addr_zip", $addr_zip);
			
			if ($update_address_query->execute()) {
				// If the update was successful, log it first
				log_address_update($old_info, $addr_house_num, $addr_street, $addr_apt, $addr_city, $addr_state, $addr_zip);
				return true;
			} else {
				return false;
			}
		}
	}
	
	function add_plus_one($first_name, $last_name, $food_pref, $over_21, $is_attending, $party_id, $db_conn) {
		$add_plus_one_query = $db_conn->prepare("CALL add_plus_one(:first_name, :last_name, :food_pref, :over_21, :is_attending, :party_id)");
		$add_plus_one_query->bindParam(":first_name", $first_name);
		$add_plus_one_query->bindParam(":last_name", $last_name);
		$add_plus_one_query->bindParam(":food_pref", $food_pref);
		$add_plus_one_query->bindParam(":over_21", $over_21);
		$add_plus_one_query->bindParam(":is_attending", $is_attending);
		$add_plus_one_query->bindParam(":party_id", $party_id);
		if ($db_conn->beginTransaction()) {
			if ($add_plus_one_query->execute()) {
				$add_plus_one_query->closeCursor();
				$person_id_query = $db_conn->prepare("SELECT LAST_INSERT_ID() AS new_person_id");
				$person_id_query->execute();
				$new_person_id = $person_id_query->fetch(PDO::FETCH_ASSOC)["new_person_id"];
				if ($new_person_id > 0) {
					$db_conn->commit();
					// If adding the plus one was successful, log it
					log_add_plus_one($party_id, $new_person_id, $first_name, $last_name, $food_pref, $over_21);
					return $new_person_id;
				} else {
					$db_conn->rollBack();
					return -1;
				}
			} else {
				$db_conn->rollBack();
				return -1;
			}
		} else {
			return -1;
		}
	}
	
	function get_food_choices($db_conn) {
		$food_choices_query = $db_conn->prepare("CALL get_food_choices()");
		$food_choices_query->execute();
		return $food_choices_query->fetchAll(PDO::FETCH_NUM);
	}
	
	function get_max_plus_ones($party_id, $db_conn) {
		$max_plus_ones_query = $db_conn->prepare("SELECT max_plus_ones(:party_id) AS max_plus_ones");
		$max_plus_ones_query->bindParam(":party_id", $party_id);
		$max_plus_ones_query->execute();
		return $max_plus_ones_query->fetch(PDO::FETCH_ASSOC)["max_plus_ones"];
	}
	
	function get_current_plus_ones($party_id, $db_conn) {
		$current_plus_ones_query = $db_conn->prepare("SELECT current_plus_ones(:party_id) AS current_plus_ones");
		$current_plus_ones_query->bindParam(":party_id", $party_id);
		$current_plus_ones_query->execute();
		return $current_plus_ones_query->fetch(PDO::FETCH_ASSOC)["current_plus_ones"];
	}
	
	function get_single_person($person_id, $db_conn) {
		$get_single_person_query = $db_conn->prepare("CALL get_single_person(:person_id)");
		$get_single_person_query->bindParam(":person_id", $person_id);
		if ($get_single_person_query->execute()) {
			return $get_single_person_query->fetchAll(PDO::FETCH_ASSOC)[0];
		} else {
			return NULL;
		}
	}
	
	function update_person($person_id, $first_name, $last_name, $food_pref, $over_21, $is_attending, $db_conn) {
		$update_person_query = $db_conn->prepare("CALL update_person(:person_id, :first_name, :last_name, :food_pref, :over_21, :is_attending)");
		$update_person_query->bindParam(":person_id", $person_id);
		$update_person_query->bindParam(":first_name", $first_name);
		$update_person_query->bindParam(":food_pref", $food_pref);
		$update_person_query->bindParam(":over_21", $over_21);
		$update_person_query->bindParam(":is_attending", $is_attending);
		return $update_person_query->execute();
	}
	
	function update_person_name($person_id, $first_name, $last_name, $db_conn) {
		// First, get the old info (for logging purposes)
		$old_info = get_single_person($person_id, $db_conn);
		if (is_null($old_info)) {
			return false;
		} else {
			$update_person_name_query = $db_conn->prepare("CALL update_person_name(:person_id, :first_name, :last_name)");
			$update_person_name_query->bindParam(":person_id", $person_id);
			$update_person_name_query->bindParam(":first_name", $first_name);
			$update_person_name_query->bindParam(":last_name", $last_name);
			
			if ($update_person_name_query->execute()) {
				// If the update was successful, log it first
				log_name_update($old_info, $first_name, $last_name);
				return true;
			} else {
				return false;
			}
		}
	}
	
	function update_person_info($person_id, $is_attending, $food_pref, $over_21, $is_attending_rehearsal, $is_attending_movie, $db_conn) {
		// First, get the old info (for logging purposes)
		$old_info = get_single_person($person_id, $db_conn);
		if (is_null($old_info)) {
			return false;
		} else {
			$update_person_info_query = $db_conn->prepare("CALL update_person_info(:person_id, :is_attending, :food_pref, :over_21, :is_attending_rehearsal, :is_attending_movie)");
			$update_person_info_query->bindParam(":person_id", $person_id);
			$update_person_info_query->bindParam(":is_attending", $is_attending);
			$update_person_info_query->bindParam(":food_pref", $food_pref);
			$update_person_info_query->bindParam(":over_21", $over_21);
			$update_person_info_query->bindParam(":is_attending_rehearsal", $is_attending_rehearsal);
			$update_person_info_query->bindParam(":is_attending_movie", $is_attending_movie);
			if ($update_person_info_query->execute()) {
				// If update was successful, log it first
				log_info_update($old_info, $is_attending, $food_pref, $over_21, $is_attending_rehearsal, $is_attending_movie);
				return true;
			} else {
				return false;
			}
		}
	}
	
	function check_login_attempt_exists($login_ip, $db_conn) {
		$check_login_attempt_query = $db_conn->prepare("SELECT login_attempt_exists(:login_ip) AS login_attempt_exists");
		$check_login_attempt_query->bindParam(":login_ip", $login_ip);
		$check_login_attempt_query->execute();
		if ($check_login_attempt_query->fetch(PDO::FETCH_ASSOC)["login_attempt_exists"] == 1) {
			return true;
		} else {
			return false;
		}
	}
	
	function get_last_login_attempt($login_ip, $db_conn) {
		$get_last_login_query = $db_conn->prepare("SELECT last_login_attempt_timestamp(:login_ip) AS last_login_attempt");
		$get_last_login_query->bindParam(":login_ip", $login_ip);
		$get_last_login_query->execute();
		return $get_last_login_query->fetch(PDO::FETCH_ASSOC)["last_login_attempt"];
	}
	
	function add_new_login_attempt($login_ip, $db_conn) {
		$add_login_attempt_query = $db_conn->prepare("CALL add_new_login_attempt(:login_ip, :login_timestamp)");
		$add_login_attempt_query->bindParam(":login_ip", $login_ip);
		$current_time = time();
		$add_login_attempt_query->bindParam(":login_timestamp", $current_time);
		return $add_login_attempt_query->execute();
	}
	
	function update_login_attempt($login_ip, $db_conn) {
		$update_login_attempt_query = $db_conn->prepare("CALL update_login_attempt(:login_ip, :login_timestamp)");
		$update_login_attempt_query->bindParam(":login_ip", $login_ip);
		$current_time = time();
		$update_login_attempt_query->bindParam(":login_timestamp", $current_time);
		return $update_login_attempt_query->execute();
	}
	
	define("LOGIN_THROTTLE_THRESHOLD_S", 2);
	
	function throttle_login_attempts($login_ip, $db_conn) {
		// First, check if there have been any previous login attempts from this ip address
		if (!check_login_attempt_exists($login_ip, $db_conn)) {
			// If there haven't been, add an entry to the database, and return false (meaning don't throttle the login attempt)
			add_new_login_attempt($login_ip, $db_conn);
			return false;
		} else {
			// If there have been, check what the timestamp of the last login attempt was
			$last_login_attempt_timestamp = get_last_login_attempt($login_ip, $db_conn);
			// Update the last login attempt
			update_login_attempt($login_ip, $db_conn);
			// Now, check if the last login attempt was too recent and we need to throttle
			if ((time() - $last_login_attempt_timestamp) < LOGIN_THROTTLE_THRESHOLD_S) {
				return true;
			} else {
				return false;
			}
		}
	}
?>