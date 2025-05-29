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
        }?>

        
<!DOCTYPE html>
<html lang="en">
<head>

 <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="">
  <meta name="author" content="">
<title>
PROBOOK</title>
<link rel="icon" href="https://www.freeiconspng.com/uploads/sales-icon-7.png">
<link href="vendors/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
<link href="vendors/datatables/dataTables.bootstrap4.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
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

 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
 

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">

    <link rel="stylesheet" type="text/css" href="css/side.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
<script src="js/application.js" type="text/javascript" charset="utf-8"></script>
   <script src="jeffartagame.js" type="text/javascript" charset="utf-8"></script>
    <link href="css/bootstrap-responsive.css" rel="stylesheet">
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />


</head>
<body>

<?php
include('includes/sidebar.php');
?>
	<div class="span10">
	<div class="contentheader">
			<i class="icon-list"></i> Suppliers Legder
			</div>
			<ul class="breadcrumb">
			<li><a href="index.php">Dashboard</a></li> /
			<li class="active">Suppliers Legder</li>
			</ul>


<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none;"><i class="icon icon-circle-arrow-left icon-large"></i> Back</button></a>
<button  style="float:right;" class="btn btn-success btn-mini"><a href="javascript:Clickheretoprint()"> Print</button></a>


<form action="supplier_ledger.php?sname=0" method="get">
<strong> <select name="sname" type="text" style="float:left;width:200px; height:35px;padding: 14px;">
<option></option>
<?php
	include('../connect.php');
	$result = $db->prepare("SELECT DISTINCT suplier_name from supliers WHERE branch = '{$_SESSION['BRANCH']}' ");
		$result->bindParam(':userid', $res);
		$result->execute();
		for($i=0; $row = $result->fetch(); $i++){
	?>
		<option><?php echo $row['suplier_name']; ?></option>
	<?php
	}
	?>
</select>

 <button class="btn btn-info" style="float:left;width: 200px; height:35px; " type="submits"><i class="icon icon-search icon-large"></i> Search</button>
</strong>
</form>

</div>
<?php
include('../connect.php');
// $tftft=$_GET['cname'];
// $resulta = $db->prepare("SELECT * FROM sales WHERE branch = '{$_SESSION['BRANCH']}' AND invoice_number= :a");
// $resulta->bindParam(':a', $tftft);
// $resulta->execute();
// for($i=0; $rowa = $resulta->fetch(); $i++){
// $name=$rowa['name'];
// $amount=$rowa['amount'];
// }
// $resultas = $db->prepare("SELECT * FROM customer WHERE branch = '{$_SESSION['BRANCH']}' AND customer_name= :b");
// $resultas->bindParam(':b', $name);
// $resultas->execute();
// for($i=0; $rowas = $resultas->fetch(); $i++){
// echo 'Name : '.$rowas['customer_name'].'<br>';
// echo 'Address : '.$rowas['address'].'<br>';
// echo 'Contact : '.$rowas['contact'].'<br>';
// }
?>
<div class="card-body">
 <div class="table-responsive">
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: center;">

	<thead>
		<tr>
			
			<th>Vendors Name</th>
			
			<th> Debit </th>
			<th> Credit </th>
			<th> Balance </th>
		</tr>
	</thead>
	<tbody>
			
			<?php
				$tftft=$_GET['sname'];
				$result = $db->prepare("SELECT *,sum(debit) as debit, sum(credit) as credit, sum(credit_balance) as debit_balance FROM s_ledger WHERE branch = '{$_SESSION['BRANCH']}' AND name= :userid ORDER BY date DESC");
				$result->bindParam(':userid', $tftft);
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
			?>
			<tr class="record">
			
			<td><?php echo $row['name']; ?></td>
			
			<td style="text-align: right"><?php echo formatMoney($row['debit'],true); ?></td>
			<td style="text-align: right"><?php echo formatMoney( $row['credit'],true); ?></td>
			
			<td style="text-align: right"><?php echo formatMoney($row['credit']-$row['debit'],true); ?></td>
			</tr>
			<?php
				}
			?>
		
	</tbody>
</table>
<a rel="facebox" href="addsledger.php?invoice=<?php echo $_GET['sname']; ?>&amount=<?php echo $row['credit']; ?>" style="margin-top: 10px;"><button class="btn btn-success"><i class="icon-plus-sign icon-large"></i> Add Payment</button></a><br><br>

<div class="card-body">
 <div class="table-responsive">
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: right;">
	<thead>
		<tr>

			<th >Transaction ID</th>
			<th>Date</th>
			<th>Vendors Name</th>
			<th >Inv/Reciept Number</th>
			<th>Debit</th>
			<th>Credit</th>
			
			<th>Action</th>
		</tr>
	</thead>
	<tbody>
			
			<?php
				$tftft=$_GET['sname'];
				$result = $db->prepare("SELECT * FROM s_ledger WHERE branch = '{$_SESSION['BRANCH']}' AND name= :userid ORDER BY date DESC");
				$result->bindParam(':userid', $tftft);
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
			?>
			<tr class="record">
			<td>TR-000<?php echo $row['transaction_id']; ?></td>
			<td><?php echo $row['date']; ?></td>
			<td><?php echo $row['name']; ?></td>
			<td><?php echo $row['invoice']; ?></td>
			
			<td style="text-align: right"><?php echo formatMoney($row['debit'],true); ?></td>
			<td style="text-align: right"> <?php echo formatMoney($row['credit'],true); ?></td>
			
			<td >
			


			<a style="text-align: left" href="previewss.php?iv=<?php echo $row['invoice']; ?>&sname=<?php echo $_GET['sname']; ?>"title="Click to generate reciept"><button ><i class="icon-list"></i> Receipt</button> </a>
			<a style="text-align: right" class="Journals" rel="facebox" href="addsupplier_journals.php?iv=<?php echo $row['invoice']; ?>" id=""  title="Click to issue a journal"><button ><i class="icon-edit"></i> Journals</button></a>
			<a href="delete_reciept.php?debit=<?php echo $row['debit']; ?>&tid=<?php echo $row['transaction_id']; ?>" id=""  title="Click to Delete"><button ><i class="icon icon-trash"></i> Delete</button></a>
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
</div>
</div>


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
<script src="js/jquery.js"></script>
  <script type="text/javascript">
$(function() {


$(".Journals").click(function(){

//Save the link in a variable called element
var element = $(this);

//Find the id of the link that was clicked
var del_id = element.attr("id");

//Built a url to send
var info = 'id=' + del_id;
 if(confirm("Are you sure you want to Issue a Journal? Note: Journal is for transfer between Accounts!"))
		  {

 $.ajax({
   type: "GET",
   url: "",
   data: info,
   success: function(){
   
   }
 });
         $(this).parents(".record").animate({ backgroundColor: "#fbc7c7" }, "fast")
		.animate({ opacity: "show" }, "slow");

 }

return false;

});

});
</script>



</body>
<?php include('footer.php');?>
<script src="js/side.js"type="text/javascript"></script>
</html>