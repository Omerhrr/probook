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

</head>
<body>
  <?php
include'includes/sidebar.php';
?>

  
			<div class="span10">
  <div class="contentheader">
      <i class="icon-dashboard"></i> Cashbook
      </div>
			<ul class="breadcrumb">
			<a href="index.php">Dashboard</a>/
			<li class="">Cashbook</li>
			</ul>
      </div>
<div id="maintable">
<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none;"><i class="icon icon-circle-arrow-left icon-large"></i> Back</button></a>
</div>
<div class="card-body">
                            <div class="table-responsive">
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
  <thead>
    <tr>
      
      
      <th> Total Debit </th>
      <th > Total Credit  </th>
      <th>Balance</th>
      
      
    
    </tr>
  </thead>
  <tbody>
    
      <?php
     
     
       
        include('../connect.php');
        

        $result = $db->prepare(" SELECT  SUM(credit) as c_credit FROM c_ledger WHERE branch = '{$_SESSION['BRANCH']}' ORDER BY date DESC ");

        $results = $db->prepare("SELECT  SUM(debit) as s_debit FROM s_ledger WHERE branch = '{$_SESSION['BRANCH']}' ORDER BY date DESC ");

         $resultss = $db->prepare("SELECT *,sum(amount) as amount FROM expenselist WHERE branch = '{$_SESSION['BRANCH']}' ORDER BY date DESC");
        
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
      
      <?php
    } 
    ?>

      
      
      </tr>
      
      
    
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
      
      // ?>

     

      
</div>
<div class="card-body">
                            <div class="table-responsive">
<p style="text-align: center">Debit Entry</p>
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
	<thead>
		<tr>
			
			<th > Date </th>
      <th> Description </th>
			<th > Amount </th>
     
      
			<!--th width="15%"> Remarks </th-->
      
		</tr>
	</thead>
	<tbody>
		
			<?php
				include('../connect.php');
        
				$result = $db->prepare("SELECT * FROM c_ledger WHERE branch = '{$_SESSION['BRANCH']}'  ORDER BY date DESC");
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
          if($row['credit'] != ''){


			?>

			<tr class="record">
			<td style="text-align: left"><?php echo $row['date']; ?></td>
      <td ><?php echo $row['name'] ?></td>
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
<p style="text-align: center">Credit Entry</p>
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: right;">
  <thead>
    <tr>
      
      
    <th > Date </th>
      <th > Description </th>
      
      <th> Amount </th>
      
      <!--th width="15%"> Remarks </th-->
      
     
    </tr>
  </thead>
  <tbody>
    
      <?php
        include('../connect.php');

        $results = $db->prepare("SELECT * FROM s_ledger WHERE branch = '{$_SESSION['BRANCH']}'  ORDER BY date DESC");
        $result = $db->prepare("SELECT * FROM expenselist WHERE branch = '{$_SESSION['BRANCH']}' ORDER BY date DESC");
        
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
<div class="clearfix"></div>
</div>

</body>
<?php include('footer.php');?>
<script src="js/side.js"type="text/javascript"></script>

</html>