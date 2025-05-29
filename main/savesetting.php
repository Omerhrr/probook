<?php
session_start();
// configuration
include('../connect.php');

// new data;



$id = $_POST['id'];


$a = $_POST['name'];
$b = $_POST['email'];
$c = $_POST['address'];
$d = $_POST['contact'];
$e = $_POST['motto'];

// query
$sql = "UPDATE settings 
        SET CompanyName=?, CompanyEmail=?, CompanyAddress=?, CompanyContact=?, CompanyMotto=?
		WHERE  id=2";
$q = $db->prepare($sql);
$q->execute(array($a,$b,$c,$d,$e));
header("location: setting.php");



?>