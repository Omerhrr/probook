<?php
session_start();
	include('../connect.php');
	$id=$_GET['tid'];
	$debit=$_GET['debit'];
	


if($id and $debit){

$results = $db->prepare("DELETE FROM c_ledger WHERE branch = '{$_SESSION['BRANCH']}' AND transaction_id= :memid");
	$results->bindParam(':memid', $id);
	$results->execute();

	header("location: customer_ledger.php?cname=");

}else{
	header("location: customer_ledger.php?cname=");

}
	
?>