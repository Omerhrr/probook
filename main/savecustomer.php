<?php
session_start();
include('../connect.php');
$a = $_POST['name'];
$b = $_POST['address'];
$c = $_POST['email'];
$d = $_POST['contact'];
$e = $_SESSION['BRANCH'];

$sql = "INSERT INTO customer (customer_name,address,email,contact, branch) VALUES (:a,:b,:c,:d, :e)";
$q = $db->prepare($sql);
$q->execute(array(':a'=>$a,':b'=>$b,':c'=>$c,':d'=>$d, ':e'=>$e));
header("location: customer.php");


?>