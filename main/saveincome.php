<?php

session_start();
include '../connect.php';
$a = $_POST['cat'];
$b = $_POST['date'];
//$c = $_POST['contact'];
//$d = $_POST['cperson'];
// query
$sql = "INSERT INTO income (income_category,Date) VALUES (:a,:b)";
$q = $db->prepare($sql);
$q->execute(array(':a' => $a, ':b' => $b));
header("location: adminOtherIncome.php");