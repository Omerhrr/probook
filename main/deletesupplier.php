<?php
session_start();
	include('../connect.php');
	$id=$_GET['id'];
	$result = $db->prepare("DELETE FROM supliers WHERE branch = '{$_SESSION['BRANCH']}' AND suplier_id= :memid");
	$result->bindParam(':memid', $id);
	$result->execute();
?>