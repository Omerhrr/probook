<?php
session_start();
	include('../connect.php');
	$id=$_GET['id'];
	$result = $db->prepare("DELETE FROM bank WHERE bank_id= :memid");
	$result->bindParam(':memid', $id);
	$result->execute();
?>