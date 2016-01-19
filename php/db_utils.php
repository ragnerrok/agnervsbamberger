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
	
	class LoginStatus extends SplEnum {
		const __default = self::NOT_LOGGED_IN;
		
		const NOT_LOGGED_IN = 1;
		const TOKEN_EXPIRED = 2;
		const LOGGED_IN = 3;
	}
	
	function check_login_status($party_id, $token, $db_conn) {
		$token_query = $db_conn->prepare("CALL get_token_info(:party_id)");
		$token_query->bindParam(":party_id", $party_id);
		$token_query->execute();
		$results = $token_query->fetch(PDO::FETCH_ASSOC);
		$token_query->closeCursor();
		if (is_null($results["current_login_token"]) || is_null($results["token_expiration_time"])) {
			return new LoginStatus(LoginStatus::NOT_LOGGED_IN);
		}
		
		if ($results["current_login_token"] != $token) {
			return new LoginStatus(LoginStatus::NOT_LOGGED_IN);
		}
		
		if (time() > $results["token_expiration_time"]) {
			return new LoginStatus(LoginStatus::TOKEN_EXPIRED);
		}
		
		// If we're here, the user is logged in
		// Go ahead and update the token expiration time
		$token_update_query = $db_conn->prepare("CALL update_login_token_exp_time(:party_id, :new_exp_time)");
		$token_update_query->bindParam(":party_id", $party_id);
		$token_update_query->bindParam(":new_exp_time", new_token_exp_time());
		$token_update_query->execute();
		
		return new LoginStatus(LoginStatus::LOGGED_IN);
	}
?>