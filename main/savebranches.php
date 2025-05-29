<?php
session_start();
include('../connect.php');
$a = $_POST['branch'];
$b = $_POST['branch-address'];
$c = $_POST['branch-motto'];


// query
$sql = "INSERT INTO branch (branch,branch_address,branch_motto) VALUES (:a,:b,:c)";
$q = $db->prepare($sql);
$q->execute(array(':a'=>$a,':b'=>$b,':c'=>$c));
header("location: branches.php");


?>