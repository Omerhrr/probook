<?php
session_start();
include('../connect.php');
$a = $_POST['bank_name'];
$b = $_POST['account_name'];
$c = $_POST['account_number'];
//$d = $_POST['o_balance'];
//$e = $_POST['c_balance'];
$f = $_POST['date'];

// query
$sql = "INSERT INTO bank (bank_name,account_name,account_number,date) VALUES (:a,:b,:c,:f)";
$q = $db->prepare($sql);
$q->execute(array(':a'=>$a,':b'=>$b,':c'=>$c,':f'=>$f));
header("location: admin_create_bank.php");


?>