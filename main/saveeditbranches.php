<?php
// configuration
include('../connect.php');

// new data
$id = $_POST['memi'];
$a = $_POST['branch'];
$b = $_POST['branch-address'];
$c = $_POST['branch-motto'];


// query
$sql = "UPDATE branch 
        SET branch=?, branch_address=?, branch_motto=?
		WHERE branch_id=?";
$q = $db->prepare($sql);
$q->execute(array($a,$b,$c,$id));



$sql1 = "UPDATE sales_order 
        SET branch=?
		WHERE branch=?";
$q1 = $db->prepare($sql1);
$q1->execute(array($a,$a));
































header("location: branches.php");

?>