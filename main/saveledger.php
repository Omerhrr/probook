<?php
session_start();
include('../connect.php');
$a = $_POST['date'];
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

$sql = "INSERT INTO c_ledger (date,name,invoice,debit,credit,debit_balance,branch) VALUES (:dates,:name,:invoice,:debit,:credit,:debit_balance,:branch)";
$q = $db->prepare($sql);
$q->execute(array(':dates'=>$a,':name'=>$b,':invoice'=>$c,':debit'=>$o,':credit'=>$e,':debit_balance'=>$balance,'branch'=>$g));

// $sqla = "UPDATE sales 
//         SET balance=?, due_date=?
// 		WHERE branch = '{$_SESSION['BRANCH']}' AND invoice_number=?";
// $qa = $db->prepare($sqla);
// $qa->execute(array($balance,$f,$b));


header("location: customer_ledger.php?cname=$b");

?>