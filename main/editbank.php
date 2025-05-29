<?php
	include('../connect.php');
	$id=$_GET['id'];
	$result = $db->prepare("SELECT * FROM bank WHERE bank_id= :userid");
	$result->bindParam(':userid', $id);
	$result->execute();
	for($i=0; $row = $result->fetch(); $i++){
?>
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<form action="saveeditbank.php" method="post">
<center><h4><i class="icon-edit icon-large"></i> Edit Bank Account</h4></center><hr>
<div id="ac">
<input type="hidden" name="memi" value="<?php echo $id; ?>" />
<span>Bank Name: </span><input type="text" style="width:265px; height:30px;" name="bank_name" value="<?php echo $row['bank_name']; ?>" /><br>

<span>Account Name: </span><input type="text" style="width:265px; height:30px;" name="account_name" value="<?php echo $row['account_name']; ?>" /><br>

<span>Account Number: </span><input type="text" style="width:265px; height:30px;" name="account_number" value="<?php echo $row['account_number']; ?>" /><br>

<span>Date : </span><input type="text" style="width:265px; height:30px;" name="date" value="<?php echo $row['date']; ?>" /><br>

<div style="float:right; margin-right:10px;">

<button class="btn btn-success btn-block btn-large" style="width:267px;"><i class="icon icon-save icon-large"></i> Save Changes</button>
</div>
</div>
</form>
<?php
}
?>