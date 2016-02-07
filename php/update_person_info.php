<?php
	require_once("create_db_conn.php");
	require_once("db_utils.php");
	require_once("utils.php");
	
	$return_value = array();
	if (!check_params(["party_id", "auth_token", "person_id", "is_attending", "food_pref", "over_21"])) {
		$return_value["status"] = false;
		$return_value["reason"] = "Invalid Parameters";
	} else {
		$party_id = $_POST["party_id"];
		$auth_token = $_POST["auth_token"];
		$person_id = $_POST["person_id"];
		$is_attending = $_POST["is_attending"];
		$food_pref = $_POST["food_pref"];
		$over_21 = $_POST["over_21"];
		$db_conn = open_db_conn();
		
		if (is_null($db_conn)) {
			$return_value["status"] = false;
			$return_value["reason"] = "Database Error";
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