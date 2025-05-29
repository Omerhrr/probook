<?php
session_start();
include('../connect.php');

$a = $_POST['uname'];
$b = $_POST['passw'];
$c = $_POST['fname'];
$d = $_POST['role'];
$e = $_POST['branch'];


// query
$sql = "INSERT INTO user (username,password,name,position,branch) VALUES (:a,:b,:c,:d,:e)";
$q = $db->prepare($sql);
$q->execute(array(':a'=>$a,':b'=>$b,':c'=>$c,':d'=>$d,':e'=>$e));
header("location: accounts.php");


?>