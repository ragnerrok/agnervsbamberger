<?php
	require_once("create_db_conn.php");
	require_once("gen_codes_utils.php");
	
	$db_conn = open_db_conn();
	
	$get_parties = $db_conn->prepare("CALL list_parties_missing_signin_codes()");
	$get_parties->execute();
	$results = $get_parties->fetchAll(PDO::FETCH_ASSOC);
	
	$lookup_code_query = $db_conn->prepare("CALL lookup_party_id(:login_code)");
	$update_code_query = $db_conn->prepare("CALL update_signin_code(:party_id, :new_code)");
	
	for ($i = 0; $i < count($results); ++$i) {
		$party_id = $results[$i]["party_id"];
		$valid_code_generated = false;
		while (!$valid_code_generated) {
			// Keep generating new codes until we find one that hasn't already been used
			$new_code = generate_sign_in_code();
			$new_code_hash = md5($new_code);
			
			$lookup_code_query->bindParam(":login_code", $new_code_hash);
			$lookup_code_query->execute();
			
			$lookup_results = $lookup_code_query->fetchAll(PDO::FETCH_ASSOC);
			$lookup_code_query->closeCursor();
			
			if (count($lookup_results) == 0) {
				// This means we've generated a new unique code
				$update_code_query->bindParam(":party_id", $party_id);
				$update_code_query->bindParam(":new_code", $new_code_hash);
				$update_code_query->execute();
				$update_code_query->closeCursor();
				echo("Party ID " . $party_id . " login code updated to " . $new_code . " (" . $new_code_hash . ")<br />");
				$valid_code_generated = true;
			}
		}
	}
?>