<?php
session_start();
include('../connect.php');
$a = $_POST['cat'];
$b = $_POST['date'];
//$c = $_POST['contact'];
//$d = $_POST['cperson'];

// query
$sql = "INSERT INTO expenses (Expenses_category,Date) VALUES (:a,:b)";
$q = $db->prepare($sql);
$q->execute(array(':a'=>$a,':b'=>$b));
header("location: admin_create_expenses.php");


?>