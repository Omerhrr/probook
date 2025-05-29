<?php
session_start();
	include('../connect.php');
	$id=$_GET['iv'];
	$result = $db->prepare("SELECT * FROM s_ledger WHERE branch = '{$_SESSION['BRANCH']}' AND invoice= :userid");
	$result->bindParam(':userid', $id);
	$result->execute();
	for($i=0; $row = $result->fetch(); $i++){
?>
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<form action="savesupplier_journals.php" method="post">
<center><h4><i class="icon-edit icon-large"></i>Issueing a Journal</h4></center>
<hr>
<div id="ac">
<input type="hidden" name="memi" value="<?php echo $id; ?>" />

<span>Reciept No. :</span><input type	="text" style="width:265px; height:30px;" name="invoice" value="<?php echo $row['invoice']; ?>" /><br>
<p>Swap <?php echo $row['invoice'];?> To.....</p>
<span>Vendor:</span>
<select name="supplier" style="width:265px; height:30px; margin-left:-5px;" >
	<option></option>
	<?php
	$results = $db->prepare("SELECT * FROM supliers WHERE branch = '{$_SESSION['BRANCH']}'");
		
		$results->execute();
		for($i=0; $rows = $results->fetch(); $i++){
	?>
		<option><?php echo $rows['suplier_name']; ?></option>
	<?php
	}
	?>
</select><br>
<input type="hidden" style="width:265px; height:30px;" name="name" value="<?php echo $row['name']; ?>" /><br>


<input type="hidden" style="width:265px; height:30px;"  name="tid" value="<?php echo $row['transaction_id']; ?>" Required/>
<input type="hidden" style="width:265px; height:30px;"  name="dates" value="<?php echo $row['date']; ?>" />

<input type	="hidden" style="width:265px; height:30px;" name="invoice" value="<?php echo $row['invoice']; ?>" /><br>
<input type="hidden" style="width:265px; height:30px;"  name="credit" value="<?php echo $row['credit']; ?>" Required/>
<input type="hidden" style="width:265px; height:30px;"  name="debit" value="<?php echo $row['debit']; ?>" />

<input type	="hidden" style="width:265px; height:30px;" name="c_bal" value="<?php echo $row['credit_balance']; ?>" /><br>


<div style="float:right; margin-right:10px;">

<button class="btn btn-success btn-block btn-large" style="width:267px;"><i class="icon icon-save icon-large"></i> Save Changes</button>
</div>
</div>
</form>
<?php
}
?>