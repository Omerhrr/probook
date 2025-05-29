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
			<i class="icon-dashboard"></i> Income Statement
			</div>
			<ul class="breadcrumb">
			<a href="dashboard.php"><li>Dashboard</li></a> /
			<li class="">Income Statement</li>
			</ul>
<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none;"><i class="icon icon-circle-arrow-left icon-large"></i> Back</button></a>&nbsp;&nbsp;&nbsp;
<button  style="float:right;" class="btn btn-success btn-mini"><a href="javascript:Clickheretoprint()"> Print</button></a>

</div>
<form action="admin_incomeStatement.php?branch=0" method="get">
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

 <button class="btn btn-info" style="width: 123px; height:35px; margin-top:-8px;margin-left:8px;" type="submits"><i class="icon icon-search icon-large"></i> Search</button>
</strong>
</form>

<div class="content" id="content">
<div style="font-weight:bold; text-align:center;font-size:14px;margin-bottom: 15px;">
Income Statement of &nbsp;<?php echo $_GET['branch'] ?>
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
        ?>
      
      </div>
    </button>

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
      $d1=$_GET['branch'];
        include('../connect.php');
        
        $result = $db->prepare(" SELECT sum(cost) as cost  FROM sales_order WHERE branch = :a ORDER BY product_code ");

        $results = $db->prepare("SELECT SUM(amount) as amount FROM sales_order  WHERE branch = :a ORDER BY product_code");
        $resultss = $db->prepare("SELECT sum(cost) as cost From purchases_item WHERE description = 'Expenses'  and  branch = :a");
        $income = $db->prepare("SELECT SUM(amount) as amount FROM incomelist WHERE branch = :a ORDER BY invoice");

        //$income->bindParam(':a', $d1);
       
       $result->bindParam(':a', $d1);
       $income->bindParam(':a', $d1);
        $results->bindParam(':a', $d1);
        $resultss->bindParam(':a', $d1);
        $income->execute();


        $results->execute();

        $result->execute();
        $resultss->execute();
        
        
      for($i=0; $row=$result->fetch(),$rows=$results->fetch(),$rowss=$resultss->fetch(), $inc=$income->fetch(); $i++){
      $cost_of_sale = $row['cost'];
     
      $tot_sale = $rows['amount'] +$inc['amount'];
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
    
     
      <tr class="record">
       
      
      <td style="text-align: right"><?php echo formatMoney($gross,true); ?></td>
      <td style="text-align: right"><?php echo formatMoney($net,true); ?></td>
      
      </tr>
      
      
    
  </tbody>
</table>
</div>
</div>
</div>
<div class="clearfix"></div>
</div>

</body>


<script src="js/side.js"type="text/javascript"></script>
<?php include('footer.php');?>
</html>
