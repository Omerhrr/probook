<?php
// configuration
include('../connect.php');

// new data
$id = $_POST['memi'];
$a = $_POST['cat'];
$b = $_POST['date'];


// query
$sql = "UPDATE expenses 
        SET Expenses_category=?, Date=?
		WHERE Expenses_id=?";
$q = $db->prepare($sql);
$q->execute(array($a,$b,$id));
header("location: admin_create_expenses.php");

?>