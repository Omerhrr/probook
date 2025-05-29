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
      <i class="icon-bar-chart"></i>Bank Statement
      </div>
      <ul class="breadcrumb">
      <li><a href="index.php">Dashboard</a></li> /
      <li class="">Bank Statement</li>
      </ul>

<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none;"><i class="icon icon-circle-arrow-left icon-large"></i> Back</button></a>
<button  style="float:right;" class="btn btn-success btn-mini"><a href="javascript:Clickheretoprint()"> Print</button></a>

</div>
<form action="bankstatement.php?d1=0&d2=0" method="get">

  From : <input type="text" style="width: 223px; padding:14px;height:35;" name="d1" class="tcal" value="" /> To: <input type="text" style="width: 223px; padding:14px;height:35;" name="d2" class="tcal" value="" />
 <button class="btn btn-info" style="width: 123px; height:35px; margin-top:-8px;margin-left:8px;" type="submit"><i class="icon icon-search icon-large"></i> Search</button>
</strong>
</form>




<div class="content" id="content">
<div style="font-weight:bold; text-align:center;font-size:14px;margin-bottom: 15px;">
 Bank Statement from &nbsp;    <?php echo $_GET['d1'] ?>&nbsp;to&nbsp;<?php echo $_GET['d2'] ?>
</div>
</div>
</div>



<div class="card-body">
                            <div class="table-responsive">
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
  <thead>
    <tr>
      
     
    
    </tr>
  </thead>
  <tbody>
    
      <?php
     
     
       
        include('../connect.php');
        

        $result = $db->prepare(" SELECT * FROM bank ORDER BY account_number  ");

        $result->execute();
        
        for($i=0; $row = $result->fetch(); $i++){
        
      ?>
      <tr class="record"> 
      
    
     
      <?php
    } 
    ?>

      
      
      </tr>
      
      
    
  </tbody>
</table>
</div>
</div>























<div class="card-body">
                            <div class="table-responsive">
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
  <thead>
    <tr>
      
      
      <th width="15%"> Debit Count </th>
      <th width="15%"> Total Debit  </th>
      <th width="15%">Credit Count </th>
      <th width="15%"> Total Credit   </th>
      <th width="15%"> Balance </th>
      
    
    </tr>
  </thead>
  <tbody>
    
      <?php
     
     
        $d2=$_GET['d1'];
        $d3=$_GET['d2'];
        include('../connect.php');
        

        $result = $db->prepare(" SELECT *, COUNT(debit) as c_debit, SUM(debit) as s_debit FROM deposit WHERE branch = '{$_SESSION['BRANCH']}' AND date BETWEEN :b and :c ORDER BY date DESC  ");

        $results = $db->prepare("SELECT *, COUNT(debit) as c_credit, SUM(debit) as s_credit FROM withdrawal WHERE branch = '{$_SESSION['BRANCH']}' AND date BETWEEN :b and :c ORDER BY date DESC");
    
       
        $result->bindParam(':b', $d2);
        $result->bindParam(':c', $d3);
         $results->bindParam(':b', $d2);
        $results->bindParam(':c', $d3);
        $result->execute();
        $results->execute();
        for($i=0; $row = $result->fetch(),$rows = $results->fetch(); $i++){
        
      ?>
      <tr class="record"> 
      <td><?php echo $row['c_debit']; ?></td>
      <td style="text-align: right"><?php echo formatMoney($row['s_debit'],True); ?></td>
      <td><?php echo $rows['c_credit']; ?></td>
      <td style="text-align: right"> <?php echo formatMoney($rows['s_credit'],True); ?></td>
       <td style="text-align: right"> <?php echo formatMoney($row['s_debit']-$rows['s_credit'],True); ?></td>
      
      <?php
    } 
    ?>

      
      
      </tr>
      
      
    
  </tbody>
</table>
</div>
</div>




























<div class="card-body">
                            <div class="table-responsive">
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
  <thead>
    <tr>
      
      
      <th width="15%"> Bank name </th>
      <th width="15%"> Account number </th>
      <th width="15%"> Date </th>
       <th width="15%"> Teller No. </th>
      <th width="15%"> Description </th>
      <th width="15%"> Debit </th>
      <th width="15%"> Credit </th>
      
    
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
        

        $result = $db->prepare(" SELECT * FROM deposit WHERE branch = '{$_SESSION['BRANCH']}' AND date BETWEEN :b and :c ORDER BY date DESC  ");
        $result->bindParam(':b', $d2);
        $result->bindParam(':c', $d3);
        $result->execute();
        for($i=0; $row = $result->fetch(); $i++){
        
      ?>
      <tr class="record"> 
      <td><?php echo $row['bank_name']; ?></td>
      <td><?php echo $row['account_number']; ?></td>
      <td><?php echo $row['date']; ?></td>
      <td><?php echo $row['reciept']; ?></td>
      <td><?php echo $row['description']; ?></td>
      <td><?php echo formatMoney($row['debit'],True); ?></td>
      <td><?php echo formatMoney($row['credit'],True); ?></td>
      <?php
    } 
    ?>

      
      
      </tr>
      
      
    
  </tbody>

  <thead>
    <tr>
      
      
      <th width="15%"> Bank name </th>
      <th width="15%"> Account number </th>
      <th width="15%"> Date </th>
       <th width="15%"> Teller No. </th>
      <th width="15%"> Description </th>
      <th width="15%"> Debit </th>
      <th width="15%"> Credit </th>
      
    
    </tr>
  </thead>
  <tbody>
    
      <?php
     
      
     
        $d2=$_GET['d1'];
        $d3=$_GET['d2'];
        include('../connect.php');
        

       

        $results = $db->prepare("SELECT * FROM withdrawal WHERE branch = '{$_SESSION['BRANCH']}' AND date BETWEEN :b and :c ORDER BY date DESC");
    
        $results->bindParam(':b', $d2);
        $results->bindParam(':c', $d3);
        $results->execute();
        for($i=0; $rows = $results->fetch(); $i++){

      ?>
      <tr class="record"> 
      <td><?php echo $rows['bank_name']; ?></td>
      <td><?php echo $rows['account_number']; ?></td>
      <td><?php echo $rows['date']; ?></td>
      <td><?php echo $rows['reciept']; ?></td>
      <td><?php echo $rows['description']; ?></td>
      <td><?php echo formatMoney($rows['credit'],True); ?></td>
      <td><?php echo formatMoney($rows['debit'],True); ?></td>
      <?php
    }
    ?>
      
      </tr>
      
      
    
  </tbody>
</table>


</div>
<div class="clearfix"></div>
</div>


</body>
</div>
</div>

<script src="js/side.js"type="text/javascript"></script>
<?php include('footer.php');?>
</html>
