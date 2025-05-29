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
			<a href="dashboard.php"><li>Dashboard</li></a> /
			<li class="">Expenses Lists</li>
			</ul>
<div id="maintable">
<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none;"><i class="icon icon-circle-arrow-left icon-large"></i> Back</button></a>
</div>
<input type="text" name="filter" style=" width:200px; height:35px; margin-top: -1px;" value="" id="filter" placeholder="Search Other Incomes..." autocomplete="off" />
<a rel="facebox" href="incomes.php"><Button type="submit" class="btn btn-info" style="float:left; width:200px; height:35px;" /><i class="icon-plus-sign icon-large"></i> Add Other Incomes</button></a><br><br>
</div>
</div>
<div class="card-body">
<div class="table-responsive">

<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
	<thead>
		<tr>
			
			<th width="15%"> Date </th>
			<th width="15%"> Category </th>
			<th width="15%"> Remarks </th>
			<th width="15%"> Amount </th>
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
				$result = $db->prepare("SELECT * FROM incomelist WHERE branch = '{$_SESSION['BRANCH']}' ORDER BY date DESC");
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
			?>
			<tr class="record">
			<td><?php echo $row['date']; ?></td>
			<td><?php echo $row['category']; ?></td>
			<td><?php echo $row['remark']; ?></td>
			<td style="text-align: right"><?php echo formatMoney($row['amount'],true); ?></td>

			<td>

			<a href="#" id="<?php echo $row['invoice']; ?>" class="delbutton" title="Click To Delete"><button ><i class="icon-trash"></i> Delete </button></a></td>
			</tr>
			<?php
				}
			?>

      <tr>
        <th></th>
        <th></th>
        <th></th>
        
        <th>Total Expenses</th>
        
      </tr>
      <tr>
        <th colspan="3"><strong style="font-size: 20px; color: #222222;">Total:</strong></th>
        <th colspan="0"><strong style="text-align: right;">
        <?php
        $resultas = $db->prepare("SELECT sum(amount) from incomelist WHERE branch = '{$_SESSION['BRANCH']}' ORDER BY date DESC");
        $resultas->bindParam(':a', $sdsd);
        $resultas->execute();
        for($i=0; $rowas = $resultas->fetch(); $i++){
        $fgfg=$rowas['sum(amount)'];
        echo formatMoney($fgfg, true);
        }
        ?>
        </strong></th>
        
          
          
      </tr>
		
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
   url: "delete_incomes.php",
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