<?php
session_start();
include('../connect.php');
$a = $_POST['invoice'];

$branch = $_SESSION['BRANCH'];
$f = 'purchases';
$ff = $_POST['cash'];
$sname = $_POST['sname'];
$date = $_POST['date'];


$d=$_POST['amount'];
$balance = $d - $ff;

$iv= $_GET['iv'];

$sqls = "INSERT INTO s_ledger (date,name,invoice,credit,debit,credit_balance,branch) VALUES (:dates,:name,:invoice,:credit,:debit,:balance,:branch)";
$qs = $db->prepare($sqls);
$qs->execute(array(':dates'=>$date,':name'=>$sname,':invoice'=>$a,':credit'=>$d,':debit'=>$ff,':balance'=>$balance,':branch'=>$branch));
//header("location: preview.php?invoice=$a");
header("location:  previe.php?invoice=$a&cash=$ff");


?>