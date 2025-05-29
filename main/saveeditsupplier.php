<?php
session_start();
// configuration
include('../connect.php');

// new data
$id = $_POST['memi'];
$a = $_POST['name'];
$b = $_POST['address'];
$c = $_POST['cperson'];
$d = $_POST['contact'];


// query
$sql = "UPDATE supliers 
        SET suplier_name=?, suplier_address=?, email=?, contact=?
		WHERE branch = '{$_SESSION['BRANCH']}' AND suplier_id=?";
$q = $db->prepare($sql);
$q->execute(array($a,$b,$c,$d,$id));
header("location: supplier.php");

?>