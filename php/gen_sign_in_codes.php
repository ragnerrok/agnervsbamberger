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
	
	// Output the results as a CSV file
	header("Content-type: text/csv");
	header("Content-Disposition: attachment; filename=signin_codes.csv");
	header("Pragma: no-cache");
	header("Expires: 0");
	
	echo("Party_ID,Sign_In_Code,Sign_In_Hash\n");
	for ($i = 0; $i < count($results); ++$i) {
		echo($results[$i]["party_id"] . "," . $sign_in_codes[$i] . "," . $code_hashes[$i] . "\n");
	}
?>