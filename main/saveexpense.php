<?php


function createRandomPassword() {
	$chars = "003232303232023232023456789";
	srand((double)microtime()*1000000);
	$i = 0;
	$pass = '' ;
	while ($i <= 7) {

		$num = rand() % 33;

		$tmp = substr($chars, $num, 1);

		$pass = $pass . $tmp;

		$i++;

	}
	return $pass;
}
$finalcode='RS-'.createRandomPassword();

session_start();
include('../connect.php');
$a = $_POST['date'];
$b = $_POST['category'];
$c = $_POST['remarks'];
$d = $_POST['amount'];
$e = $_SESSION['BRANCH'];
$f = $_POST['pv'];
$des = 'Expenses';
$inv = $finalcode;
$sup = $_SESSION['SESS_LAST_NAME'];
$bran = $_SESSION['BRANCH'];

// query
$sql = "INSERT INTO expenselist (date,category,remark,amount,branch,description,invoice,pv) VALUES (:a,:b,:c,:d,:e,:f,:g,:h)";
$q = $db->prepare($sql);
$q->execute(array(':a'=>$a,':b'=>$b,':c'=>$c,':d'=>$d, ':e'=>$e,':f'=>$des,':g'=>$inv,':h'=>$f));

$sql2 = "INSERT INTO purchases (date,invoice_number,suplier, remarks,branch,description) VALUES (:a,:b,:c,:e,:f,:g)";
$q2 = $db->prepare($sql2);
$q2->execute(array(':a'=>$a, ':b'=>$inv, ':c'=>$sup, ':e'=>$c,':f'=>$bran,':g'=>$des));

$sql2 = "INSERT INTO purchases_item (name,qty,cost,invoice,branch,description) VALUES (:b,:c,:d,:inv,:br,:f)";
$q2 = $db->prepare($sql2);
$q2->execute(array(':b'=>$b,':c'=>$d,':d'=>$d,':inv'=>$inv,':br'=>$bran,':f'=>$des));
header("location: newexpenses.php");


?>