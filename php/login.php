<?php
	include("create_db_conn.php");
	
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
	
	$login_successful = false;
	$party_id = -1;
	if (isset($_POST["login_code"])) {
		$db_conn = open_db_conn();
	
		$login_code = $_POST["login_code"];
		$login_hash = md5($login_code);
		
		$login_query = $db_conn->prepare("CALL lookup_party_id(:login_hash)");
		$login_query->bindParam(":login_hash", $login_hash);
		$login_query->execute();
		$results = $login_query->fetchAll(PDO::FETCH_ASSOC);
		
		if (count($results) > 0) {
			$login_successful = true;
			$party_id = $results[0]["party_id"];
		}
		$login_query = null;
	}
	
	$return_value = array();
	
	if ($login_successful) {
		$return_value["login_successful"] = true;
		
		// Get party data
		$return_value["party_info"] = get_party_data($party_id, $db_conn);
		
		// Get people in party
		$return_value["party_people"] = get_party_people($party_id, $db_conn);
		
		// Get music suggestions
		$return_value["music_suggestions"] = get_music_suggestions($party_id, $db_conn);
	} else {
		$return_value["login_successful"] = false;		
	}
	
	header("Content-type: application/json");
	header("Cache-Control: no-cache, no-store, must-revalidate");
	header("Pragma: no-cache");
	header("Expires: 0");
	echo(json_encode($return_value));
?>