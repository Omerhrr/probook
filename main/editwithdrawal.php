<?php
session_start();
	include('../connect.php');
	$id=$_GET['id'];
	$result = $db->prepare("SELECT * FROM withdrawal WHERE branch = '{$_SESSION['BRANCH']}'AND withdrawal_id= :userid");
	$result->bindParam(':userid', $id);
	$result->execute();
	for($i=0; $row = $result->fetch(); $i++){
?>
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<form action="saveeditwithdrawal.php" method="post">
<center><h4><i class="icon-edit icon-large"></i> Edit Withdrawal</h4></center><hr>
<div id="ac">
<input type="hidden" name="memi" value="<?php echo $id; ?>" />
<span>Bank Name : </span><select type="text" style="width:265px; height:30px;" name="bank_name">
    
<option> <?php echo $row['bank_name']; ?></option>
	<?php
	include('../connect.php');
	$results = $db->prepare("SELECT * FROM bank");
		$results->bindParam(':userid', $id);
		$results->execute();
		for($i=0; $rows = $results->fetch(); $i++){
	?>
		<option><?php echo $rows['bank_name']; ?></option>
		
	<?php
	}
	?>
</select><br>
<span>Account Number : </span><select type="text" style="width:265px; height:30px;" name="account_number">
    
<option><?php echo $row['account_number']; ?></option>
	<?php
	include('../connect.php');
	$results = $db->prepare("SELECT * FROM bank");
		$results->bindParam(':userid', $id);
		$results->execute();
		for($i=0; $rows = $results->fetch(); $i++){
	?>
		<option><?php echo $rows['account_number']; ?></option>
		
	<?php
	}
	?>
</select><br>

<span>Teller No.: </span><input type="text" style="width:265px; height:30px;" name="teller_no" value="<?php echo $row['reciept']; ?>" /><br>
<span>Date.: </span><input type="text" style="width:265px; height:30px;" name="date" value="<?php echo $row['date']; ?>" /><br>

<span>Description: </span><select type="text" style="width:265px; height:30px;" name="desc">
    
<option><?php echo $row['description']; ?></option>
	
		<option>Being Amount Transferred</option>
		<option>POS</option>
		

</select><br>
<span>Amount.: </span><input type="text" style="width:265px; height:30px;" name="amount" value="<?php echo $row['debit']; ?>" /><br>

<div style="float:right; margin-right:10px;">

<button class="btn btn-success btn-block btn-large" style="width:267px;"><i class="icon icon-save icon-large"></i> Save Changes</button>
</div>
</div>
</form>
<?php
}
?>