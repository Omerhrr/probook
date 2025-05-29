<!DOCTYPE html>
<html>
<head>
<?php require_once ('auth.php');?>
<title>
PROBOOK
</title>
 <link rel="stylesheet" type="text/css" href="css/side.css">
  

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
   
    <link href="css/bootstrap-responsive.css" rel="stylesheet">
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<link href="src/facebox.css" media="screen" rel="stylesheet" type="text/css" />
<script src="lib/jquery.js" type="text/javascript"></script>
<script src="src/facebox.js" type="text/javascript"></script>
<script language="javascript">
function Clickheretoprint()
{ 
  var disp_setting="toolbar=yes,location=no,directories=yes,menubar=yes,"; 
      disp_setting+="scrollbars=yes,width=800, height=400, left=100, top=25"; 
  var content_vlue = document.getElementById("content").innerHTML; 
  
  var docprint=window.open("","",disp_setting); 
   docprint.document.open(); 
   docprint.document.write('</head><body onLoad="self.print()" style="width: 800px; font-size: 13px; font-family: arial;">');          
   docprint.document.write(content_vlue); 
   docprint.document.close(); 
   docprint.focus(); 
}
</script>
<?php
// $invoice=$_GET['invoice'];
// include('../connect.php');
// $result = $db->prepare("SELECT * FROM purchases_item JOIN purchases on purchases_item.invoice = purchases.invoice_number WHERE branch = '{$_SESSION['BRANCH']}' AND purchase_item.invoice= :userid");
// $result->bindParam(':userid', $invoice);
// $result->execute();
// for($i=0; $row = $result->fetch(); $i++){
// $sname=$row['suplier'];
// $invoice=$row['invoice'];
// $date=$row['date'];
// $cash=$row['due_date'];
// $cashier=$row['cashier'];

// $pt=$row['type'];
// $am=$row['amount'];
// if($pt=='cash'){
// $cash=$row['due_date'];
// $amount=$cash-$am;
// }
// }
?>
<?php
function createRandomPassword() {
	$chars = "003232303232023232023456789";
	srand((double)microtime()*1000000);
	$i = 0;
	$pass = '' ;
	while ($i <= 7) {

		$num = rand() % 33;

		$tmp = substr($chars, $num, 1);

		$pass = $pass . $tmp;

		$i++;

	}
	return $pass;
}
$finalcode='RS-'.createRandomPassword();
?>



 <script language="javascript" type="text/javascript">
/* Visit http://www.yaldex.com/ for full source code
and get more free JavaScript, CSS and DHTML scripts! */
<!-- Begin
var timerID = null;
var timerRunning = false;
function stopclock (){
if(timerRunning)
clearTimeout(timerID);
timerRunning = false;
}
function showtime () {
var now = new Date();
var hours = now.getHours();
var minutes = now.getMinutes();
var seconds = now.getSeconds()
var timeValue = "" + ((hours >12) ? hours -12 :hours)
if (timeValue == "0") timeValue = 12;
timeValue += ((minutes < 10) ? ":0" : ":") + minutes
timeValue += ((seconds < 10) ? ":0" : ":") + seconds
timeValue += (hours >= 12) ? " P.M." : " A.M."
document.clock.face.value = timeValue;
timerID = setTimeout("showtime()",1000);
timerRunning = true;
}
function startclock() {
stopclock();
showtime();
}
window.onload=startclock;
// End -->
</SCRIPT>
<body>

		
	<div class="span10">
	<a href="supplier_ledger.php?sname="><button class="btn btn-default"><i class="icon-arrow-left"></i> Back to Suplier Ledger</button></a>

