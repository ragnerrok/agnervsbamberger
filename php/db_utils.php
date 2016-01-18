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
	
	function generate_login_token($party_id, $db_conn) {
		$token_exp_time = time() + (30 * 60); // 30 minutes
		$token = md5(mt_rand());
		$set_token_query = $db_conn->prepare("CALL set_login_token(:party_id, :token, :token_exp_time)");
		$set_token_query->bindParam(":party_id", $party_id);
		$set_token_query->bindParam(":token", $token);
		$set_token_query->bindParam(":token_exp_time", $token_exp_time);
		$set_token_query->execute();
		return $token;
	}
?>