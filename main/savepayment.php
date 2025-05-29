<?php
session_start();
include('../connect.php');
$a = date("m/d/Y");
$b = $_POST['name'];
$c = $_POST['invoice'];
$d = $_POST['tot'];
$o ='';

$e = $_POST['amount'];
//$f = $_POST['remarks'];

$g = $_SESSION['BRANCH'];

// $results = $db->prepare("SELECT sum(amount) FROM c_ledger WHERE branch = '{$_SESSION['BRANCH']}' AND name= :a");
// $results->bindParam(':a', $b);
// $results->execute();
// for($i=0; $rows = $results->fetch(); $i++){
// $sdsdd=$rows['sum(amount)'];
// if($sdsdd==''){
// $dsdsd=0;
// }
// if($sdsdd!=''){
// $dsdsd=$rows['sum(amount)'];
// }
// }				
// $b1=$d-$dsdsd;
$balance= '';

$sql = "INSERT INTO s_ledger (date,name,invoice,credit,debit,credit_balance,branch) VALUES (:dates,:name,:invoice,:credit,:debit,:credit_balance,:branch)";
$q = $db->prepare($sql);
$q->execute(array(':dates'=>$a,':name'=>$b,':invoice'=>$c,':credit'=>$e,':debit'=>$o,':credit_balance'=>$balance,'branch'=>$g));

// $sqla = "UPDATE sales 
//         SET balance=?, due_date=?
// 		WHERE branch = '{$_SESSION['BRANCH']}' AND invoice_number=?";
// $qa = $db->prepare($sqla);
// $qa->execute(array($balance,$f,$b));


header("location: customer_ledger.php?cname=$b");

?>