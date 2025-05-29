
<?php
session_start();
// configuration
include('../connect.php');

// new data
$id = $_POST['memi'];
$a = $_POST['bank_name'];
$b = $_POST['account_number'];
$c = $_POST['teller_no'];
$d = $_POST['date'];
$e = $_POST['desc'];
$f = $_POST['amount'];




// query
$sql = "UPDATE withdrawal 
        SET bank_name=?, account_number=?,date=?,description=?,debit=?,reciept=?
		WHERE withdrawal_id=? AND branch = '{$_SESSION['BRANCH']}'  ";
$q = $db->prepare($sql);
$q->execute(array($a,$b,$d,$e,$f,$c,$id));
header("location: withdrawal.php");

?>