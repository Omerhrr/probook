<html>
<?php
  require_once('auth.php');
?>
<head>
<title>
PROBOOK
</title>
 <link href="css/bootstrap.css" rel="stylesheet">
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
<?php include('navfixed.php');?>
  <div class="container-fluid">
      <div class="row-fluid">
  <div class="span2">
          <div class="well sidebar-nav">
                     <ul class="nav nav-list">
              <li class="active"><a href="index.php"><i class="icon-dashboard icon-2x"></i> Dashboard </a></li> 
                  
      <li><a href="admin_inventory.php?branch=0"><i class="icon-list-alt icon-2x"></i> Inventory and Warehousing</a>                                     </li><br>

      <button class="dropdown-btn">Sales  and Purchases
    <i class="fa fa-caret-down"></i>
  </button>
  <div class="dropdown-container">
        
      <li><a href="admin_sale.php?branch=0"><i class="icon-bar-chart icon-2x"></i> Sales Summary</a></li><br>      
      <li><a href="admin_sales_report.php?branch=0&d1=0&d2=0"><i class="icon-bar-chart icon-2x"></i> Sales Report</a></li><br>
      <li><a href="admin_purchases.php?branch=0"><i class="icon-group icon-2x"></i> Purchases Summary</a> </li><br>
      <li><a href="admin_purchases_report.php?branch=0&d1=0&d2=0"><i class="icon-group icon-2x"></i> Purchases Report</a> </li><br>
  </div><br>



  <button class="dropdown-btn">Expenditure 
    <i class="fa fa-caret-down"></i>
  </button>
  <div class="dropdown-container">
          <li><a href="create_expenses.php"><i class="icon-inbox icon-large"></i> Create Expenses</a>                </li><br>
      <li><a href="admin_expenses.php?branch=0"><i class="icon-inbox icon-large"></i> Expenses Summary</a>                </li><br>
      <li><a href="admin_purchases_report.php?branch=0&d1=0&d2=0"><i class="icon-group icon-2x"></i> Expenses Report</a>
  </div><br>
  


  <button class="dropdown-btn">Banking and Finance
    <i class="fa fa-caret-down"></i>
  </button>
  <div class="dropdown-container">
          <!--li><a href="expensess.php"><i class="icon-group icon-2x"></i>  Expenses</a>                                    </li><br-->
      <li><a href="admin_debit.php?branch=0"><i class="icon-inbox icon-2x"></i>Debit</a>                                    </li><br>
      <li><a href="admin_credit.php?branch=0"><i class="icon-list icon-2x"></i>Credit</a>                                    </li><br>
      <li><a href="admin_cashbook.php?branch=0"><i class="icon-group icon-2x"></i>Cashbook</a>                                    </li><br>
  </div><br>
  <button class="dropdown-btn">Accounts Management
    <i class="fa fa-caret-down"></i>
  </button>
  <div class="dropdown-container">
    <li><a href="branches.php"><i class="icon-group icon-2x"></i>  Branches</a>                                    </li><br>
          <li><a href="employee.php"><i class="icon-group icon-2x"></i>  Employee</a>                                    </li><br>
      <li><a href="accounts.php"><i class="icon-inbox icon-2x"></i>Account Info</a>                                    </li><br>
      <li><a href="#"><i class="icon-list icon-2x"></i>Settings</a>                                    </li><br>
      
  </div>
      
      <br><br><br><br><br><br>