<?php
session_start();
	include('../connect.php');
	$id=$_GET['id'];
	$result = $db->prepare("DELETE FROM expenselist WHERE invoice= :memid");
	$result->bindParam(':memid', $id);
	$result->execute();

	$results = $db->prepare("DELETE FROM purchases_item WHERE branch = '{$_SESSION['BRANCH']}' AND invoice= :memid");
	$results->bindParam(':memid', $id);
	$results->execute();
?>