<?php
session_start();
// configuration
include('../connect.php');

// new data
$id = $_POST['memi'];
$customer = $_POST['customer'];


$c = $_POST['tid'];
$d = $_POST['dates'];
$e = $_POST['invoice'];
$f = $_POST['debit'];
$g = $_POST['credit'];
$h = $_POST['d_bal'];


// query
$sql = "UPDATE c_ledger 
        SET transaction_id=?, date=?, name=?,  debit=?, credit=?, debit_balance=?
		WHERE branch = '{$_SESSION['BRANCH']}' AND invoice=?";
$q = $db->prepare($sql);
$q->execute(array($c,$d,$customer,$f,$g,$h,$id));
header("location: customer_ledger.php?cname=$customer");

?>