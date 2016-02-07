<?php
	function add_or_remove_music_suggestion($add_or_remove) {
		require("create_db_conn.php");
		require_once("db_utils.php");
		require_once("utils.php");
		
		define("MAX_MUSIC_SUGGESTIONS", 10);
		
		$return_value = array();
		
		if (!check_params(["party_id", "auth_token", "artist_name", "song_title"])) {
			$return_value["status"] = false;
			$return_value["reason"] = "Invalid Parameters";
		} else {
			$party_id = $_POST["party_id"];
			$auth_token = $_POST["auth_token"];
			$artist_name = $_POST["artist_name"];
			$song_title = $_POST["song_title"];
			$db_conn = open_db_conn();
			
			// Validate client data (just make sure artist and song are non-empty)
			if (strlen($artist_name) <= 0) {
				$return_value["status"] = false;
				$return_value["reason"] = "Must enter an artist name";
			} else if (strlen($song_title) <= 0) {
				$return_value["status"] = false;
				$return_value["reason"] = "Must enter a song title";
			} else {
				if (authorize_request($party_id, $auth_token, $db_conn, $return_value)) {
					if ($add_or_remove == "add") {
						$suggestion_count = music_suggestion_count($party_id, $db_conn);
						if ($suggestion_count >= MAX_MUSIC_SUGGESTIONS) {
							$return_value["status"] = false;
							$return_value["reason"] = "Music suggestion limit reached";
							return $return_value;
						}
					}
					
					$result = false;
					if ($add_or_remove == "add") {
						$result = add_music_suggestion($party_id, $artist_name, $song_title, $db_conn);
					} else {
						$result = remove_music_suggestion($party_id, $artist_name, $song_title, $db_conn);
					}
					
					if (!$result) {
						$return_value["status"] = false;
						$return_value["reason"] = "Database Error";
					} else {
						$return_value["status"] = true;
						$return_value["artist_name"] = $artist_name;
						$return_value["song_title"] = $song_title;
					}
				}
			}
		}
		
		return $return_value;
	}
?>