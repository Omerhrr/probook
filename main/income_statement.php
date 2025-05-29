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
include'includes/sidebar.php';
?>
	<div class="span10">
	<div class="contentheader">
			<i class="icon-dashboard"></i> Dashboard
			</div>
			<ul class="breadcrumb">
			<a href="index.php"><li>Dashboard</li></a> /
			<li class="">Income Statement</li>
			</ul>
<div id="maintable">
<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none;"><i class="icon icon-circle-arrow-left icon-large"></i> Back</button></a>
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
        $results = $db->prepare("SELECT *,sum(cost) From purchases_item WHERE branch = '{$_SESSION['BRANCH']}' ORDER BY description ASC ");
        $results->execute();
        $result = $db->prepare("SELECT  *,sum(amount) From sales WHERE branch = '{$_SESSION['BRANCH']}'");
        $result->execute();
        for($i=0; $rows=$results->fetch(),$row = $result->fetch(); $i++){
          $balance = $row['sum(amount)'] - $rows['sum(cost)'];
      ?>

      

      <?php
        }

      ?>
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
			<!--th width="15%"> Remarks </th-->
      
		</tr>
	</thead>
	<tbody>
		
			<?php
				include('../connect.php');

         $result = $db->prepare("SELECT SUM(cost) as cost  FROM sales_order WHERE branch = '{$_SESSION['BRANCH']}' ORDER BY product_code  ");

        $results = $db->prepare("SELECT SUM(amount) as amount FROM sales_order WHERE branch = '{$_SESSION['BRANCH']}' ORDER BY product_code");
        $resultss = $db->prepare("SELECT SUM(cost) as cost From purchases_item WHERE description = 'Expenses'  and branch = '{$_SESSION['BRANCH']}'");
        $income = $db->prepare("SELECT SUM(amount) as amount FROM incomelist WHERE branch = '{$_SESSION['BRANCH']}' ORDER BY invoice");

        $income->bindParam(':a', $d1);

       

        $results->execute();

        $result->execute();
        $resultss->execute();
        $income->execute();

        
        
      for($i=0; $row=$result->fetch(),$rows=$results->fetch(),$rowss=$resultss->fetch(), $inc=$income->fetch(); $i++){
      $cost_of_sale = $row['cost'];
     
      $tot_sale = $rows['amount'] + $inc['amount'];
      $gross = $tot_sale - $cost_of_sale;
      $expenses = $rowss['cost'];
      $net = $gross - $expenses;
      

      
      ?>
			<tr class="record">
        
			
      <td><?php echo 'Revenue'; ?></td>
			<td style="text-align: right"><?php echo formatMoney($tot_sale,true); ?></td>
      <td><?php echo 'Cost of Sales'; ?></td>
      <td style="text-align: right"><?php echo formatMoney($cost_of_sale,true); ?></td>
      <td><?php echo 'Expenses'; ?></td>
      <td style="text-align: right"><?php echo formatMoney($expenses,true); ?></td>
			
			
			</tr>
			<?php
				}

			?>
      
		
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
    
      <?php
      include('../connect.php');
        $result = $db->prepare("SELECT sum(cost) as cost  FROM sales_order WHERE branch = '{$_SESSION['BRANCH']}' ORDER BY product_code");

        $results = $db->prepare("SELECT SUM(amount) as amount FROM sales_order WHERE branch = '{$_SESSION['BRANCH']}' ORDER BY product_code");
        $resultss = $db->prepare("SELECT sum(cost) as cost From purchases_item WHERE description = 'Expenses'  and branch = '{$_SESSION['BRANCH']}'");
         $income = $db->prepare("SELECT SUM(amount) as amount FROM incomelist WHERE branch = '{$_SESSION['BRANCH']}' ORDER BY invoice");

        //$income->bindParam(':a', $d1);

       

        $results->execute();

        $result->execute();
        $resultss->execute();
        $income->execute();
        
        
      for($i=0; $row=$result->fetch(),$rows=$results->fetch(),$rowss=$resultss->fetch(), $inc=$income->fetch(); $i++){
      $cost_of_sale = $row['cost'];
     
      $tot_sale = $rows['amount']  + $inc['amount'];
      $gross = $tot_sale - $cost_of_sale;
      $expenses = $rowss['cost'];
      $net = $gross - $expenses;
      ?>
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