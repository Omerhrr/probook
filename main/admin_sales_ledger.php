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
        }?>

     
<!DOCTYPE html>
<html lang="en">
<head>

 <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="">
  <meta name="author" content="">
<title>
PROBOOK</title>
<link rel="icon" href="https://www.freeiconspng.com/uploads/sales-icon-7.png">
<link href="vendors/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
<link href="vendors/datatables/dataTables.bootstrap4.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">


 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
 

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">

    <link rel="stylesheet" type="text/css" href="css/side.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
<script src="js/application.js" type="text/javascript" charset="utf-8"></script>
   <script src="jeffartagame.js" type="text/javascript" charset="utf-8"></script>
    <link href="css/bootstrap-responsive.css" rel="stylesheet">
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
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
<?php
  require_once('auth.php');
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
<body>

<?php
include('includes/admin_sidebar.php');
?>
	<div class="span10">
	<div class="contentheader">
			<i class="icon-list"></i> Sales Legder
			</div>
			<ul class="breadcrumb">
			<li><a href="index.php">Dashboard</a></li> /
			<li class="active">Sales Legder</li>
			</ul>


<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none;"><i class="icon icon-circle-arrow-left icon-large"></i> Back</button></a>
<button  style="float:right;" class="btn btn-success btn-mini"><a href="javascript:Clickheretoprint()"> Print</button></a>

<form action="admin_sales_ledger.php?branch=" method="get">
<strong>Branch :  <select name="branch" type="text" style="width:200px; padding: 14px;">
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

 <button class="btn btn-info" style="width: 200px; height:35px; margin-top:-8px;margin-left:8px;" type="submits"><i class="icon icon-search icon-large"></i> Search</button>
</strong>
</form>




</div>
<?php
include('../connect.php');

?>
<br>
<center><span><b>SALES LEDGER</b></span></center>

<div class="card-body">
 <div class="table-responsive">
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
	<thead>
		<tr>
			<th> Invoice No. </th>
			<th> Invoice Date </th>
			<th> Brand Name </th>
			<th> Category</th>
			<th> QTY </th>
			<th >Unit Price </th>
			<th> Amount </th>
		</tr>
	</thead>
	<tbody>
			
			<?php
      $branch=$_GET['branch'];
				$result = $db->prepare("SELECT * FROM sales_order WHERE branch = '{$branch}' ORDER BY date DESC");
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
					$invoice = $row['invoice']
			?>
			<tr class="record">
			<td><?php echo $row['invoice']; ?></td>
			<td><?php echo $row['date']; ?></td>
			<td><?php echo $row['product_code']; ?></td>
			<td><?php echo $row['name']; ?></td>
			<td><?php echo $row['qty']; ?></td>
			<td style="text-align: right"><?php
			$price=$row['price'];
			echo formatMoney($price, true);
			?></td>

			<td style="text-align: right"><?php
			$oprice=$row['amount'];
			echo formatMoney($oprice, true);
			?></td>

			</tr>
			<?php
				}
			?>
		
	</tbody>
</table>
</div>
</div>



<div class="clearfix"></div>

</div>
</button>
</div>
</div>
</div>
<script src="js/jquery.js"></script>
  <script type="text/javascript">
$(function() {


$(".Journals").click(function(){

//Save the link in a variable called element
var element = $(this);

//Find the id of the link that was clicked
var del_id = element.attr("id");

//Built a url to send
var info = 'id=' + del_id;
 if(confirm("Are you sure you want to Issue a Journal? Note: Journal is for transfer between Accounts!"))
		  {

 $.ajax({
   type: "GET",
   url: "",
   data: info,
   success: function(){
   
   }
 });
         $(this).parents(".record").animate({ backgroundColor: "#fbc7c7" }, "fast")
		.animate({ opacity: "show" }, "slow");

 }

return false;

});

});
</script>



</body>
<?php include('footer.php');?>
<script src="js/side.js"type="text/javascript"></script>
</html>