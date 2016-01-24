<?php
	require("fpdf/fpdf.php");
	require("create_db_conn.php");
	
	$pdf = new FPDF("P", "in", "Letter");
	$pdf->AddFont("Astrud", "", "Astrud.php");
	$pdf->AddFont("ufonts.com_century-gothic", "", "ufonts.com_century-gothic.php");
	$pdf->SetAutoPageBreak(false);
	$pdf->SetMargins(0.25, 0.5625);
	
	$pdf->AddPage();
	
	
	$codes = array("3ZRCT5L5", "V9K4NFKP", "F4RUH3CX", "PE99XUGV", "7RAA842U", "TSVULCL7", "W8J9TQ34", "49Z6SJD8", "ULLK3EC7", "2DXRNWWQ", "PFXB3X33", "2BSGC6VH", "K7APZR9J", "TBBY545M", "GXXR2UDP", "EP242HFK", "B5BPXTW7", "HAB7G93W", "R7PE4BJR", "FJ8KKCBD", "ACZDZP3Z", "EKH2FNJD", "7MZLG2CH", "6ERVQJUA", "PPSFDAJV", "RGABLEJW", "JJ65C52Q", "3B6FKAUB", "VQSZTZZ8", "3ZHFCKE9", "V9KYR97J", "25PTMJJZ", "6H4C9Z3Z", "D62C6UTT", "UVB4G8W6", "2Q37LUAA", "BLLB96WG", "URY895AA", "P6TNEMLJ", "QAPC92JF", "F5XBA9Z7", "Q3PPWR56", "4XSWBBY7", "DXFTMAXV", "3JYHCKXK", "KDXQ7AA2", "NJ7MPYWC", "GWQ9DYMF", "DM2CZWGJ", "GVHQWH5H", "WE6TAMSK", "KCFJPR9N", "4C48VR7F", "SP2J685S", "ACE7NM2C", "LEMXES7T", "AVEDQQ3V", "UDESHXN3", "3AEZM4Z2", "WUWFC4JC", "L8BUXGHD");
	
	$start_x = 0.25;
	$start_y = 0.5625;
	
	$x_size = 1.75;
	$y_size = 0.66;
	
	$row_sep = 0.3125;
	
	$cells_per_row = 15;
	$cells_per_col = 4;
	$cells_per_page = 60;
	
	$cell = 0;
	$page = 0;
	
	for ($cell = 0; $cell < count($codes); ++$cell) {
		$newpage = intdiv($cell, $cells_per_page);
		if ($newpage > $page) {
			$pdf->AddPage();
			$page = $newpage;
		}
		$page_cell = $cell - ($page * $cells_per_page);
		$row = $page_cell % 15;
		$col = intdiv($page_cell, 15);
		
		// Draw the party id
		$pdf->SetFont("ufonts.com_century-gothic", "", 8);
		$pdf->setXY(($col * ($x_size + $row_sep)), $start_y + ($row * $y_size));
		$pdf->cell(0.25, 0.66, $cell + 1, 0, 0, "C", false);
		
		// Draw the code
		$pdf->SetFont("ufonts.com_century-gothic", "", 16);
		$pdf->setXY($start_x + ($col * ($x_size + $row_sep)), $start_y + ($row * $y_size));
		$pdf->cell($x_size, $y_size, $codes[$cell], 0, 0, "C", false);
	}
	
	$pdf->Output();
?>