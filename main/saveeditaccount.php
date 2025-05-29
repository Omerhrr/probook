<?php
session_start();
include('../connect.php');

$id = $_POST[memi];
$a = $_POST['uname'];
$b = $_POST['passw'];
$c = $_POST['fname'];
$d = $_POST['role'];
$e = $_POST['branch'];


// query
$sql = "UPDATE user 
        SET username=?, password=?, name=?, position=?, branch=?
		WHERE id=?";
$q = $db->prepare($sql);
$q->execute(array($a,$b,$c,$d,$e,$id));
header("location: accounts.php");

?>