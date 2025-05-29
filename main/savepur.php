<?php
session_start();
include('../connect.php');
$a = $_POST['iv'];
$b = $_POST['date'];
$c = $_POST['supplier'];
$d = $_POST['remarks'];
$e = $_SESSION['BRANCH'];
$f = 'purchases';
// query
$sql = "INSERT INTO purchases (invoice_number,date,suplier,remarks,branch,description) VALUES (:a,:b,:c,:d,:e,:f)";
$q = $db->prepare($sql);
$q->execute(array(':a'=>$a,':b'=>$b,':c'=>$c,':d'=>$d, ':e'=>$e, ':f'=>$f));
header("location: purchasesportal.php?iv=$a");


?>