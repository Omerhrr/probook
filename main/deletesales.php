<?php
session_start();
	include('../connect.php');
	$id=$_GET['id'];
	$result = $db->prepare("DELETE FROM sales WHERE branch = '{$_SESSION['BRANCH']}' AND transaction_id= :memid");
	$result->bindParam(':memid', $id);
	$result->execute();
?>