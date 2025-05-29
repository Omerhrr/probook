<?php
	include('../connect.php');
	$id=$_GET['id'];
	$result = $db->prepare("SELECT * FROM branch WHERE branch_id= :userid");
	$result->bindParam(':userid', $id);
	$result->execute();
	for($i=0; $row = $result->fetch(); $i++){
?>
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<form action="saveeditbranches.php" method="post">
<center><h4><i class="icon-edit icon-large"></i> Edit Branches</h4></center><hr>
<div id="ac">
<input type="hidden" name="memi" value="<?php echo $id; ?>" />
<span>Branch: </span><input type="text" style="width:265px; height:30px;" name="branch" value="<?php echo $row['branch']; ?>" /><br>
<span>Branch Address </span><input type="text" style="width:265px; height:30px;" name="branch-address" value="<?php echo $row['branch_address']; ?>" /><br>
<span>Branch Motto </span><input type="text" style="width:265px; height:30px;" name="branch-motto" value="<?php echo $row['branch_motto']; ?>" /><br>

<div style="float:right; margin-right:10px;">

<button class="btn btn-success btn-block btn-large" style="width:267px;"><i class="icon icon-save icon-large"></i> Save Changes</button>
</div>
</div>
</form>
<?php
}
?>