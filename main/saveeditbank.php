<?php
// configuration
include('../connect.php');

$id = $_POST['memi'];
$a = $_POST['bank_name'];
$b = $_POST['account_name'];
$c = $_POST['account_number'];
$d = $_POST['o_balance'];
$e = $_POST['c_balance'];
$f = $_POST['date'];


// query
$sql = "UPDATE bank 
        SET bank_name=?, account_name=?,account_number=?, date=?
		WHERE bank_id=?";
$q = $db->prepare($sql);
$q->execute(array($a,$b,$c,$f,$id));
header("location: admin_create_bank.php");

?>