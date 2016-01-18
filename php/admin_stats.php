<!DOCTYPE html>
<html>
	<head>
		<title>Admin Statistics</title>
<?php
		include("create_db_conn.php");
?>
	</head>
	
	<body>
<?php
		function get_stat($db_conn, $stat_func) {
			$query = $db_conn->prepare("SELECT " . $stat_func);
			$query->execute();
			$result = $query->fetch(PDO::FETCH_NUM)[0];
			return $result;
		}

		include("admin_nav.html");
		$db_conn = open_db_conn();
		
		// Hotel rooms needed
		$num_rooms = get_stat($db_conn, "num_rooms()");
		echo("Number of Hotel Rooms Needed: " . $num_rooms);
		echo("<br />");
		
		// Total number of people invited
		$total_attendees = get_stat($db_conn, "num_attendees()");
		echo("Total Number of Attendees: " . $total_attendees);
		echo("<br />");
		
		// Total number of invitees
		$total_invitees = get_stat($db_conn, "num_attendees()");
		echo("Total Number of Invitees: " . $total_invitees);
		echo("<br />");
		
		// Total number of plus ones
		$total_plus_ones = get_stat($db_conn, "num_plus_ones()");
		echo("Total Number of Plus Ones: " . $total_plus_ones);
		echo("<br />");
		
		// Total number attending
		$total_attending = get_stat($db_conn, "num_attending()");
		echo("Total Number Attending: " . $total_attending);
		echo("<br />");
		
		// Total number not attending
		$total_plus_ones = get_stat($db_conn, "num_plus_ones()");
		echo("Total Number of Plus Ones: " . $total_plus_ones);
		echo("<br />");
		
		// Total number undecided
		$total_undecided = get_stat($db_conn, "num_undecided()");
		echo("Total Undecided: " . $total_undecided);
		echo("<br />");
		
		// Response percentage
		$response_percentage = ($total_attendees - $total_undecided) / $total_attendees;
		echo(sprintf("Response Percentage: %.0f%%", $response_percentage));
		echo("<br />");
		
		// Over 21
		$over_21 = get_stat($db_conn, "num_over_21()");
		echo("Over 21: " . $over_21);
		echo("<br />");
		
		// Under 21
		$under_21 = get_stat($db_conn, "num_under_21()");
		echo("Under 21: " . $under_21);
		echo("<br />");
		
		// Rehearsal invitees
		$rehearsal_invitees = get_stat($db_conn, "num_rehearsal_invitees()");
		echo("Rehearsal Dinner Invitees: " . $rehearsal_invitees);
		echo("<br />");
?>
	</body>

</html>