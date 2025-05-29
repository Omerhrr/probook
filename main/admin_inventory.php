<html>
<?php
	require_once('auth.php');
?>
<head>
<title>
PROBOOK
</title>

  <link rel="stylesheet" type="text/css" href="css/side.css">

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
    
    <link href="css/bootstrap-responsive.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">


<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<link rel="stylesheet" type="text/css" href="tcal.css" />
<script type="text/javascript" src="tcal.js"></script>
<script language="javascript">
function Clickheretoprint()
{ 
  var disp_setting="toolbar=yes,location=no,directories=yes,menubar=yes,"; 
      disp_setting+="scrollbars=yes,width=700, height=400, left=100, top=25"; 
  var content_vlue = document.getElementById("content").innerHTML; 
  
  var docprint=window.open("","",disp_setting); 
   docprint.document.open(); 
   docprint.document.write('</head><body onLoad="self.print()" style="width: 700px; font-size:11px; font-family:arial; font-weight:normal;">');          
   docprint.document.write(content_vlue); 
   docprint.document.close(); 
   docprint.focus(); 
}
</script>


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
</head>
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
<body>
<?php
include'includes/admin_sidebar.php';
?>
	<div class="span10">
	<div class="contentheader">
			<i class="icon-bar-chart"></i> Inventory and Warehouse
			</div>
			<ul class="breadcrumb">
			<li><a href="index.php">Dashboard</a></li> /
			<li class="">Inventory and Warehouse</li>
			</ul>

<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none;"><i class="icon icon-circle-arrow-left icon-large"></i> Back</button></a>
<button  style="float:right;" class="btn btn-success btn-mini"><a href="javascript:Clickheretoprint()"> Print</button></a>

</div>
<form action="admin_inventory.php?branch=0" method="get">
<strong>Branch :  <select name="branch" type="text" style="width:200px; padding: 14px; height:35;">
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
</select>

 <button class="btn btn-info" style="width: 123px; height:35px; margin-top:-8px;margin-left:8px;" type="submit"><i class="icon icon-search icon-large"></i> Search</button>
</strong>
</form>
<center><p><?php echo $_GET['branch'];?></p></center>

<input type="text" style="padding:15px;height:35;" name="filter" value="" id="filter" placeholder="Search Product..." autocomplete="off" /><br><br>
</div>
</div>
<div class="card-body">
                            <div class="table-responsive">
<table class="hoverTable" id="resultTable" data-responsive="table" style="text-align: left;">
	<thead>
		<tr>
			<th width="12%"> Product Name </th>
			<!--th width="14%"> Generic Name </th>
			<th width="13%"> Category / Description </th-->
			<th width="7%"> Supplier </th>
			<th width="9%"> Invoice Date </th>
			<!--th width="10%"> Expiry Date </th-->
			<th width="6%"> Purchase Price </th>
			<th width="6%"> Selling Price </th>
			<th width="6%"> Openning Stock (ltr) </th>
			<th width="5%"> Closing Stock (ltr) </th>
			<th width="8%">Total Purchase Price </th>
			<th width="8%"> Total Selling Price</th>
			<!--th width="8%"> Action </th-->
		</tr>
	</thead>
	<tbody>
		
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
				include('../connect.php');
				$branch = $_GET['branch'];
				$result = $db->prepare("SELECT *, price * qty as total FROM products  WHERE branch = :branch ORDER BY product_code DESC ");
				$result->bindParam(':branch', $branch);
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
				$total=$row['total'];
				$availableqty=$row['qty'];
				if ($availableqty < 10) {
				echo '<tr class="alert alert-warning record" style="color: #fff; background:rgb(255, 95, 66);">';
				}
				else {
				echo '<tr class="record">';
				}
			?>
		

			<td><?php echo $row['product_code']; ?></td>
			<!--td><?php echo $row['gen_name']; ?></td>
			<td><?php echo $row['product_name']; ?></td-->
					<td><?php echo $row['supplier']; ?></td>
			<td><?php echo $row['date_arrival']; ?></td>
			<!--td><?php echo $row['expiry_date']; ?></td-->
			<td style="text-align: right"><?php
			$oprice=$row['o_price'];
			echo formatMoney($oprice, true);
			?></td>
			<td style="text-align: right"><?php
			$pprice=$row['price'];
			echo formatMoney($pprice, true);
			?></td>
			<td><?php echo $row['qty_sold']; ?></td>
			<td><?php echo $row['qty']; ?></td>
			<td style="text-align: right">
			<?php
			$total=$row['total'];
			echo formatMoney($oprice * $row['qty'], true);
			?>
			</td>
			<td style="text-align: right">
			<?php
			$total=$row['total'];
			echo formatMoney($total, true);
			?>
			</td>			<!--td><a rel="facebox" title="Click to edit the product" href="editproduct.php?id=<?php echo $row['product_id']; ?>"><button class="btn btn-warning"><i class="icon-edit"></i> </button> </a>
			<a href="#" id="<?php echo $row['product_id']; ?>" class="delbutton" title="Click to Delete the product"><button class="btn btn-danger"><i class="icon-trash"></i></button></a></td-->
			</tr>
			<?php
				}
			?>
		
		
		
	</tbody>
</table>
<div class="clearfix"></div>
</div>
</div>
</div>

<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: right;">
	<thead>
		<tr>
			
			<th width="6%"> Closing Stock (ltr) </th>
			<th width="8%">Total Purchase Price </th>
			<th width="8%"> Total Selling Price</th>
			
		</tr>
	</thead>
	
	<tbody>
		
			<?php
			
				include('../connect.php');
				$branch = $_GET['branch'];
				$result = $db->prepare("SELECT *, sum(price * qty) as total, sum(o_price * qty) as totals,  sum(qty) as qtys FROM products  WHERE branch = '{$branch}' ORDER BY product_id DESC ");
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
				$total=$row['total'];
				$availableqty=$row['qty'];
				if ($availableqty < 10) {
				echo '<tr class="alert alert-warning record" style="color: #fff; background:rgb(255, 95, 66);">';
				}
				else {
				echo '<tr class="record">';
				}
			?>
		<tr>

			
			<td><?php echo $row['qtys']; ?></td>

			<td style="text-align: right">
			<?php
			$totals=$row['totals'];
			echo formatMoney($totals, true);
			?>
			</td>
			<td style="text-align: right">
			<?php
			$total=$row['total'];
			echo formatMoney($total, true);
			?>

			</tr>
			<?php
				}
			?>
		
		
		
	</tbody>
</thead>
</table>

</body>
<script src="js/jquery.js"></script>
  <script type="text/javascript">
$(function() {


$(".delbutton").click(function(){

//Save the link in a variable called element
var element = $(this);

//Find the id of the link that was clicked
var del_id = element.attr("id");

//Built a url to send
var info = 'id=' + del_id;
 if(confirm("Sure you want to delete this update? There is NO undo!"))
		  {

 $.ajax({
   type: "GET",
   url: "deletesales.php",
   data: info,
   success: function(){
   
   }
 });
         $(this).parents(".record").animate({ backgroundColor: "#fbc7c7" }, "fast")
		.animate({ opacity: "hide" }, "slow");

 }

return false;

});

});
</script>
<?php include('footer.php');?>
<script src="js/side.js"type="text/javascript"></script>
</html>