<?php
	require("create_db_conn.php");
	require_once("db_utils.php");
	require("utils.php");
	
	$return_value = array();
	if (!check_params(["party_id", "auth_token", "first_name", "last_name", "food_pref", "over_21", "is_attending"])) {
		$return_value["status"] = false;
		$return_value["reason"] = "Invalid Parameters";
	} else {
		$party_id = $_POST["party_id"];
		$auth_token = $_POST["auth_token"];
		$first_name = $_POST["first_name"];
		$last_name = $_POST["last_name"];
		$food_pref = $_POST["food_pref"];
		$over_21 = $_POST["over_21"];
		$is_attending = $_POST["is_attending"];
		$db_conn = open_db_conn();
		
		if (authorize_request($party_id, $auth_token, $db_conn, $return_value)) {
			// Make sure this party can add more plus ones
			$party_max_plus_ones = get_max_plus_ones($party_id);
			$party_current_plus_ones = get_current_plus_ones($party_id);
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