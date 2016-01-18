<?php
	include("create_db_conn.php");
	
	function generate_sign_in_code() {
		$sign_in_code = "";
		$value_map = array(0 => "A", 1 => "B", 2 => "C", 3 => "D", 4 => "E", 5 => "F", 6 => "G", 7 => "H", 8 => "J", 9 => "K", 10 => "L", 11 => "M", 12 => "N", 13 => "P", 14 => "Q", 15 => "R", 16 => "S", 17 => "T",
			18 => "U", 19 => "V", 20 => "W", 21 => "X", 22 => "Y", 23 => "Z", 24 => "2", 25 => "3", 26 => "4", 27 => "5", 28 => "6", 29 => "7", 30 => "8", 31 => "9");
		for ($i = 0; $i < 8; ++$i) {
			$rand_int = random_int(0, 31);
			$sign_in_code .= $value_map[$rand_int];
		}
		return $sign_in_code;
	}
	
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