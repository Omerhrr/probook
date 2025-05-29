<?php

	include('../connect.php');
	$id=$_GET['id'];
	$result = $db->prepare("SELECT * FROM settings WHERE  id= :userid");
	$result->bindParam(':userid', $id);
	$result->execute();
	for($i=0; $row = $result->fetch(); $i++){
?>
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<form action="savesetting.php" method="post">
<center><h4><i class="icon-edit icon-large"></i> Edit Employee</h4></center>
<hr>
<div id="ac">
<span>Branch:</span>
<select name="name"  style="width:265px; height:30px; margin-left:-5px;" >
<option></option>
	<?php
	include('../connect.php');
	$result = $db->prepare("SELECT * FROM branch ORDER BY branch_id");
		$result->bindParam(':userid', $res);
		$result->execute();
		for($i=0; $row = $result->fetch(); $i++){
	?>
		<option><?php echo $row['branch']; ?></option>
	<?php
	}
	?>
</select><br>



<span>Branch Email :</span><input type="email" style="width:265px; height:30px;" name="email" value="<?php echo $row['branch']; ?>"/><br>
<span>Branch Address :</span><input type="text" style="width:265px; height:30px;" name="address" value="<?php echo $row['CompanyAddress']; ?>" /><br>
<span>Branch Contact :</span><input type="text" style="width:265px; height:30px;" name="contact" value="<?php echo $row['CompanyContact']; ?>"/><br>
<span>Branch Motto: </span><input type="text" style="width:265px; height:30px;" name="motto" value="<?php echo $row['CompanyMotto']; ?>"/><br>



<div style="float:right; margin-right:10px;">

<button class="btn btn-success btn-block btn-large" style="width:267px;"><i class="icon icon-save icon-large"></i> Update</button>
</div>
</div>
</form>
<?php
}
?>