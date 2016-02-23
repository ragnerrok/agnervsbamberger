<?php
	require_once("create_db_conn.php");
	require_once("gen_codes_utils.php");
	
	$db_conn = open_db_conn();
	
	$get_parties = $db_conn->prepare("CALL list_parties_missing_signin_codes()");
	$get_parties->execute();
	$results = $get_parties->fetchAll(PDO::FETCH_ASSOC);
	
	$sign_in_codes = array();
	
	for ($i = 0; $i < count($results); ++$i) {
		$new_code = generate_sign_in_code();
		
		// Make sure that we haven't generated a duplicate code
		while (in_array($new_code, $sign_in_codes)) {
			$new_code = generate_sign_in_code();
		}
		
		// Put the new code into the array
		array_push($sign_in_codes, $new_code);
	}
	
	$code_hashes = array();
	for ($i = 0; $i < count($sign_in_codes); ++$i) {
		array_push($code_hashes, md5($sign_in_codes[$i]));
	}
	
	for ($i = 0; $i < count($results); ++$i) {
		$update_query = $db_conn->prepare("CALL update_signin_code(:party_id, :signin_code)");
		$update_query->bindParam(":party_id", $results[$i]["party_id"]);
		$update_query->bindParam(":signin_code", $code_hashes[$i]);
		$update_query->execute();
		$update_query->closeCursor();
		// Free the prepared statement
		$update_query = null;
	}
	
	$people_query = $db_conn->prepare("CALL get_people_in_party(:party_id)");
	
	// Output the results as a CSV file
	header("Content-type: text/csv");
	header("Content-Disposition: attachment; filename=signin_codes.csv");
	header("Pragma: no-cache");
	header("Expires: 0");
	
	echo("Party_ID,Sign_In_Code,Sign_In_Hash,Addr_House_Num,Addr_Street,Addr_Apt,Addr_City,Addr_State,Addr_Zip,People\n");
	for ($i = 0; $i < count($results); ++$i) {
		echo($results[$i]["party_id"] . "," . $sign_in_codes[$i] . "," . $code_hashes[$i] . "," . $results[$i]["addr_house_num"] . "," . $results[$i]["addr_street"] . "," . $results[$i]["addr_apt"] . "," . $results[$i]["addr_city"] . "," . $results[$i]["addr_state"] . "," . $results[$i]["addr_zip"]);
		// Get the people in the party
		$people_query->bindParam(":party_id", $results[$i]["party_id"]);
		$people_query->execute();
		$people_info = $people_query->fetchAll(PDO::FETCH_ASSOC);
		$people_query->closeCursor();
		for ($j = 0; $j < count($people_info); ++$j) {
			echo("," . $people_info[$j]["first_name"] . " " . $people_info[$j]["last_name"]);
		}
		echo("\n");
	}
?>