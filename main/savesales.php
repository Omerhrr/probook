<?php
session_start();
include('../connect.php');
$a = $_POST['invoice'];
$b = $_POST['cashier'];
$c = $_POST['date'];
$d = $_POST['ptype'];
$e = $_POST['amount'];
$z = $_POST['profit'];
$cname = $_POST['cname'];
$h = $_SESSION['BRANCH'];
$i = 'Sales';
$f = $_POST['cash'];
$balance = $e - $f;


$sql = "INSERT INTO sales (invoice_number,cashier,date,type,amount,profit,due_date,name,branch,description) VALUES (:a,:b,:c,:d,:e,:z,:f,:g,:h,:i)";
$q = $db->prepare($sql);
$q->execute(array(':a'=>$a,':b'=>$b,':c'=>$c,':d'=>$d,':e'=>$e,':z'=>$z,':f'=>$f,':g'=>$cname,'h'=>$h,'i'=>$i));

$sqls = "INSERT INTO c_ledger (date,name,invoice,debit,credit,debit_balance,branch) VALUES (:dates,:name,:invoice,:debit,:credit,:balance,:branch)";
$qs = $db->prepare($sqls);
$qs->execute(array(':dates'=>$c,':name'=>$cname,':invoice'=>$a,':debit'=>$e,':credit'=>$f,':balance'=>$balance,':branch'=>$h));






header("location: preview.php?invoice=$a");
//exit();


// query



?>