<?php
session_start();
// configuration
include('../connect.php');

// new data
$id = $_POST['memi'];
$suplier = $_POST['supplier'];


$c = $_POST['tid'];
$d = $_POST['dates'];
$e = $_POST['invoice'];
$f = $_POST['debit'];
$g = $_POST['credit'];
$h = $_POST['c_bal'];


// query
$sql = "UPDATE s_ledger 
        SET transaction_id=?, date=?, name=?,  credit=?, debit=?, credit_balance=?
		WHERE branch = '{$_SESSION['BRANCH']}' AND invoice=?";
$q = $db->prepare($sql);
$q->execute(array($c,$d,$suplier,$g,$f,$h,$id));
header("location: supplier_ledger.php?sname=$suplier");

?>