<?php
	include_once("db_utils.php");

	function check_params($params_list) {
		for ($i = 0; $i < count($params_list); ++$i) {
			if (!isset($_POST[$params_list[$i]])) {
				return false;
			}
		}
		
		return true;
	}
	
	function authorize_request($party_id, $auth_token, $db_conn, &$results_out) {
		$login_status = check_login_status($party_id, $auth_token, $db_conn);
		switch ($login_status) {
			case NOT_LOGGED_IN:
				$results_out["status"] = false;
				$results_out["reason"] = "Not logged in";
				return false;
				
			case TOKEN_EXPIRED:
				$results_out["status"] = false;
				$results_out["reason"] = "Auth Token Expired";
				return false;
				
			case LOGGED_IN:
				return true;
				
			default:
				$results_out["status"] = false;
				$results_out["reason"] = "Unknown login error";
				return false;
		}
	}
?>