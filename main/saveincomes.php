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
$des = 'Other Incomes';
$inv = $finalcode;
$sup = $_SESSION['SESS_LAST_NAME'];
$bran = $_SESSION['BRANCH'];

// query
$sql = "INSERT INTO incomelist (date,category,remark,amount,branch,description,invoice) VALUES (:a,:b,:c,:d,:e,:f,:g)";
$q = $db->prepare($sql);
$q->execute(array(':a'=>$a,':b'=>$b,':c'=>$c,':d'=>$d, ':e'=>$e,':f'=>$des,':g'=>$inv));


header("location: newincome.php");


?>