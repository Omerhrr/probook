<?php
session_start();
include('../connect.php');
$a = $_POST['invoice'];
$b = $_POST['product'];
$c = $_POST['qty'];
$w = $_POST['pt'];
$date = $_POST['date'];
$discount = $_POST['discount'];
$result = $db->prepare("SELECT * FROM products WHERE branch = '{$_SESSION['BRANCH']}' AND product_id= :userid");
$result->bindParam(':userid', $b);
$result->execute();
for($i=0; $row = $result->fetch(); $i++){
$asasa=$row['price'];
$oprice=$row['o_price'];
$code=$row['product_code'];
$gen=$row['gen_name'];
$name=$row['product_name'];
$p=$row['profit'];
$qty=$row['qty'];
$branch = $_SESSION['BRANCH'];

}

//edit qty
$sql = "UPDATE products 
        SET qty=qty-?
		WHERE branch = '{$_SESSION['BRANCH']}' AND product_id=?";
$q = $db->prepare($sql);
$q->execute(array($c,$b));
$fffffff=$asasa-$discount;
$d=$fffffff*$c;
$profit=$p*$c;

$sssssss=$oprice-$discount;
$cost=$sssssss*$c;
$ppppp=$j*$c;
// query


$sql = "INSERT INTO sales_order (invoice,product,qty,amount,name,price,profit,product_code,gen_name,date,branch,o_price,cost) VALUES (:a,:b,:c,:d,:e,:f,:h,:i,:j,:k, :l,:m,:n)";


    $q = $db->prepare($sql);

    $q->execute(array(':a'=>$a,':b'=>$b,':c'=>$c,':d'=>$d,':e'=>$name,':f'=>$asasa,':h'=>$profit,':i'=>$code,':j'=>$gen,':k'=>$date, ':l'=>$branch,':m'=>$oprice,':n'=>$cost));
    header("location: sales.php?id=$w&invoice=$a&date=$date");


?>