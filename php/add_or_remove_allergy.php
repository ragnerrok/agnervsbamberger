<?php
	require("create_db_conn.php");
	require_once("db_utils.php");
	require_once("utils.php");
	
	function add_or_remove_allergy($add_or_remove) {
		$return_value = array();
	
		if (!check_params(["party_id", "auth_token", "person_id", "allergy"])) {
			$return_value["status"] = false;
			$return_value["reason"] = "Invalid Parameters";
		} else {
			$party_id = $_POST["party_id"];
			$auth_token = $_POST["auth_token"];
			$person_id = $_POST["person_id"];
			$allergy = $_POST["allergy"];
			$db_conn = open_db_conn();
			
			// Validate client input
			if (strlen($allergy) <= 0) {
				$return_value["status"] = false;
				$return_value["reason"] = "Must enter an allergy";
			} else {
				if (authorize_request($party_id, $auth_token, $db_conn, $return_value)) {
					$result = false;
					if ($add_or_remove == "add") {
						$result = add_allergy($person_id, $allergy, $db_conn);
					} else {
						$result = remove_allergy($person_id, $allergy, $db_conn);
					}
					
					if (!$result) {
						$return_value["status"] = false;
						$return_value["reason"] = "Database Error";
					} else {
						$return_value["status"] = true;
						$return_value["person_id"] = $person_id;
						$return_value["allergy"] = $allergy;
					}
				}
			}
		}
		
		return $return_value;
	}
?>