<?php
	include("add_or_remove_music_suggestion.php");
	
	$result = add_or_remove_music_suggestion("add");
	
	header("Content-type: application/json");
	header("Cache-Control: no-cache, no-store, must-revalidate");
	header("Pragma: no-cache");
	header("Expires: 0");
	echo(json_encode($result));
?>