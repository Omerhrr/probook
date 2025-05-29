<?php
session_start();
	include('../connect.php');
	$id=$_GET['id'];
	$result = $db->prepare("DELETE FROM products WHERE branch = '{$_SESSION['BRANCH']}' AND product_id= :memid");
	$result->bindParam(':memid', $id);
	$result->execute();
?>