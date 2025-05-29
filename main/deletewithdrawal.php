<?php
session_start();	
include('../connect.php');
$id=$_GET['account_number'];
$wid =$_GET['wid'];	
$debit = $_GET['debit'];


$results = $db->prepare("SELECT * FROM bank WHERE  account_number ='{$id}' ");
$resultss = $db->prepare("SELECT debit FROM withdrawal WHERE branch = '{$_SESSION['BRANCH']}' AND  account_number ='{$id}' and withdrawal_id ='{$wid}' ");
$resultss->execute();
$results->execute();
for($i=0; $row = $results->fetch(),$rows = $resultss->fetch(); $i++){
	$bank_name =$row['bank_name'];
$account_name =$row['account_name'];
$account_number =$row['account_number'];
//$o_balance =$row['opening_balance'];
//$c_balance =$row['closing_balance'];
$dates = $row['date'];
$bid = $row['bank_id'];
}

?>

<?php

//$d =$rows['debit'];					




$sqls = "UPDATE bank 
        SET bank_id=?,bank_name=?, account_name=?, date=?
		WHERE  account_number=?";
$qs = $db->prepare($sqls);
$qs->execute(array($bid,$bank_name,$account_name,$dates,$account_number));


	
$result = $db->prepare("DELETE FROM withdrawal WHERE branch = '{$_SESSION['BRANCH']}' AND account_number= :memid and withdrawal_id ='{$wid}'");
$result->bindParam(':memid', $id);
$result->execute();

header("location:  withdrawal.php");
?>