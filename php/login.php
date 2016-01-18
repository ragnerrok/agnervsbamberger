<?php
	include("create_db_conn.php");
	
	function get_music_suggestions($party_id, $db_conn) {
		$music_query = $db_conn->prepare("CALL get_music_suggestions(:party_id)");
		$music_query->bindParam(":party_id", $party_id);
		$music_query->execute();
		return $music_query->fetchAll(PDO::FETCH_ASSOC);
	}
	
	function get_allergies($people, $db_conn) {
		$allergy_query = $db_conn->prepare("CALL get_allergies(:person_id)");
		$results = array();
		for ($i = 0; $i < count($people); ++$i) {
			$allergy_entry = array();
			$allergy_entry["person"] = $people[$i]["first_name"] . " " . $people[$i]["last_name"];
			$allergy_query->bindParam(":person_id", $people[$i]["person_id"]);
			$allergy_query->execute();
			$allergy_entry["allergies"] = $allergy_query->fetchAll(PDO::FETCH_ASSOC);
			$allergy_query->closeCursor();
			array_push($results, $allergy_entry);
		}
		return $results;
	}
	
	function get_party_data($party_id, $db_conn) {
		$party_data_query = $db_conn->prepare("CALL get_single_party(:party_id)");
		$party_data_query->bindParam(":party_id", $party_id);
		$party_data_query->execute();
		$results = $party_data_query->fetchAll(PDO::FETCH_ASSOC);
		return $results[0];
	}
	
	function get_party_people($party_id, $db_conn) {
		$party_people_query = $db_conn->prepare("CALL get_people_in_party(:party_id)");
		$party_people_query->bindParam(":party_id", $party_id);
		$party_people_query->execute();
		return $party_people_query->fetchAll(PDO::FETCH_ASSOC);
	}
	
	$db_conn = open_db_conn();
	
	$login_code = $_POST["login_code"];
	$login_hash = md5($login_code);
	
	$login_query = $db_conn->prepare("CALL lookup_party_id(:login_hash)");
	$login_query->bindParam(":login_hash", $login_hash);
	$login_query->execute();
	$results = $login_query->fetchAll(PDO::FETCH_ASSOC);
	$login_successful = false;
	$party_id = -1;
	if (count($results) > 0) {
		$login_successful = true;
		$party_id = $results[0]["party_id"];
	}
	$login_query = null;
	
	$return_value = array();
	
	if ($login_successful) {
		$return_value["login_successful"] = true;
		
		// Get party data
		$return_value["party_info"] = get_party_data($party_id, $db_conn);
		
		// Get people in party
		$people = get_party_people($party_id, $db_conn);
		$return_value["party_people"] = $people;
		
		// Get music suggestions
		$return_value["music_suggestions"] = get_music_suggestions($party_id, $db_conn);
		
		// Get allergy information
		$return_value["allergy_info"] = get_allergies($people, $db_conn);
	} else {
		$return_value["login_successful"] = false;
		
	}
	
	header("Content-type: application/json");
	header("Cache-Control: no-cache, no-store, must-revalidate");
	header("Pragma: no-cache");
	header("Expires: 0");
	echo(json_encode($return_value));
?>