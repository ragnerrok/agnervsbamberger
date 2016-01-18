<!DOCTYPE html>
<html>
	<head>
		<title>View Parties</title>
<?php
		include("create_db_conn.php");
?>
	</head>
	
	<body>
<?php
		include("admin_nav.html");
		$db_conn = open_db_conn();
		$parties = $db_conn->prepare("CALL list_all_party_data()");
		$parties->execute();
		echo("<table border='1'>");
		echo("<tr><th>Party ID</th><th>Address</th><th>Max Plus Ones</th><th>Hotel Rooms Needed</th><th>Members</th></tr>");
		for ($i = 0; $i < $parties->rowCount(); ++$i) {
			$party_row = $parties->fetch(PDO::FETCH_ASSOC);
			echo("<tr>");
			echo("<td>" . $party_row["party_id"] . "</td>");
			echo("<td>" . $party_row["addr_house_num"] . " " . $party_row["addr_street"] . "<br />");
			if (!is_null($party_row["addr_apt"])) {
				echo("#" . $party_row["addr_apt"]);
				echo("<br />");
			}
			echo($party_row["addr_city"] . " " . $party_row["addr_state"] . " " . sprintf("%05d", $party_row["addr_zip"]) . "</td>");
			echo("<td>" . $party_row["max_plus_ones"] . "</td>");
			echo("<td>" . $party_row["hotel_rooms_needed"] . "</td>");
			
			$first_names = explode(",", $party_row["first_names"]);
			$last_names = explode(",", $party_row["last_names"]);
			
			echo("<td><table border='1'>");
			for ($j = 0; $j < count($first_names); ++$j) {
				echo("<tr><td>" . $first_names[$j] . " " . $last_names[$j] . "</td></tr>");
			}
			echo("</table></td>");
			echo("</tr>");
		}
		echo("</table>");
?>

		</table>
	</body>

</html>