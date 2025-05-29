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
$a = $_POST['account_number'];
$b = $_POST['dates'];
$c = $_POST['desc'];
$dd = $_POST['amount'];
$inv = $_POST['teller'];
$branch = $_SESSION['BRANCH'];

$result = $db->prepare("SELECT * FROM bank WHERE  account_number ='{$a}' ");
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){

$bank_name =$row['bank_name'];
$account_name =$row['account_name'];
$account_number =$row['account_number'];
//$o_balance =$row['opening_balance'];
//$c_balance =$row['closing_balance'];
$dates = $row['date'];
$id = $row['bank_id'];
#$d = $_POST['amount'];
					
$debit =0;

}


// query
$sql = "INSERT INTO withdrawal (bank_name,account_name,account_number,date,description,debit,credit,branch,reciept) VALUES (:a,:b,:c,:d,:e,:f,:debit,:g,:h)";
$q = $db->prepare($sql);
$q->execute(array(':a'=>$bank_name,':b'=>$account_name,':c'=>$account_number,':d'=>$b, ':e'=>$c,':debit'=>$debit,':f'=>$dd,':g'=>$branch,':h'=>$inv));




$sqls = "UPDATE bank 
        SET bank_id=?,bank_name=?, account_name=?, date=?
		WHERE  account_number=?";
$qs = $db->prepare($sqls);
$qs->execute(array($id,$bank_name,$account_name,$dates,$account_number));

header("location: withdrawal.php");


?>