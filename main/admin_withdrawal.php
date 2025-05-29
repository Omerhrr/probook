<html>
<head>
<title>
PROBOOK
</title>
<?php
	require_once('auth.php');
?>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

 <link rel="stylesheet" type="text/css" href="css/side.css">
    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
    
    <link href="css/bootstrap-responsive.css" rel="stylesheet">

<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<!--sa poip up-->
<script src="argiepolicarpio.js" type="text/javascript" charset="utf-8"></script>
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
<body>
 <?php
include'includes/admin_sidebar.php';
?>
	<div class="span10">
	<div class="contentheader">
			<i class="icon-dashboard"></i> Dashboard
			</div>
			<ul class="breadcrumb">
			<a href="dashboard.php"><li>Dashboard</li></a> /
			<li class="">Withdrwal</li>
			</ul>

<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none;"><i class="icon icon-circle-arrow-left icon-large"></i> Back</button></a>
</div>
<form action="admin_withdrawal.php?branch=0" method="get">
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

<div class="content" id="content">
<div style="font-weight:bold; text-align:center;font-size:14px;margin-bottom: 15px;">
Withdrawal report from&nbsp;<?php echo $_GET['branch'] ?>
</div>
</div>
</div>
<div class="card-body">
                            <div class="table-responsive">
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
  <thead>
    <tr>
      
      
      
      <th width="15%"> Total Credit  Amount </th>
     
      
    
    </tr>
  </thead>
  <tbody>
    
      <?php
     
     
        include('../connect.php');
        $d1=$_GET['branch'];

        $result = $db->prepare(" SELECT *, COUNT(debit) as c_debit, SUM(debit) as s_debit FROM deposit WHERE branch = '{$d1}' ORDER BY date DESC  ");

        $results = $db->prepare("SELECT *, COUNT(debit) as c_credit, SUM(debit) as s_credit FROM withdrawal WHERE branch = '{$d1}'  ORDER BY date DESC");
    
       
        
        $result->execute();
        $results->execute();
        for($i=0; $row = $result->fetch(),$rows = $results->fetch(); $i++){
        
      ?>
    
      <th><?php echo formatMoney($rows['s_credit'],true); ?></th>
     
      
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
			
			<th width="15%">Bank Name</th>
			<th width="15%"> Account Name </th>
			<th width="15%"> Account Number </th>
			<th width="15%">Post Date </th>
			<th width="15%">Teller No.</th>
      <th width="15%">Description </th>
      <th width="15%">Credit </th>

			<!--th width="15%"> Action </th-->
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
      $d1=$_GET['branch'];
				include('../connect.php');
				$result = $db->prepare("SELECT * FROM withdrawal WHERE branch = :a ORDER BY date DESC");
				$result->bindParam(':a', $d1);
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
			?>
			<tr class="record">
			<td><?php echo $row['bank_name']; ?></td>
			<td><?php echo $row['account_name']; ?></td>
			<td><?php echo $row['account_number']; ?></td>
			<td><?php echo $row['date']; ?></td>
			<td><?php echo $row['reciept']; ?></td>
      <td><?php echo $row['description']; ?></td>
      <td style="text-align: right"><?php echo formatMoney($row['debit'],true); ?></td>

			<!--td>

			<a href="deletewithdrawal.php?account_number=<?php echo $row['account_number']; ?>" id="" class="" title="Click To Delete"><button class="btn btn-danger btn-mini"><i class="icon-trash"></i> Delete </button></a></td-->
			</tr>
			<?php
				}
			?>

      
		
	</tbody>
</table>
</div>
</div>

</div>
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
   url: "deleteexpense.php",
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

<script src="js/side.js"type="text/javascript"></script>
<?php include('footer.php');?>

</html>