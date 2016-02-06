<?php
	require("create_db_conn.php");
	require_once("db_utils.php");
	require("utils.php");
	
	$return_value = array();
	if (!check_params(["party_id", "auth_token", "addr_house_num", "addr_street", "addr_apt", "addr_city", "addr_state", "addr_zip"])) {
		$return_value["status"] = false;
		$return_value["reason"] = "Invalid Parameters";
	} else {
		$party_id = $_POST["party_id"];
		$auth_token = $_POST["auth_token"];
		$addr_house_num = $_POST["addr_house_num"];
		$addr_street = $_POST["addr_street"];
		$addr_apt = ($_POST["addr_apt"] != "") ? $_POST["addr_apt"] : null;
		$addr_city = $_POST["addr_city"];
		$addr_state = $_POST["addr_state"];
		$addr_zip = $_POST["addr_zip"];
		$db_conn = open_db_conn();
		
		if (authorize_request($party_id, $auth_token, $db_conn, $return_value)) {
			// Validate zip code
			if (!preg_match("/[0-9]{5}/", $addr_zip)) {
				$return_value["status"] = false;
				$return_value["reason"] = "Invalid ZIP code";
			} else if (!validate_state($addr_state)) {
				$return_value["status"] = false;
				$return_value["reason"] = "Invalid State";
			} else {
				if (!update_address($party_id, $addr_house_num, $addr_street, $addr_apt, $addr_city, $addr_state, $addr_zip, $db_conn)) {
					$return_value["status"] = false;
					$return_value["reason"] = "Database Error";
				} else {
					$return_value["status"] = true;
					$return_value["addr_house_num"] = $addr_house_num;
					$return_value["addr_street"] = $addr_street;
					$return_value["addr_apt"] = $addr_apt;
					$return_value["addr_city"] = $addr_city;
					$return_value["addr_state"] = $addr_state;
					$return_value["addr_zip"] = $addr_zip;
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