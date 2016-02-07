<?php
	require("create_db_conn.php");
	require_once("db_utils.php");
	require("utils.php");
	
	$return_value = array();
	if (!check_params(["party_id", "auth_token", "person_id", "first_name", "last_name"])) {
		$return_value["status"] = false;
		$return_value["reason"] = "Invalid Parameters";
	} else {
		$party_id = $_POST["party_id"];
		$auth_token = $_POST["auth_token"];
		$person_id = $_POST["person_id"];
		$first_name = $_POST["first_name"];
		$last_name = $_POST["last_name"];
		$db_conn = open_db_conn();
		
		if (is_null($db_conn)) {
			$return_value["status"] = false;
			$return_value["reason"] = "Database Error";
		} else {		
			if (authorize_request($party_id, $auth_token, $db_conn, $return_value)) {
				if (!update_person_name($person_id, $first_name, $last_name, $db_conn)) {
					$return_value["status"] = false;
					$return_value["reason"] = "Database Error";
				} else {
					$return_value["status"] = true;
					$return_value["person_id"] = $person_id;
					$return_value["first_name"] = $first_name;
					$return_value["last_name"] = $last_name;
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