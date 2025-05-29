<?php
session_start();
include('../connect.php');
$a = $_POST['name'];
$b = $_POST['gen'];
$c = $_POST['email'];
$d = $_POST['contact'];
$e = $_POST['address'];

$g = $_POST['role'];
$h = $_POST['branch'];

// query
$sql = "INSERT INTO employee (FULLNAME,GENDER,EMAIL,CONTACT,ADDRESS,ROLE,branch) VALUES (:a,:b,:c,:d,:e,:g,:h)";
$q = $db->prepare($sql);
$q->execute(array(':a'=>$a,':b'=>$b,':c'=>$c,':d'=>$d,':e'=>$e,':g'=>$g,':h'=>$h));
header("location: employee.php");


?>