<div class="content" id="content">
<div style="margin: 0 auto; padding: 20px; width: 900px; font-weight: normal;">
	<div style="width: 100%; height: 190px;" >
	<div style="width: 900px; float: left;">
		<?php
      
        include('../connect.php');
        $result = $db->prepare("SELECT * FROM branch WHERE branch = '{$_SESSION['BRANCH']}'");
        $result->execute();
        for($i=0; $row = $result->fetch(); $i++){
        
      ?>
	<center><div style="font:bold 25px 'Aleo';">RECIEPT</div><br />
	<b><?php echo $row['branch'] ?></b>	<br>
	<i><?php echo $row['branch_address'] ?></i>	<br>	<br>
	</center>
	<?php
}
 ?>
	<div>
		
	<?php
	
	$a= $_GET['iv']; 
	

	$resulta = $db->prepare("SELECT * FROM s_ledger WHERE branch = '{$_SESSION['BRANCH']}' AND invoice= '{$a}'");
	//$resulta->bindParam(':a', $id);
	$resulta->execute();
	for($i=0; $rowa = $resulta->fetch(); $i++){
	$address=$rowa['transaction_id'];

	$contact=$rowa['name'];
	}
	
	?>

	</div>
	</div>
	<div style="width: 136px; float: left; height: 70px;">
	<table cellpadding="3" cellspacing="0" style="font-family: arial; font-size: 12px;text-align:left;width : 100%;">

		<tr>
			<?php
	
	$a= $_GET['iv']; 
	

	$resulta = $db->prepare("SELECT * FROM s_ledger WHERE branch = '{$_SESSION['BRANCH']}' AND invoice= '{$a}'");
	//$resulta->bindParam(':a', $id);
	$resulta->execute();
	for($i=0; $rowa = $resulta->fetch(); $i++){
	$address=$rowa['transaction_id'];

	$tftft=$rowa['name'];
	
	
	?>

			<td>Receipt No:</td>
			<td><b><?php echo $rowa['invoice'] ?></b></td>
		</tr>
		<tr>
			<td>Date :</td>
			<td><b><?php echo $rowa['date'] ?></b></td>
		</tr>
		<?php }
		?>
	</table>
	
	</div>
	<div class="clearfix"></div>
	</div>
	<div style="width: 100%; margin-top:-70px;">
	<table border="1" cellpadding="4" cellspacing="0" style="font-family: arial; font-size: 12px;	text-align:left;" width="100%">
		<thead>
			<tr>
				<th>Customer Name</th>
				
				<th> Amount </th>
				
			</tr>
		</thead>
		<tbody>
				<?php
	
	$a= $_GET['iv']; 
	//$tftft=$_GET['sname'];
	$a= $_GET['iv']; 
	

	$resultss = $db->prepare("SELECT * FROM s_ledger WHERE branch = '{$_SESSION['BRANCH']}' AND invoice= '{$a}'");
	//$resulta->bindParam(':a', $id);
	$resultss->execute();
	for($i=0; $rowss = $resultss->fetch(); $i++){
	$address=$rowss['transaction_id'];

	$tftft=$rowss['name'];
}
	

	$resulta = $db->prepare("SELECT *,sum(debit) as debits, sum(credit) as credits FROM s_ledger WHERE branch = '{$_SESSION['BRANCH']}' AND invoice= '{$a}'");
	
	$result = $db->prepare("SELECT *,sum(debit) as debits, sum(credit) as credits FROM s_ledger WHERE branch = '{$_SESSION['BRANCH']}' AND name= :userid ORDER BY transaction_id ASC");
	$result->bindParam(':userid', $tftft);
	$result->execute();
	//$resulta->bindParam(':a', $id);
	$resulta->execute();
	for($i=0; $rowa = $resulta->fetch(),$row = $result->fetch(); $i++){
	$address=$rowa['transaction_id'];

	$contact=$rowa['name'];
	
	
	?>
			
				
				<tr class="record">
				<td><?php echo $rowa['name']; ?></td>
				
				
				
				
				<td>
				<?php
				$dfdf=$rowa['debit'];
				echo formatMoney($dfdf, true);
				?>
				</td>
				</tr>
				
			
				<tr>
					<td colspan="3" style=" text-align:right;"><strong style="font-size: 12px;">Balance: &nbsp;</strong></td>
					<td colspan="1"><strong style="font-size: 12px;">
					<?php
					$d_balance=$rowa['credit_balance'];
					echo formatMoney($d_balance, true);
					?>
					</strong></td>
				</tr>
				
				
				<tr>
					<td colspan="3"style=" text-align:right;"><strong style="font-size: 12px; color: #222222;">Total Balance:&nbsp;</strong></td>
					<td colspan="1"><strong style="font-size: 12px; color: #222222;">
					<?php
					$d_balance=$row['credits']- $row['debits'];
					echo formatMoney($d_balance, true);
					?>
					</strong></td>
					<?php 
				}
				?>
				</tr>
				
				<tr>
					<!--td colspan="5" style=" text-align:right;"><strong style="font-size: 12px; color: #222222;"-->
					<font style="font-size:20px;">
					&nbsp;
					</strong></td>
					<!--td colspan="2"><strong style="font-size: 15px; color: #222222;"-->
					<?php
					function formatMoney($number, $fractional=false) {
						if ($fractional) {
							$number = sprintf('%.2f', $number);
						}
						while (true) {
							$replaced = preg_replace('/(-?\d+)(\d\d\d)/', '$1,$2', $number);
							if ($replaced != $number) {
								$number = $replaced;
							} else {
								break;
							}
						}
						return $number;
					}
					
					?>
					</strong></td>
				</tr>
			
		</tbody>
	</table>
	
	</div>
	</div>
	</div>
	</div>
<div class="pull-right" style="margin-right:100px;">
		<a href="javascript:Clickheretoprint()" style="font-size:20px;"><button class="btn btn-success btn-large"><i class="icon-print"></i> Print</button></a>
		</div>	
</div>
</div>


</font>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</div>
</div>
</body>
</script>
</head>
<script src="js/side.js"type="text/javascript"></script>
</html>
