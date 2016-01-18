<!DOCTYPE html>
<html>
	<head>
		<title>Missing Addressees</title>
<?php
		include('create_db_conn.php');
?>
	</head>
	
	<body>
<?php
		include('admin_nav.html');
		$db_conn = open_db_conn();
		$stmt = $db_conn->prepare('CALL list_unknown_addressees()');
		$stmt->execute();
		echo("Number of Missing Addressees: " . $stmt->rowCount());
?>
		<table border='1'>
			<tr>
				<th>First Name</th>
				<th>Last Name</th>
			</tr>
		
<?php
			for ($i = 0; $i < $stmt->rowCount(); ++$i) {
				$row = $stmt->fetch(PDO::FETCH_ASSOC);
				echo('<tr><td>' . $row['first_name'] . '</td><td>' . $row['last_name'] . '</td></tr>');
			}
?>

		</table>
	</body>

</html>