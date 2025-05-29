<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<form action="saveincomes.php" method="post">
<center><h4><i class="icon-plus-sign icon-large"></i> Add Income</h4></center>
<hr>
<div style="text-align:left;">
<div id="ac">
<span>Date: <br></span><input  style="width:260px; height:30px;" name="date" placeholder="YYYY/MM/DD" value="<?php echo date("Y-m-d"); ?>" /><br>
<!--span>Invoice Number: </span><input type="text" style="width:265px; height:30px;" name="iv" /><br-->
<span>Category:</span>
<select name="category" style="width:260px; height:30px;">
	<option></option>
	<?php
	include('../connect.php');
	$result = $db->prepare("SELECT * FROM income");
		$result->bindParam(':userid', $id);
		$result->execute();
		for($i=0; $row = $result->fetch(); $i++){
	?>
		<option><?php echo $row['income_category']; ?></option>
		
	<?php
	}
	?>
</select><br>
<span>Remarks:<br> </span><input type="text" style="width:265px; height:30px;" name="remarks" /><br>
<span>Amount : </span><input type="text"  style="width:265px; height:30px;" name="amount"  Required><br>
<span>&nbsp;</span><input id="btn" type="submit" value="save" />
</div>
</div>
</form>