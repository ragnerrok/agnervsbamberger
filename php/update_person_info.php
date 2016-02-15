<?php
	require_once("create_db_conn.php");
	require_once("db_utils.php");
	require_once("utils.php");
	
	$return_value = array();
	
	$db_conn = open_db_conn();
	if (is_null($db_conn)) {
		$return_value["status"] = false;
		$return_value["reason"] = "Database Error";
	} else {
		// Make sure at least the person id was provided
		if (!isset($_POST["person_id"])) {
			$return_value["status"] = false;
			$return_value["reason"] = "Invalid Parameters";
		} else {
			$person_id = $_POST["person_id"];
			
			// Get the person's data to use for validation purposes
			$person_info = get_single_person($person_id, $db_conn);
			
			$params_to_check = array("party_id", "auth_token", "person_id", "is_attending", "food_pref", "over_21");
			if ($person_info["is_invited_to_rehearsal"]) {
				array_push($params_to_check, "is_attending_rehearsal");
			}
			if ($person_info["is_invited_to_movie"]) {
				array_push($params_to_check, "is_attending_movie");
			}
			
			if (!check_params($params_to_check)) {
				$return_value["status"] = false;
				$return_value["reason"] = "Invalid Parameters";
			} else {
				$party_id = $_POST["party_id"];
				$auth_token = $_POST["auth_token"];
				$is_attending = $_POST["is_attending"];
				$food_pref = $_POST["food_pref"];
				$over_21 = $_POST["over_21"];
				
				$is_attending_rehearsal = null;
				$is_attending_movie = null;
				if ($person_info["is_invited_to_rehearsal"]) {
					$is_attending_rehearsal = $_POST["is_attending_rehearsal"];
				}
				if ($person_info["is_invited_to_movie"]) {
					$is_attending_movie = $_POST["is_attending_movie"];
				}
				
				if (($is_attending != 0) && ($is_attending != 1)){
					$return_value["status"] = false;
					$return_value["reason"] = "Must indicate whether attending or not";
				} else if ($person_info["is_invited_to_rehearsal"] && (($is_attending_rehearsal != 0) && ($is_attending_rehearsal != 1))) {
					$return_value["status"] = false;
					$return_value["reason"] = "Must indicate whether attending rehearsal dinner or not";
				} else if ($person_info["is_invited_to_movie"] && (($is_attending_movie != 0) && ($is_attending_movie != 1))) {
					$return_value["status"] = false;
					$return_value["reason"] = "Must indicate whether attending movie or not";
				} else if (!validate_food_choice($food_pref, $db_conn)) {
					$return_value["status"] = false;
					$return_value["reason"] = "Must indicate food choice";
				} else {
					if (authorize_request($party_id, $auth_token, $db_conn, $return_value)) {
						if (!update_person_info($person_id, $is_attending, $food_pref, $over_21, $db_conn)) {
							$return_value["status"] = false;
							$return_value["reason"] = "Database Error";
						} else {
							$return_value["status"] = true;
							$return_value["person_id"] = $person_id;
							$return_value["is_attending"] = $is_attending;
							$return_value["food_pref"] = $food_pref;
							$return_value["over_21"] = $over_21;
							
							if ($person_info["is_invited_to_rehearsal"]) {
								$return_value["is_attending_rehearsal"] = $is_attending_rehearsal;
							}
							
							if ($person_info["is_invited_to_movie"]) {
								$return_value["is_attending_movie"] = $is_attending_movie;
							}
						}
					}
				}
			}
		}
	}
	
	header("Content-type: application/json");
	header("Cache-Control: no-cache, no-store, must-revalidate");
	header("Pragma: no-cache");
	header("Expires: 0");
	echo(json_encode($return_value));
?>