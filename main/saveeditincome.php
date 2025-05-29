<?php
// configuration
include('../connect.php');

// new data
$id = $_POST['memi'];
$a = $_POST['cat'];
$b = $_POST['date'];


// query
$sql = "UPDATE income 
        SET income_category=?, Date=?
		WHERE income_id=?";
$q = $db->prepare($sql);
$q->execute(array($a,$b,$id));
header("location: adminOtherIncome.php");

?>