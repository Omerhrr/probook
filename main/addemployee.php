<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<form action="saveemployee.php" method="post">
<center><h4><i class="icon-plus-sign icon-large"></i> Add Employee</h4></center>
<hr>
<div id="ac">
<span>Full Name : </span><input type="text" style="width:265px; height:30px;" name="name" Required><br>
<span>Gender : </span>
<select name="gen"  style="width:265px; height:30px; margin-left:-5px;" required>
<option></option>
<option>Male</option>
<option>Female</option>
</select><br>
<span>Email :</span><input type="email" style="width:265px; height:30px;" name="email" Required/><br>
<span>Contact :</span><input type="text" style="width:265px; height:30px;" name="contact" Required/><br>
<span>Address : </span><textarea style="width:265px; height:50px;" name="address" Required> </textarea><br>

<span>Role :</span><input type="text" style="width:265px; height:30px;" name="role" Required/><br>
<span>Branch : </span>
<select name="branch"   style="width:265px; height:30px; margin-left:-5px; " >
<option></option>
	<?php
	include('../connect.php');
	$result = $db->prepare("SELECT * FROM branch ");
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
