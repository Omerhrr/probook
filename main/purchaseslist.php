<html>
<head>
<title>
PROBOOK
</title>
<?php
	require_once('auth.php');
?>

 <link rel="stylesheet" type="text/css" href="css/side.css">
 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
    
    <link href="css/bootstrap-responsive.css" rel="stylesheet">
    <link href="vendor/datatables/dataTables.bootstrap4.min.css" rel="stylesheet">

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

 <link rel="stylesheet" type="text/css" href="css/side.css">
  

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
   
    <link href="css/bootstrap-responsive.css" rel="stylesheet">
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<link href="src/facebox.css" media="screen" rel="stylesheet" type="text/css" />
<script src="lib/jquery.js" type="text/javascript"></script>
<script src="src/facebox.js" type="text/javascript"></script>
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
			<li class="">Purchases</li>
			</ul>
<div id="maintable">
<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none;"><i class="icon icon-circle-arrow-left icon-large"></i> Back</button></a>
</div>
<input type="text" name="filter" style="width:200px;height:35px; margin-top: -1px;" value="" id="filter" placeholder="Search Vendor..." autocomplete="off" />
<a rel="facebox" href="purchases.php"><Button type="submit" class="btn btn-info" style="float:left; width:200px; height:35px;" /><i class="icon-plus-sign icon-large"></i> Add Purchases</button></a><br><br>
</div>
<div class="card-body">
  <div class="table-responsive">

<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
	<thead>
		<tr>
			<th > Invoice Number </th>
			<th > Date </th>
			<th> Vendors </th>
			<th > Remarks </th>
			<th> Action </th>
		</tr>
	</thead>
	<tbody>
		
			<?php
				include('../connect.php');
				$result = $db->prepare("SELECT * FROM purchases WHERE branch = '{$_SESSION['BRANCH']}' AND description='purchases'ORDER BY date DESC");

				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
					$invoice = $row['invoice_number']
			?>
			<tr class="record">

			<td><?php echo $invoice; ?></td>
			<td><?php echo $row['date']; ?></td>
			<td><?php echo $row['suplier']; ?></td>
			<td><?php echo $row['remarks']; ?></td>
			<td>
				<?php
				$results = $db->prepare("SELECT * FROM s_ledger WHERE branch = '{$_SESSION['BRANCH']}' AND invoice='{$invoice}'ORDER BY date ASC");
				$results->execute();
				for($i=0; $rows = $results->fetch(); $i++){
					

					}

				?>
				

				<a rel="facebox" href="view_purchases_list.php?iv=<?php echo $row['invoice_number']; ?>"> <button ><i class="icon-search"></i> View </button></a> 


			<a href="deletepppp.php?iv=<?php echo $row['invoice_number']; ?>&id=<?php echo $row['transaction_id']; ?>" id="<?php echo $row['invoice_number']; ?>"  class="delbutton" title="Click To issue credit note"><button ><i class="icon-trash"></i> Delete</button></a>

			<a href="previe.php?invoice=<?php echo $row['invoice_number']; ?>&cash=<?php echo $rows['credit']; ?>" title="Click To print Invoice"><button class="icon-edit"> Invoice </button></a>
		</td>
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
 if(confirm("Sure you want to issue a credit note? Note: Credit Note is Used for reversing transaction. Warning?  This Action cannot be Undone!"))
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