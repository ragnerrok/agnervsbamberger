<?php
	include("create_db_conn.php");
	include_once("db_utils.php");
	
	$return_value = array();
	if (isset($_POST["login_code"])) {
		$db_conn = open_db_conn();
		
		if (is_null($db_conn)) {
			$return_value["status"] = false;
			$return_value["reason"] = "Database Error";
		} else {
			// First, check if we need to throttle the login attempt
			if (throttle_login_attempts($_SERVER["REMOTE_ADDR"], $db_conn)) {
				$return_value["login_successful"] = false;
				$return_value["reason"] = "Login attempt throttling engaged.  Please wait a few seconds and try again.  Or, if you're Sam/Arda/Bryan/Sriram/etc. stop trying to haxx";
			} else {
				$login_code = strtoupper(trim($_POST["login_code"]));
				$login_hash = md5($login_code);
				
				$login_query = $db_conn->prepare("CALL lookup_party_id(:login_hash)");
				$login_query->bindParam(":login_hash", $login_hash);
				$login_query->execute();
				$results = $login_query->fetchAll(PDO::FETCH_ASSOC);
				
				if (count($results) > 0) {
					$login_query->closeCursor();
					$party_id = $results[0]["party_id"];				
					$return_value["login_successful"] = true;
					
					// Generate the login token
					$return_value["auth_token"] = generate_login_token($party_id, $db_conn);
					
					$return_value["party_id"] = $party_id;
					
					// Get party data
					$return_value["party_info"] = get_party_data($party_id, $db_conn);
					$return_value["party_info"]["current_plus_ones"] = get_current_plus_ones($party_id, $db_conn);
					
					// Get people in party
					$return_value["party_people"] = get_party_people($party_id, $db_conn);
					
					// Get music suggestions
					$return_value["music_suggestions"] = get_music_suggestions($party_id, $db_conn);
					
					// Get the food choices
					$return_value["food_choices"] = get_food_choices($db_conn);
				} else {
					$return_value["login_successful"] = false;
					$return_value["reason"] = "Invalid login code";
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