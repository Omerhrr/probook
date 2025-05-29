<?php
// configuration
include('../connect.php');

// new data
$id = $_POST['memi'];
$a = $_POST['category'];
$b = $_POST['date'];
$c = $_POST['vendor'];
$d = $_POST['remark'];
$e= $_POST['amount'];
$f= $_POST['pv'];


// query
$sql = "UPDATE expenselist
        SET date=?, category=?,remark=?,amount=?,pv=?
		WHERE expenselist_id=?";
$q = $db->prepare($sql);
$q->execute(array($b,$a,$d,$e,$f,$id));
header("location: newexpenses.php");

?>