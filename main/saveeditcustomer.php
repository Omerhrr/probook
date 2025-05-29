<?php
session_start();
// configuration
include('../connect.php');

// new data
$id = $_POST['memi'];
$a = $_POST['name'];
$b = $_POST['address'];
$c = $_POST['email'];
$d = $_POST['contact'];

// query
$sql = "UPDATE customer 
        SET customer_name=?, address=?, email=?, contact=?
		WHERE branch = '{$_SESSION['BRANCH']}' AND customer_id=?";
$q = $db->prepare($sql);
$q->execute(array($a,$b,$c,$d,$id));
header("location: customer.php");

?>