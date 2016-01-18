<?php
	function open_db_conn() {
		$dsn = 'mysql:host=192.168.0.105;dbname=wedding';
		$user = 'webapp';
		$password = 'penis69';
		$db_conn = new PDO($dsn, $user, $password, array());
		return $db_conn;
	}
?>