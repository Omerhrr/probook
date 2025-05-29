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
			<li class="">Debits</li>
			</ul>
<div id="maintable">
<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none;"><i class="icon icon-circle-arrow-left icon-large"></i> Back</button></a>
</div>
</div>
</div>
<div class="card-body">
                            <div class="table-responsive">

<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
	<thead>
		<tr>
			
			<th width="15%"> Date </th>
			<!--th width="15%"> Category </th>
			<th width="15%"> Remarks </th-->
        <th width="15%"> Description </th>
			<th width="15%"> Dr. </th>
			
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
				$result = $db->prepare("SELECT * FROM sales WHERE branch = '{$_SESSION['BRANCH']}' ORDER BY transaction_id DESC");
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
			?>
			<tr class="record">
			<td><?php echo $row['date']; ?></td>
			 <td><?php echo $row['description']; ?></td>
			<td><?php echo formatMoney($row['amount'],true); ?></td>
     
			
			</tr>
			<?php
				}
			?>


       <br>
      <table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
        <thead>

      <tr>
        
        <th>Total Debit</th>
        
        
      <tr>
        
      <tr>
        <!--th colspan="0"><strong style="font-size: 20px; color: #222222;">Total:</strong></th-->
        <th colspan="1"><strong style="font-size: 13px; color: #222222;">
        <?php
        $resultas = $db->prepare("SELECT sum(amount) from sales WHERE branch = '{$_SESSION['BRANCH']}'");
        $resultas->bindParam(':a', $sdsd);
        $resultas->execute();
        for($i=0; $rowas = $resultas->fetch(); $i++){
        $fgfg=$rowas['sum(amount)'];
        echo formatMoney($fgfg, true);
        }
        ?>
        </strong></th>
      </tr>
    </tr>
  </tr>
</thead>
</table>

		
	</tbody>
</table>
</div>
</div>
</div>
<div class="clearfix"></div>
</div>
<?php include('footer.php');?>
</body>

<script src="js/side.js"type="text/javascript"></script>

</html>