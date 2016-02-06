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
	
	function validate_state($state) {
		$valid_states = array("AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY");
		return in_array($state, $valid_states);
	}
	
	function validate_food_choice($food_choice, $db_conn) {
		$food_choices = get_food_choices($db_conn);
		return in_array($food_choice, $food_choices);
	}
	
	// Email sanitizing functions come from Zend_Mail via way of this stack overflow question:
	// http://stackoverflow.com/questions/8071916/escape-string-to-use-in-mail
	function filterEmail($email) {
		$rule = array("\r" => '',
					  "\n" => '',
					  "\t" => '',
					  '"'  => '',
					  ','  => '',
					  '<'  => '',
					  '>'  => '',
		);

		return strtr($email, $rule);
	}

	function filterName($name) {
		$rule = array("\r" => '',
					  "\n" => '',
					  "\t" => '',
					  '"'  => "'",
					  '<'  => '[',
					  '>'  => ']',
		);

		return trim(strtr($name, $rule));
	}

	function filterOther($data) {
		$rule = array("\r" => '',
					  "\n" => '',
					  "\t" => '',
		);

		return strtr($data, $rule);
	}
?>