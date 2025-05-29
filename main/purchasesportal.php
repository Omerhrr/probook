
<html>
<head>
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
<title>
PROBOOK
</title>
<?php
	require_once('auth.php');
?>

	<link href="vendors/uniform.default.css" rel="stylesheet" media="screen">
 
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">
    <link rel="stylesheet" type="text/css" href="css/side.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
    
    <link href="css/bootstrap-responsive.css" rel="stylesheet">

	<!-- combosearch box-->	
	
	<script src="vendors/jquery-1.7.2.min.js"></script>
    <script src="vendors/bootstrap.js"></script>

	
	
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
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
</head>

<body>
<?php
include"includes/sidebar.php";
?>
	<div class="span10">
	    <div class="contentheader">
			<i class="icon-dashboard"></i> Dashboard
			</div>
			<ul class="breadcrumb">
			<a href="dashboard.php"><li>Dashboard</li></a> /
			<li class="">Purchase Lists</li>
			</ul>
<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none;"><i class="icon icon-circle-arrow-left icon-large"></i> Back</button></a><br><br>

<form action="savepurchasesitem.php" method="post" >
<input type="hidden" name="invoice" value="<?php echo $_GET['iv']; ?>" />
<select name="product" style="width: 200px;float: left;height:35px; "class="chzn-select" required>
	<<option></option>}
	option
	<?php
	include('../connect.php');
	$result = $db->prepare("SELECT * FROM products WHERE branch = '{$_SESSION['BRANCH']}'");
		$result->bindParam(':userid', $res);
		$result->execute();
		for($i=0; $row = $result->fetch(); $i++){
	?>
		<option value="<?php echo $row['product_code']; ?>"><?php echo $row['product_code']; ?> - <?php echo $row['product_name']; ?></option>
	<?php
	}
	?>
</select>
<input type="number" name="qty" value="1"  min="1" placeholder="Qty" autocomplete="off" style="width: 68px; height:35px; padding-top: 6px; padding-bottom: 6px; margin-right: 4px; font-size:15px; float: left;"required/>
<Button type="submit" class="btn btn-info" style="width: 123px; height:40px; margin-top:-5px;float: left;" /><i class="icon-plus-sign icon-large"></i> Add</button><br><br><br>

</form>
<div class="content" id="content">
<?php
$id=$_GET['iv'];
include('../connect.php');
$resultaz = $db->prepare("SELECT * FROM purchases WHERE branch = '{$_SESSION['BRANCH']}' AND invoice_number= :xzxz");
$resultaz->bindParam(':xzxz', $id);
$resultaz->execute();
for($i=0; $rowaz = $resultaz->fetch(); $i++){
echo 'Transaction ID : TR-'.$rowaz['transaction_id'].'<br>';
echo 'Invoice Number : '.$rowaz['invoice_number'].'<br>';
echo 'Date : '.$rowaz['date'].'<br>';
echo 'Supplier : '.$rowaz['suplier'].'<br>';
echo 'Remarks : '.$rowaz['remarks'].'<br>';
}
?>

<div class="card-body">
<div class="table-responsive">
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
	<thead>
		<tr>
			<th width="35%"> Name </th>
			<th width="10%"> Qty </th>
			<th width="15%"> Unit price </th>
			<th width="15%"> Amount </th>
			<th width="12%"> Action </th>
		</tr>
	</thead>
	<tbody>
		
			<?php
				$id=$_GET['iv'];
				$result = $db->prepare("SELECT * FROM purchases_item WHERE branch = '{$_SESSION['BRANCH']}' AND invoice= :userid");
				$result->bindParam(':userid', $id);
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
			?>
			<tr class="record">
			<td><?php
			$rrrrrrr=$row['name'];
			$resultss = $db->prepare("SELECT * FROM products WHERE branch = '{$_SESSION['BRANCH']}' AND product_code= :asas");
			$resultss->bindParam(':asas', $rrrrrrr);
			$resultss->execute();
			for($i=0; $rowss = $resultss->fetch(); $i++){
			echo $rowss['product_code'];
			}
			?></td>
			<td><?php echo $row['qty']; ?></td>
			<td><?php
			//$rrrrrrr=$row['price'];
			$resultss = $db->prepare("SELECT * FROM products WHERE branch = '{$_SESSION['BRANCH']}' AND product_code= :asas");
			$resultss->bindParam(':asas', $rrrrrrr);
			$resultss->execute();
			for($i=0; $rowss = $resultss->fetch(); $i++){
			echo $rowss['o_price'];
			}
			?>

				


			</td>
			<td>
			<?php
			$dfdf=$row['cost'];
			echo formatMoney($dfdf, true);
			?>
			</td>
			<td><center><a href="deletep.php?id=<?php echo $row['id']; ?>&invoice=<?php echo $_GET['iv']; ?>&qty=<?php echo $row['qty'];?>&code=<?php echo $row['name'];?>"><button class="btn btn-mini btn-warning"><i class="icon icon-remove"></i> Cancel </button></a></td>
			</center>
			</tr>
			<?php
				}
			?>
			<tr>
				<td colspan="2"><strong style="font-size: 12px; color: #222222;">Total:</strong></td>
				<td colspan="2"><strong style="font-size: 12px; color: #222222;">
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
				$sdsd=$_GET['iv'];
				$resultas = $db->prepare("SELECT sum(cost) FROM purchases_item WHERE branch = '{$_SESSION['BRANCH']}' AND invoice= :a");
				$resultas->bindParam(':a', $sdsd);
				$resultas->execute();
				for($i=0; $rowas = $resultas->fetch(); $i++){
				$fgfg=$rowas['sum(cost)'];
				echo formatMoney($fgfg, true);
				
				}

				?>
				</strong></td>
			</tr>
		</td>
	</tr>
<?php
$id=$_GET['iv'];
include('../connect.php');
$resultaz = $db->prepare("SELECT * FROM purchases WHERE branch = '{$_SESSION['BRANCH']}' AND invoice_number= :xzxz");
$resultaz->bindParam(':xzxz', $id);
$resultaz->execute();
for($i=0; $rowaz = $resultaz->fetch(); $i++){


?>
	</tbody>
</table></div><br>

<a rel="facebox" href="scheckout.php?pt=<?php echo $row['id']?>&invoice=<?php echo $_GET['iv']?>&date=<?php echo $rowaz['date']?>&total=<?php echo $fgfg ?>"><button class="btn btn-success btn-large btn-block"><i class="icon icon-save icon-large"></i> SAVE</button></a>

<?php
}
?>
</div>
</div>
<div class="clearfix"></div>
</div>
</div>
<?php include('footer.php');?>
</body>
<script src="js/side.js"type="text/javascript"></script>

</html>