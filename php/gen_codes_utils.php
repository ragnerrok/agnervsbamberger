<?php
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
?>