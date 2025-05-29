<?php
session_start();
	include('../connect.php');
	$id=$_GET['tid'];
	$debit=$_GET['debit'];
	


if($id and $debit){

$results = $db->prepare("DELETE FROM s_ledger WHERE branch = '{$_SESSION['BRANCH']}' AND transaction_id= :memid");
	$results->bindParam(':memid', $id);
	$results->execute();

	header("location: supplier_ledger.php?sname=");

}else{
	header("location: supplier_ledger.php?sname=");
}
	
?>