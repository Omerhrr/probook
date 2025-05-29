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
			<i class="icon-bar-chart"></i> Cashbook
			</div>
			<ul class="breadcrumb">
			<li><a href="index.php">Dashboard</a></li> /
			<li class="">Cashbook</li>
			</ul>

<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none;"><i class="icon icon-circle-arrow-left icon-large"></i> Back</button></a>
<button  style="float:right;" class="btn btn-success btn-mini"><a href="javascript:Clickheretoprint()"> Print</button></a>

</div>
<form action="admin_cashbook.php?branch=0" method="get">
<strong>Branch :  <select name="branch" type="text" style="width:200px; height:35px;padding: 14px;">
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

 <button class="btn btn-info" style="width: 123px; height:35px; margin-top:-8px;margin-left:8px;" type="submits"><i class="icon icon-search icon-large"></i> Search</button>
</strong>
</form>

<div class="content" id="content">
<div style="font-weight:bold; text-align:center;font-size:14px;margin-bottom: 15px;">
Cashbook report from&nbsp;<?php echo $_GET['branch'] ?>
</div>

<div class="card-body">
                            <div class="table-responsive">
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
  <thead>
    <tr>
      
      
      <th width="15%"> Total Debit </th>
      <th width="15%"> Total Credit  </th>
      <th width="15%">Balance</th>
      
      
    
    </tr>
  </thead>
  <tbody>
    
      <?php
     
     
       $branch=$_GET['branch'];
        include('../connect.php');
        

        $result = $db->prepare(" SELECT *,  SUM(credit) as c_credit FROM c_ledger WHERE branch = '{$branch}' ORDER BY date DESC ");

        $results = $db->prepare("SELECT *, SUM(debit) as s_debit FROM s_ledger WHERE branch = '{$branch}'ORDER BY date DESC ");
        $resultss = $db->prepare("SELECT *, sum(amount) as amount FROM expenselist WHERE branch = '{$branch}'ORDER BY date DESC");
        
        $resultss->execute();
    
        $result->execute();
        $results->execute();
        for($i=0; $row = $result->fetch(),$rows = $results->fetch(),$rowss = $resultss->fetch(); $i++){
       
$debit = $rows['s_debit'];
        $expenses = $rowss['amount'];
        $all = $debit + $expenses;

      
      ?>
      <tr class="record"> 
      
      <td style="text-align: right"><?php echo formatMoney($row['c_credit'],True); ?></td>
      
      <td style="text-align: right"> <?php echo formatMoney($all,True); ?></td>
      <td style="text-align: right"> <?php echo formatMoney($row['c_credit']-$all,True); ?></td>
    

      
      
      </tr>
        <?php
    } 
    ?>
      
    
  </tbody>
</table>
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
        $branch=$_GET['branch'];
        

      ?>


     
</div>

<div class="card-body">
                            <div class="table-responsive">
<p style="text-align: center">Debits</p>
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
  <thead>
    <tr>
      
      <th > Date </th>
      <th> Description </th>
      <th> Amount </th>
      
     
      <!--th width="15%"> Remarks </th-->
      
    </tr>
  </thead>
  <tbody>
    
      <?php
        include('../connect.php');
        
        $result = $db->prepare("SELECT * FROM c_ledger WHERE branch = '{$branch}'  ORDER BY date DESC");
        $result->execute();
        for($i=0; $row = $result->fetch(); $i++){
           if($row['credit'] != ''){


      ?>
      <tr class="record">
      <td><?php echo $row['date']; ?></td>
      <td><?php echo $row['name'] ?></td>
      <td style="text-align: right"><?php echo formatMoney($row['credit'],true) ?></td>
  
     
        <?php
    } 
    ?>
      
      </tr>
      <?php
        }

      ?>
      
    
  </tbody>
</table>
<p style="text-align: center">Credits</p>
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: right;">
  <thead>
    <tr>
      
      
    <th> Date </th>
      <th > Description </th>
     
      <th> Amount </th>
     
      
     
    </tr>
  </thead>
  <tbody>
    
      <?php
        include('../connect.php');
        $results = $db->prepare("SELECT * FROM s_ledger WHERE branch = '{$branch}'  ORDER BY date DESC");
        $result = $db->prepare("SELECT * FROM expenselist WHERE branch = '{$branch}' ORDER BY date DESC");
        
        $results->execute();
        $result->execute();
        
        for($i=0; $rows=$results->fetch(),$row=$result->fetch(); $i++){
           if($rows['debit'] != ''){

      ?>
      <tr class="record">
      
      <td><?php echo $rows['date']; ?></td>
      <td><?php echo $rows['name'] ?></td>
       
      <td style="text-align: right"><?php echo formatMoney($rows['debit'],true); ?></td>
       <?php
        }

      ?>
      
      
      </tr>
      <tr class="record">
      
      <td><?php echo $row['date']; ?></td>
      <td><?php echo $row['category'] ?></td>
     
      <td style="text-align: right"><?php echo formatMoney($row['amount'],true); ?></td>
     
     
      
      </tr>
      <?php
        }

      ?>
      
    
  </tbody>
</table>
</div>
</div>
</div>
</div></tbody>
<div class="clearfix"></div>
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
   url: "deletepppp.php",
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
