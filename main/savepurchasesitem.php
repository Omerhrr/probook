<?php
session_start();
include('../connect.php');
$a = $_POST['invoice'];
$b = $_POST['product'];
$c = $_POST['qty'];
$e = $_SESSION['BRANCH'];
$f = 'purchases';
$date = $_POST['date'];
$result = $db->prepare("SELECT * FROM products WHERE product_code= :userid AND branch = '{$_SESSION['BRANCH']}' ");
$result->bindParam(':userid', $b);
$result->execute();
for($i=0; $row = $result->fetch(); $i++){
$asasa=$row['o_price'];
}

//edit qty
$sql = "UPDATE products 
        SET qty=qty+?
		WHERE branch = '{$_SESSION['BRANCH']}' AND product_code=?";
$q = $db->prepare($sql);
$q->execute(array($c,$b));

$d=$c * $asasa;
$balance = $d - $ff;
// query
if ($c == ""){
	header("location:  purchasesportal.php?iv=$a");
}

elseif ($b == ""){
	header("location:  purchasesportal.php?iv=$a");
}
else{
$sql = "INSERT INTO purchases_item  (name,qty,cost,invoice,branch,description) VALUES (:b,:c,:d,:a,:e,:f)";
$q = $db->prepare($sql);
$q->execute(array(':b'=>$b,':c'=>$c,':d'=>$d,':a'=>$a,'e'=>$e, 'f'=>$f));
header("location:  purchasesportal.php?iv=$a");



}
?>