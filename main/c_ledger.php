<?php
session_start();
include('../connect.php');
$a = date("Y-m-d");
$b = $_POST['name'];
$c = $_POST['invoice'];
$d = $_POST['tot'];

$e = $_POST['amount'];
//$f = $_POST['remarks'];

$g = $_SESSION['BRANCH'];

$results = $db->prepare("SELECT sum(amount) FROM c_ledger WHERE branch = '{$_SESSION['BRANCH']}' AND name= :a");
$results->bindParam(':a', $b);
$results->execute();
for($i=0; $rows = $results->fetch(); $i++){
$sdsdd=$rows['sum(amount)'];
if($sdsdd==''){
$dsdsd=0;
}
if($sdsdd!=''){
$dsdsd=$rows['sum(amount)'];
}
}				
$b1=$d-$dsdsd;
$balance=$b1-$e;

$sql = "INSERT INTO collection (date,name,invoice,amount,remarks,balance,branch) VALUES (:k,:l,:m,:n,:o,:p,:g)";
$q = $db->prepare($sql);
$q->execute(array(':k'=>$a,':l'=>$b,':m'=>$c,':n'=>$e,':o'=>$f,':p'=>$balance,'g'=>$g));

// $sqla = "UPDATE sales 
//         SET balance=?, due_date=?
// 		WHERE branch = '{$_SESSION['BRANCH']}' AND invoice_number=?";
// $qa = $db->prepare($sqla);
// $qa->execute(array($balance,$f,$b));


header("location: customer_ledger.php?cname=$b");

?>