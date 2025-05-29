<?php
session_start();
	include('../connect.php');
	$id=$_GET['id'];
	$result = $db->prepare("DELETE FROM customer WHERE branch = '{$_SESSION['BRANCH']}' AND customer_id= :memid");
	$result->bindParam(':memid', $id);
	$result->execute();
?>