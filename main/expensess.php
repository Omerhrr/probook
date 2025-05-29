<html>
<head>
<title>
PROBOOK
</title>
<?php
	require_once('auth.php');
?>
 <link href="css/bootstrap.css" rel="stylesheet">
 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
 <link rel="stylesheet" type="text/css" href="css/side.css">

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
    <style type="text/css">
      body {
        padding-top: 60px;
        padding-bottom: 40px;
      }
      .sidebar-nav {
        padding: 9px 0;
      }
    </style>
    <link href="css/bootstrap-responsive.css" rel="stylesheet">


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
<?php include('navfixed.php');?>
<div class="container-fluid">
      <div class="row-fluid">
	<div class="span2">
          <div class="well sidebar-nav">
                     <ul class="nav nav-list">
              <li class="active"><a href="#"><i class="icon-dashboard icon-2x"></i> Dashboard </a></li> 
			            
			<li><a href="products.php"><i class="icon-list-alt icon-2x"></i> Inventory</a>                                     </li><br>

      <button class="dropdown-btn">Sales 
    <i class="fa fa-caret-down"></i>
  </button>
  <div class="dropdown-container">
          <li><a href="sales.php?id=>"><i class="icon-shopping-cart icon-2x"></i> Sales</a>  </li> <br>
      <li><a href="sales_inventory.php?d1=0&d2=0"><i class="icon-bar-chart icon-2x"></i> Sales Summary</a>                </li>  <br>      <li><a href="salesreport.php?d1=0&d2=0"><i class="icon-bar-chart icon-2x"></i> Sales Report</a>                </li><br>
            <li><a href="customer.php"><i class="icon-group icon-2x"></i> Customers</a>                                    </li>
  </div><br>



  <button class="dropdown-btn">Purchases 
    <i class="fa fa-caret-down"></i>
  </button>
  <div class="dropdown-container">
          <li><a href="purchaseslist.php?d1=0&d2=0"><i class="icon-inbox icon-large"></i> Purchases</a>                </li><br>
      <li><a href="purchasereport.php?d1=0&d2=0"><i class="icon-inbox icon-large"></i> Purchases Report</a>                </li><br>
      <li><a href="supplier.php"><i class="icon-group icon-2x"></i> Suppliers</a>
  </div><br>
	


      <button class="dropdown-btn">Expenses 
    <i class="fa fa-caret-down"></i>
  </button>
  <div class="dropdown-container">
          <li><a href="create_expenses.php"><i class="icon-group icon-2x"></i> Create Expenses</a>                                    </li><br>
      <li><a href="newexpenses.php"><i class="icon-group icon-2x"></i> Add Expenses</a>                                    </li><br>
      <li><a href="expensesreport.php?d1=0&d2=0"><i class="icon-group icon-2x"></i> Expenses Report</a>                                    </li><br>
  </div>
			
			
			
			<!--li><a href="sales_inventory.php"><i class="icon-table icon-2x"></i> Product Inventory</a-->
			<br><br><br><br><br><br>		
			<li>
			 <div class="hero-unit-clock">
		
			<form name="clock">
			<font color="white">Time: <br></font>&nbsp;<input style="width:150px;" type="submit" class="trans" name="face" value="">
			</form>
			  </div>
			</li>
				
				</ul>     
          </div><!--/.well -->
        </div><!--/span-->
	<div class="span10">
	<div class="contentheader">
			<i class="icon-group"></i> Expenses
			</div>
			<ul class="breadcrumb">
			<li><a href="index.php">Dashboard</a></li> /
			<li class="">Expenses</li>
			</ul>


<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: left;"><i class="icon icon-circle-arrow-left icon-large"></i> Back</button></a>
<?php 
			include('../connect.php');
				$result = $db->prepare("SELECT * FROM Expenses ORDER BY Expenses_id DESC");
				$result->execute();
				$rowcount = $result->rowcount();
			?>
			<div style="text-align:center;">
			Total Number of Expenses: <font color="green" style="font:bold 22px 'Aleo';"><?php echo $rowcount;?></font>
			</div>
</div>
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
        $results = $db->prepare("SELECT sum(amount) From expenselist ");
        $results->execute();
        for($i=0; $rows=$results->fetch(); $i++){
          $balance = $rows['sum(amount)'];
      ?>

      <p style="float:right;width:230px; height:35px;" />Total Expenses = <?php echo formatMoney($balance, true);?> </p>

      <?php
        }

      ?>


<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
	<thead>
		<tr>
			<th> Date </th>
			
			<th> Amount </th>
			<!--th> Email Address </th>
			<th> Contact No.</th-->
			
			<!--th width="120"> Action </th-->
		</tr>
	</thead>
	<tbody>
		
			<?php
				include('../connect.php');
				$result = $db->prepare("SELECT * FROM expenselist WHERE branch = '{$_SESSION['BRANCH']}' ");
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
			?>
			<tr class="record">
			<td><?php echo $row['date']; ?></td>
			
			<td><?php echo $row['amount']; ?></td>
			<!--td><?php echo $row['email']; ?></td>
			<td><?php echo $row['contact']; ?></td-->
			
			<!--td><a rel="facebox" href="editexpenses.php?id=<?php echo $row['Expenses_id']; ?>"><button class="btn btn-warning btn-mini"><i class="icon-edit"></i> Edit </button></a-->
			<!--a href="#" id="<?php echo $row['Expenses_id']; ?>" class="delbutton" title="Click To Delete"><button class="btn btn-danger btn-mini"><i class="icon-trash"></i> Delete</button></a></td-->
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
 if(confirm("Are you sure want to delete? There is NO undo!"))
		  {

 $.ajax({
   type: "GET",
   url: "deleteexpenses.php",
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