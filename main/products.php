<html>
<head>
	<meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="">
  <meta name="author" content="">
<title>
PROBOOK
</title>

<?php 
require_once('auth.php');
?>

 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">
    <link rel="stylesheet" type="text/css" href="css/side.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
  <link href="vendor/datatables/dataTables.bootstrap4.min.css" rel="stylesheet">
    
    <link href="css/bootstrap-responsive.css" rel="stylesheet">
     <link href="css/sb-admin-2.min.css" rel="stylesheet">

<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<!--sa poip up-->
<script src="jeffartagame.js" type="text/javascript" charset="utf-8"></script>
<script src="js/application.js" type="text/javascript" charset="utf-8"></script>
<link href="src/facebox.css" media="screen" rel="stylesheet" type="text/css" />
<script src="lib/jquery.js" type="text/javascript"></script>
<script src="src/facebox.js" type="text/javascript"></script>
<script type="text/javascript">
  jQuery(document).ready(function($) {
    $('a[rel*=facebox]').facebox({
      loadingImage : 'src/loading.gif',
      closeImage   : 'src/closelabel.png'
    })
  })
</script>
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

<script>
function sum() {
            var txtFirstNumberValue = document.getElementById('txt1').value;
            var txtSecondNumberValue = document.getElementById('txt2').value;
            var result = parseInt(txtFirstNumberValue) - parseInt(txtSecondNumberValue);
            if (!isNaN(result)) {
                document.getElementById('txt3').value = result;
				
            }
			
			 var txtFirstNumberValue = document.getElementById('txt11').value;
            var result = parseInt(txtFirstNumberValue);
            if (!isNaN(result)) {
                document.getElementById('txt22').value = result;				
            }
			
			 var txtFirstNumberValue = document.getElementById('txt11').value;
            var txtSecondNumberValue = document.getElementById('txt33').value;
            var result = parseInt(txtFirstNumberValue) + parseInt(txtSecondNumberValue);
            if (!isNaN(result)) {
                document.getElementById('txt55').value = result;
				
            }
			
			 var txtFirstNumberValue = document.getElementById('txt4').value;
			 var result = parseInt(txtFirstNumberValue);
            if (!isNaN(result)) {
                document.getElementById('txt5').value = result;
				}
			
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

<body>
<?php
include'includes/sidebar.php';
?>
	
	<div class="contentheader">
			<i class="icon-table"></i> Inventory and Warehouse
			</div>
			<ul class="breadcrumb">
			<li><a href="index.php">Dashboard</a></li> /
			<li class="">Inventory and Warehouse</li>
			</ul>





<input type="text" style="padding:8px;  width:500px;" name="filter" value="" id="filter" placeholder="Search Product..." autocomplete="off" />
<a rel="facebox" href="addproduct.php"><Button type="submit" class="btn btn-info" style="float:right; width:200px; height:35px;" /><i class="icon-plus-sign icon-large"></i> Add Product</button></a><br><br>
 <div class="card-body">
                            <div class="table-responsive">
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: right;">
	<thead>
		<tr>
			<th width="12%"> Product Name </th>
			<!--th width="14%"> Generic Name </th>
			<th width="13%"> Category / Description </th-->
			<th width="15%"> Vendor </th>
			<th width="9%"> Invoice Date </th>
			<!--th width="10%"> Expiry Date </th-->
			<th width="6%"> Purchase Price </th>
			<th width="6%"> Selling Price </th>
			<th width="6%"> Openning Stock (ltr) </th>
			<th width="6%"> Closing Stock (ltr) </th>
			<th width="8%">Total Purchase Price </th>
			<th width="8%"> Total Selling Price</th>
			<th width="15%"> Action </th>
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
				$result = $db->prepare("SELECT *, price * qty as total FROM products  WHERE branch = '{$_SESSION['BRANCH']}' ORDER BY product_code DESC ");
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
			</td>			<td><a rel="facebox" title="Click to edit the product" href="editproduct.php?id=<?php echo $row['product_id']; ?>"><button ><i class="icon-edit"></i> Edit</button> </a>
			<a href="#" id="<?php echo $row['product_id']; ?>" class="delbutton" title="Click to Delete the product"><button >Delete<i class="icon-trash"></i></button></a></td>
			</tr>
			<?php
				}
			?>
		
		
		
	</tbody>
</thead>

</table>
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
				$result = $db->prepare("SELECT *, sum(price * qty) as total, sum(o_price * qty) as totals,  sum(qty) as qtys FROM products  WHERE branch = '{$_SESSION['BRANCH']}' ORDER BY product_id DESC ");
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
 

<div class="clearfix"></div>
</div>
</div>
</div>

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
 if(confirm("Sure you want to delete this Product? There is NO undo!"))
		  {

 $.ajax({
   type: "GET",
   url: "deleteproduct.php",
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
</body>
<?php include('footer.php');?>
<script src="js/side.js"type="text/javascript"></script>
</html>