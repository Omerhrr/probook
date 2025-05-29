<?php
session_start();
	include('../connect.php');
	$id=$_GET['id'];
	$result = $db->prepare("DELETE FROM employee WHERE EMPLOYEE_ID= :memid");
	$result->bindParam(':memid', $id);
	$result->execute();
?>s