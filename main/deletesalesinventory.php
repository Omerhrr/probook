<?php
session_start();
	include('../connect.php');
	$id=$_GET['id'];
	$qty=$_GET['qty'];
	$wapak=$_GET['code'];
	
// $resultss = $db->prepare("SELECT * FROM sales WHERE branch = '{$_SESSION['BRANCH']}'");

// $resultss->execute();
// for($i=0; $row = $resultss->fetch(); $i++){
// $asasa=$row['invoice_number'];
// }
	
	$result = $db->prepare("SELECT * FROM products WHERE branch = '{$_SESSION['BRANCH']}' AND product_code= :userid");
$result->bindParam(':userid', $b);
$result->execute();
for($i=0; $row = $result->fetch(); $i++){

}

	$sql = "UPDATE products 
        SET qty=qty+?
		WHERE product_id=?";
		$q = $db->prepare($sql);
	$q->execute(array($qty,$wapak));

	$iv=$_GET['iv'];
	$result = $db->prepare("DELETE FROM sales_order WHERE branch = '{$_SESSION['BRANCH']}' AND invoice= :id");
	$result->bindParam(':id', $iv);
	$result->execute();

	$resultss = $db->prepare("DELETE FROM sales WHERE branch = '{$_SESSION['BRANCH']}' AND invoice_number= :id");
	$resultss->bindParam(':id', $iv);
	$resultss->execute();

	$resultsss = $db->prepare("DELETE FROM c_ledger WHERE branch = '{$_SESSION['BRANCH']}' AND invoice= :memid");
	$resultsss->bindParam(':memid', $iv);
	$resultsss->execute();
		header("location: sales_inventory.php");
?>