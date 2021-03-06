<?php
	require_once("create_db_conn.php");
	require_once("db_utils.php");
	require_once("utils.php");
	
	$return_value = array();
	if (!check_params(["party_id", "auth_token", "first_name", "last_name", "food_pref", "over_21"])) {
		$return_value["status"] = false;
		$return_value["reason"] = "Invalid Parameters";
	} else {
		$party_id = $_POST["party_id"];
		$auth_token = $_POST["auth_token"];
		$first_name = $_POST["first_name"];
		$last_name = $_POST["last_name"];
		$over_21 = $_POST["over_21"];
		$food_pref = $_POST["food_pref"];
		$is_attending = 1;
		$db_conn = open_db_conn();
		
		if (is_null($db_conn)) {
			$return_value["status"] = false;
			$return_value["reason"] = "Database Error";
		} else {
			// Validate data from client
			
			if (strlen($first_name) <= 0) {
				// Make sure they have a first name
				$return_value["status"] = false;
				$return_value["reason"] = "Must enter a first name";
			} else if (strlen($last_name) <= 0) {
				// And a last name
				$return_value["status"] = false;
				$return_value["reason"] = "Must enter a last name";
			} else if (($over_21 != 0) && ($over_21 != 1)) {
				// Make sure they've chosen whether or not they're 21
				$return_value["status"] = false;
				$return_value["reason"] = "Must choose over or under 21";
			} else if (!validate_food_choice($food_pref, $db_conn)) {
				// Make sure they've chosen a valid food choice
				$return_value["status"] = false;
				$return_value["reason"] = "Must choose a food preference";
			} else {
				if (authorize_request($party_id, $auth_token, $db_conn, $return_value)) {
					// Make sure this party can add more plus ones
					$party_max_plus_ones = get_max_plus_ones($party_id, $db_conn);
					$party_current_plus_ones = get_current_plus_ones($party_id, $db_conn);
					if ($party_current_plus_ones >= $party_max_plus_ones) {
						$return_value["status"] = false;
						$return_value["reason"] = "Max number of plus ones reached";
					} else {
						$new_person_id = add_plus_one($first_name, $last_name, $food_pref, $over_21, $is_attending, $party_id, $db_conn);
						if ($new_person_id < 0) {
							$return_value["status"] = false;
							$return_value["reason"] = "Error adding person";
						} else {
							$return_value["status"] = true;
							$return_value["person_id"] = $new_person_id;
							$return_value["first_name"] = $first_name;
							$return_value["last_name"] = $last_name;
							$return_value["food_pref"] = $food_pref;
							$return_value["over_21"] = $over_21;
							$return_value["is_attending"] = $is_attending;
							$food_choices = get_food_choices($db_conn);
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