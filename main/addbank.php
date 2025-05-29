<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<form action="savebank.php?c_balance=0" method="post">
<center><h4><i class="icon-plus-sign icon-large"></i> Add Bank Account</h4></center>
<hr>
<div id="ac">
<span>Bank Name : </span><input type="text" style="width:265px; height:30px;" name="bank_name" required/><br>
<span>Account Name : </span><input type="text" style="width:265px; height:30px;" name="account_name" /><br>
<span>Account Number : </span><input type="text" style="width:265px; height:30px;" name="account_number" /><br>
<input type="hidden" style="width:265px; height:30px;" name="o_balance" />
<input type="hidden" style="width:265px; height:30px;" name="c_balance" value="0" />
<span>Date Created : </span><input  style="width:265px; height:30px;" class="tcal"  name="date" value="<?php echo date("m/d/Y"); ?>" /><br>

<div style="float:right; margin-right:10px;">
<button class="btn btn-success btn-block btn-large" style="width:267px;"><i class="icon icon-save icon-large"></i> Save</button>
</div>
</div>
</form>