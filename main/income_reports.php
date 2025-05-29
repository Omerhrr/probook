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
<script type="text/javascript" src="tcal1.js"></script>
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
include'includes/sidebar.php';
?>
  <div class="span10">
  <div class="contentheader">
      <i class="icon-bar-chart"></i> Income Report
      </div>
      <ul class="breadcrumb">
      <li><a href="index.php">Dashboard</a></li> /
      <li class="">Income Report</li>
      </ul>

<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none;"><i class="icon icon-circle-arrow-left icon-large"></i> Back</button></a>
<button  style="float:right;" class="btn btn-success btn-mini"><a href="javascript:Clickheretoprint()"> Print</button></a>

</div>
<form action="income_reports.php?d1=0&d2=0" method="get">

  From : <input type="text" style="width: 223px; padding:14px;height:35;" name="d1" class="tcal" value="" /> To: <input type="text" style="width: 223px; padding:14px;height:35;" name="d2" class="tcal" value="" />
 <button class="btn btn-info" style="width: 123px; height:35px; margin-top:-8px;margin-left:8px;" type="submit"><i class="icon icon-search icon-large"></i> Search</button>
</strong>
</form>




<div class="content" id="content">
<div style="font-weight:bold; text-align:center;font-size:14px;margin-bottom: 15px;">
 Income Report from &nbsp;    <?php echo $_GET['d1'] ?>&nbsp;to&nbsp;<?php echo $_GET['d2'] ?>
</div>
</div>
</div>
<div class="card-body">
                            <div class="table-responsive">
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
  <thead>
    <tr>
      
      
      <th width="15%"> Description </th>
      <th width="15%"> Amount </th>
      
      <th width="15%"> Description </th>
      <th width="15%"> Amount </th>
      
      <th width="15%"> Description </th>
      <th width="15%"> Amount </th>
      
      
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
        $d2=$_GET['d1'];
        $d3=$_GET['d2'];
        include('../connect.php');
        

        $result = $db->prepare(" SELECT SUM(cost) as cost  FROM sales_order WHERE branch = '{$_SESSION['BRANCH']}' AND date BETWEEN :b and :c ORDER BY product_code  ");

        $results = $db->prepare("SELECT SUM(amount) as amount FROM sales_order WHERE branch = '{$_SESSION['BRANCH']}' AND date BETWEEN :b and :c ORDER BY product_code");
        
        
        $resultss = $db->prepare("SELECT SUM(amount) as cost From expenselist  WHERE date BETWEEN :b and :c  AND branch = '{$_SESSION['BRANCH']}'");
        
        //$resultss = $db->prepare("SELECT SUM(cost) as cost From purchases_item JOIN purchases on purchases_item.invoice = purchases.invoice_number WHERE purchases.description = 'Expenses' AND purchases.date BETWEEN :b and :c  AND purchases_item.branch = '{$_SESSION['BRANCH']}'");
        
         $income = $db->prepare("SELECT SUM(amount) as amount FROM incomelist WHERE branch = '{$_SESSION['BRANCH']}' AND date BETWEEN :b and :c  ORDER BY invoice");

        $income->bindParam(':b', $d2);
        $income->bindParam(':c', $d3);




      
        $result->bindParam(':b', $d2);
        $results->bindParam(':b', $d2);
        $resultss->bindParam(':b', $d2);
       

        $result->bindParam(':c', $d3);
        $results->bindParam(':c', $d3);
        $resultss->bindParam(':c', $d3);
      


        $result->execute();
        $income->execute();
        $results->execute();
        $resultss->execute();
















        for($i=0; $row = $result->fetch(),$rows = $results->fetch(),$rowss = $resultss->fetch(), $inc=$income->fetch(); $i++){
      ?>
      <tr class="record">
         <?php
      $cost_of_sale = $row['cost'];
     
      $tot_sale = $rows['amount'] + $inc['amount'];
      $gross = $tot_sale - $cost_of_sale;
      $expenses = $rowss['cost'];
      $net = $gross - $expenses;
      ?>
      
      <td><?php echo 'Revenue'; ?></td>
      <td style="text-align: right"><?php echo formatMoney($tot_sale,true); ?></td>
      <td><?php echo 'Cost of Sales'; ?></td>
      <td style="text-align: right"><?php echo formatMoney($cost_of_sale,true); ?></td>
      <td><?php echo 'Expenses'; ?></td>
      <td style="text-align: right"><?php echo formatMoney($expenses,true); ?></td>
      
      
      </tr>
      
      
    
  </tbody>
</table>


<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: right;">
  <thead>
    <tr>
      
      
      
      <th width="15%"> Gross Profit</th>
      <th width="15%"> Net Profit </th>
     
    </tr>
  </thead>
  <tbody>
    
    
      <tr class="record">
        
      
      <td style="text-align: right"><?php echo formatMoney($gross,true); ?></td>
      <td style="text-align: right"><?php echo formatMoney($net,true); ?></td>
      
      </tr>
     
    <?php
        }

      ?>
  </tbody>
</table>
</div>
<div class="clearfix"></div>
</div>


</body>


<script src="js/side.js"type="text/javascript"></script>
<?php include('footer.php');?>
</html>
