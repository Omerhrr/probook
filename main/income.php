<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<form action="saveincome.php" method="post">
<center><h4><i class="icon-plus-sign icon-large"></i> Other Income</h4></center>
<hr>
<div id="ac">
<span>Category : </span><input type="text" style="width:265px; height:30px;" name="cat" required/><br>
<span>Date : </span><input  style="width:265px; height:30px;" class="tcal"  name="date" value="<?php echo date("m/d/Y"); ?>" /><br>
<!--span>Email Address : </span><input type="text" style="width:265px; height:30px;" name="contact" /><br>
<span>Contact No. : </span><input type="text" style="width:265px; height:30px;" name="cperson" /><br-->

<div style="float:right; margin-right:10px;">
<button class="btn btn-success btn-block btn-large" style="width:267px;"><i class="icon icon-save icon-large"></i> Save</button>
</div>
</div>
</form>