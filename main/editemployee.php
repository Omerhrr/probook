<?php

	include('../connect.php');
	$id=$_GET['id'];
	$result = $db->prepare("SELECT * FROM employee WHERE  EMPLOYEE_ID= :userid");
	$result->bindParam(':userid', $id);
	$result->execute();
	for($i=0; $row = $result->fetch(); $i++){
?>
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<form action="saveeditemployee.php" method="post">
<center><h4><i class="icon-edit icon-large"></i> Edit Employee</h4></center>
<hr>
<div id="ac">
	<input type="hidden" name="memi" value="<?php echo $row['EMPLOYEE_ID']; ?>" />
<span>Full Name : </span><input type="text" style="width:265px; height:30px;" name="name" value="<?php echo $row['FULLNAME']; ?>"Required ><br>

<span>Gender : </span>
<select name="gen"  style="width:265px; height:30px; margin-left:-5px;" Required>
<option><?php echo $row['GENDER']; ?></option>
<option>Male</option>
<option>Female</option><br>
</select>

<span>Email :</span><input type="email" style="width:265px; height:30px;" name="email" value="<?php echo $row['EMAIL']; ?>"Required/><br>
<span>Contact :</span><input type="text" style="width:265px; height:30px;" name="contact" value="<?php echo $row['CONTACT']; ?>" Required/><br>
<span>Address :</span><input type="text" style="width:265px; height:30px;" name="address" value="<?php echo $row['ADDRESS']; ?>"Required/><br>

<span>Role :</span><input type="text" style="width:265px; height:30px;" name="role" value="<?php echo $row['ROLE']; ?>"Required/><br>


<span>Branch : </span>
<select name="branch"  style="width:265px; height:30px; margin-left:-5px;"Required >
<option><?php echo $row['branch']; ?></option>
	<?php
	include('../connect.php');
	$result = $db->prepare("SELECT * FROM branch WHERE branch = '{$_SESSION['BRANCH']}'");
		$result->bindParam(':userid', $res);
		$result->execute();
		for($i=0; $row = $result->fetch(); $i++){
	?>
		<option><?php echo $row['branch']; ?></option>
	<?php
	}
	?>
</select><br>

<div style="float:right; margin-right:10px;">

<button class="btn btn-success btn-block btn-large" style="width:267px;"><i class="icon icon-save icon-large"></i> Save Changes</button>
</div>
</div>
</form>
<?php
}
?>