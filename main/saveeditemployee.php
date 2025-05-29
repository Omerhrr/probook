<?php
session_start();
// configuration
include('../connect.php');

// new data

$a = $_POST['name'];
$b = $_POST['gen'];
$c = $_POST['email'];
$d = $_POST['contact'];
$e = $_POST['address'];
$g = $_POST['role'];
$h = $_POST['branch'];
$id =$_POST['memi'];
// query
$sql = "UPDATE employee 
        SET FULLNAME=?, GENDER=?, EMAIL=?, CONTACT=?, ADDRESS=?, ROLE=?, branch=?
		WHERE EMPLOYEE_ID=?";
$q = $db->prepare($sql);
$q->execute(array($a,$b,$c,$d,$e,$g,$h,$id));
header("location: employee.php");

?>