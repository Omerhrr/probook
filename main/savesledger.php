<?php
session_start();
include('../connect.php');
$a = $_POST['date'];
$b = $_POST['name'];
$c = $_POST['invoice'];
$d = $_POST['tot'];
$o ='';

$e = $_POST['amount'];
//$f = $_POST['remarks'];

$g = $_SESSION['BRANCH'];


$balance= '';

$sql = "INSERT INTO s_ledger (date,name,invoice,credit,debit,credit_balance,branch) VALUES (:dates,:name,:invoice,:credit,:debit,:credit_balance,:branch)";
$q = $db->prepare($sql);
$q->execute(array(':dates'=>$a,':name'=>$b,':invoice'=>$c,':credit'=>$o,':debit'=>$e,':credit_balance'=>$balance,'branch'=>$g));


header("location:  supplier_ledger.php?sname=$b");


?>