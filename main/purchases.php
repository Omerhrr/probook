
<?php
	require_once('auth.php');
?>
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<form action="savepur.php" method="post">
<center><h4><i class="icon-plus-sign icon-large"></i> Add Purchase</h4></center>
<hr>
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
?>
<div style="text-align:left;">
<div id="ac">
<span>Date: <br></span><input style="width:265px; height:30px;" name="date" placeholder="YYYY-MM-DD" value="<?php echo date("Y-m-d"); ?>" /><br>
<span>Invoice Number: </span><input type="text" style="width:265px; height:30px;" name="iv" value="<?php echo $finalcode;?>" /><br>
<span>Supplier:</span>
<select name="supplier" style="width:260px; height:30px;">
	<option></option>
<?php
	include('../connect.php');
	$result = $db->prepare("SELECT * FROM supliers WHERE branch = '{$_SESSION['BRANCH']}'");
		$result->bindParam(':userid', $res);
		$result->execute();
		for($i=0; $row = $result->fetch(); $i++){
	?>
		<option><?php echo $row['suplier_name']; ?></option>
	<?php
	}
	?>
</select><br>
<span>Remarks:<br> </span><input type="text" style="width:265px; height:30px;" name="remarks" /><br>
<span>&nbsp;</span><input id="btn" type="submit" value="save" />
</div>
</div>
</form>