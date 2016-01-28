<?php
	require("fpdf/fpdf.php");
	require("create_db_conn.php");
	
	define("POINTS_TO_INCHES", 0.0138889);
	define("NAME_SIZE_PTS", 20);
	define("ADDR_SIZE_PTS", 14);
	define("TOP_MARGIN_IN", 0.5);
	define("PADDING_IN", 0.10);
	
	function create_name_string($people) {
		$name_map = array();
		for ($i = 0; $i < count($people); ++$i) {
			$first_name = $people[$i]["first_name"];
			$last_name = $people[$i]["last_name"];
			if (!array_key_exists($last_name, $name_map)) {
				// If this isn't a last name we've seen already, create a new entry in the name map
				$name_map[$last_name] = array();
			}
			// Add the first name to the name map
			array_push($name_map[$last_name], $first_name);
		}
		
		// Create the individual family strings
		$family_strings = array();
		while ($first_names = current($name_map)) {
			switch (count($first_names)) {
			case 1:
				array_push($family_strings, $first_names[0] . " " . key($name_map));
				break;
				
			case 2:
				$last_name = key($name_map);
				array_push($family_strings, $first_names[0] . " and " . $first_names[1] . " " . $last_name);
				break;
				
			default:
				// Anything over 2
				$last_name = key($name_map);
				$name_string = "";
				for ($i = 0; $i < count($first_names) - 1; ++$i) {
					$name_string .= ($first_names[$i] . ", ");
				}
				$name_string .= ("and " . $first_names[count($first_names) - 1] . " " . $last_name);
				array_push($family_strings, $name_string);
				break;
			}
			
			next($name_map);
		}
		
		// Compose all of the individual family strings to get the final name string
		$name_string = "";
		switch (count($family_strings)) {
		case 1:
			$name_string = $family_strings[0];
			break;
			
		case 2:
			$name_string = $family_strings[0] . " and " . $family_strings[1];
			break;
			
		default:
			// Anything over 2
			for ($i = 0; $i < count($family_strings) - 1; ++$i) {
				$name_string .= ($family_strings[$i] . ", ");
			}
			$name_string .= ("and " . $family_strings[count($family_strings) - 1]);
			break;
		}
		
		return $name_string;
	}
	
	function create_address($party) {
		$address = array();
		array_push($address, $party["addr_house_num"] . " " . $party["addr_street"]);
		if (!is_null($party["addr_apt"])) {
			array_push($address, "#" . $party["addr_apt"]);
		}
		array_push($address, $party["addr_city"] . " " . $party["addr_state"] . " " . sprintf("%05d", $party["addr_zip"]));
		
		return $address;
	}
	
	$pdf = new FPDF("P", "in", "Letter");
	$pdf->AddFont("Astrud", "", "Astrud.php");
	$pdf->AddFont("ufonts.com_century-gothic", "", "ufonts.com_century-gothic.php");
	$pdf->SetAutoPageBreak(false);
	$pdf->SetMargins(0.125, 0.5);
	
	$pdf->AddPage();
	
	$start_x = 0.125;
	$start_y = 0.5;
	
	$x_size = 4.0;
	$y_size = 2.0;
	
	$row_sep = 0.1875;
	
	$cells_per_row = 2;
	$cells_per_col = 5;
	$cells_per_page = 10;
	
	$cell = 0;
	$page = 0;
	
	$db_conn = open_db_conn();
	
	$get_parties_query = $db_conn->prepare("CALL list_parties()");
	$get_parties_query->execute();
	$parties = $get_parties_query->fetchAll(PDO::FETCH_ASSOC);
	$get_parties_query->closeCursor();
	
	
	$name_height = NAME_SIZE_PTS * POINTS_TO_INCHES;
	$addr_height = ADDR_SIZE_PTS * POINTS_TO_INCHES;
	$people_query = $db_conn->prepare("CALL get_non_plus_ones_in_party(:party_id)");
	for ($i = 0; $i < count($parties); ++$i) {
		$people_query->bindParam(":party_id", $parties[$i]["party_id"]);
		$people_query->execute();
		$people = $people_query->fetchAll(PDO::FETCH_ASSOC);
		$people_query->closeCursor();
		
		$newpage = intdiv($cell, $cells_per_page);
		if ($newpage > $page) {
			$pdf->AddPage();
			$page = $newpage;
		}
		$page_cell = $cell - ($page * $cells_per_page);
		$row = $page_cell % $cells_per_col;
		$col = intdiv($page_cell, $cells_per_col);
	
		// Draw the name line
		$pdf->SetFont("Astrud", "", NAME_SIZE_PTS);
		$name_string = create_name_string($people);
		$name_width = $pdf->GetStringWidth($name_string);
		$name_x = $start_x + ($col * ($x_size + $row_sep)) + (($x_size - $name_width) / 2);
		$name_y = $start_y + ($row * $y_size) + TOP_MARGIN_IN;
		$pdf->setXY($name_x, $name_y);
		$pdf->write($name_height, $name_string);
		
		// Draw the address lines
		$pdf->SetFont("ufonts.com_century-gothic", "", ADDR_SIZE_PTS);
		// Determine the max address line width
		$address = create_address($parties[$i]);
		/*
		$max_addr_width = $pdf->GetStringWidth($address[0]);
		for ($j = 1; $j < count($address); ++$j) {
			$addr_line_width = $pdf->GetStringWidth($address[$j]);
			if ($addr_line_width > $max_addr_width) {
				$max_addr_width = $addr_line_width;
			}
		}
		$addr_x = $start_x + ($col * ($x_size + $row_sep)) + (($x_size - $max_addr_width) / 2);
		*/
		$pdf->SetLeftMargin($name_x);
		$addr_y = $start_y + ($row * $y_size) + TOP_MARGIN_IN + PADDING_IN + $name_height;
		$pdf->setXY($name_x, $addr_y);
		for ($j = 0; $j < count($address); ++$j) {
			$pdf->Write($addr_height, $address[$j]);
			$pdf->Ln();
		}
		
		++$cell;
	}
	
	$pdf->Output();
?>