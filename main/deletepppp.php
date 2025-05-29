<?php
session_start();
	include('../connect.php');
	$id=$_GET['id'];
	$iv = $_GET['id'];

	$resultss = $db->prepare("SELECT * FROM purchases_item WHERE branch = '{$_SESSION['BRANCH']}' AND invoice ='{$iv}'");

$resultss->execute();
for($i=0; $row = $resultss->fetch(); $i++){
$asasa=$row['invoice'];
$qty=$row['qty'];
$wapak=$row['name'];
}

$sql = "UPDATE products 
			SET qty=qty-?
			WHERE branch = '{$_SESSION['BRANCH']}' AND product_code=?";
	$q = $db->prepare($sql);
	$q->execute(array($qty,$wapak));

	$result = $db->prepare("DELETE FROM purchases WHERE branch = '{$_SESSION['BRANCH']}' AND invoice_number= :memid");
	$result->bindParam(':memid', $iv);
	$result->execute();

	$results = $db->prepare("DELETE FROM purchases_item WHERE branch = '{$_SESSION['BRANCH']}' AND invoice= :memid");
	$results->bindParam(':memid', $iv);
	$results->execute();

	

	$resultsss = $db->prepare("DELETE FROM s_ledger WHERE branch = '{$_SESSION['BRANCH']}' AND invoice= :memid");
	$resultsss->bindParam(':memid', $iv);
	$resultsss->execute();

	header("location: purchaseslist.php");


	
?>