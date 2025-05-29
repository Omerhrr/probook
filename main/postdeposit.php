<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<form action="savepostdeposit.php" method="post">
<center><h4><i class="icon-plus-sign icon-large"></i> Create Deposit</h4></center>
<hr>
<div style="text-align:left;">
<div id="ac">

	<span>Bank Name</span>
<select name="bank_name" Required style="width:260px; height:30px; ">
	<option></option>
	<?php
	include('../connect.php');
	$result = $db->prepare("SELECT * FROM bank");
		$result->bindParam(':userid', $id);
		$result->execute();
		for($i=0; $row = $result->fetch(); $i++){
	?>
		<option><?php echo $row['bank_name']; ?></option>
		
	<?php
	}
	?>
</select><br>
<span>Account Number</span>
<select name="account_number" Required style="width:260px; height:30px; ">
	<option></option>
	<?php
	include('../connect.php');
	$result = $db->prepare("SELECT * FROM bank");
		$result->bindParam(':userid', $id);
		$result->execute();
		for($i=0; $row = $result->fetch(); $i++){
	?>
		<option><?php echo $row['account_number']; ?></option>
		
	<?php
	}
	?>
</select><br>
<span>Teller No. : </span><input type="text"  style="width:265px; height:30px;" name="teller"Required ><br>
<span>Date:<br> </span><input type="text" style="width:265px; height:30px;" name="dates" value="<?php echo date("Y-m-d"); ?>" /><br>

<span>Description</span>
<select name="desc" Required style="width:260px; height:30px; ">
	<option></option>
<option>Being Amount Deposited</option>
<option>Being Amount Transfered</option>
<option>POS Transaction</option>
</select><br>

<span>Amount : </span><input type="text"  style="width:265px; height:30px;" name="amount"  Required><br>

<span>&nbsp;</span><input id="btn" type="submit" value="save" />
</div>
</div>
</form>