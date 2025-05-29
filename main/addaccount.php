<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<form action="saveaccount.php" method="post">
<center><h4><i class="icon-plus-sign icon-large"></i> Add User</h4></center>
<hr>
<div id="ac">

<span>Full Name : </span>
<select name="fname"  Required style="width:265px; height:30px; margin-left:-5px; " >
<option></option>
	<?php
	include('../connect.php');
	$result = $db->prepare("SELECT * FROM employee");
		$result->bindParam(':userid', $res);
		$result->execute();
		for($i=0; $row = $result->fetch(); $i++){
	?>
		<option><?php echo $row['FULLNAME']; ?></option>
	<?php
	}
	?>
</select><br>
<span>Username : </span><input type="text" style="width:265px; height:30px;" name="uname" Required><br>
<span>password :</span><input type="password" style="width:265px; height:30px;" name="passw" Required/><br>
<span>Role :</span><input type="text" style="width:265px; height:30px;" name="role" Required/><br>
<span>Branch : </span>
<select name="branch"   style="width:265px; height:30px; margin-left:-5px; " >
<option></option>
	<?php
	include('../connect.php');
	$result = $db->prepare("SELECT * FROM branch");
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
<button class="btn btn-success btn-block btn-large" style="width:267px;"><i class="icon icon-save icon-large"></i> Save</button>
</div>
</div>
</form>
