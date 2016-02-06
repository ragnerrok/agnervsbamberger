<?php
	require_once("utils.php");
	require_once("mail_utils.php");
	
	$return_value = array();
	
	if (!check_params(["name", "from", "message"])) {
		$return_value["status"] = false;
		$return_value["reason"] = "Invalid parameters";
	} else {
		if (!send_question_email($_POST["name"], $_POST["from"], $_POST["message"])) {
			$return_value["status"] = false;
			$return_value["reason"] = "Send mail error";
		} else {
			$return_value["status"] = true;
		}
	}
	
	header("Content-type: application/json");
	header("Cache-Control: no-cache, no-store, must-revalidate");
	header("Pragma: no-cache");
	header("Expires: 0");
	echo(json_encode($return_value));
?>