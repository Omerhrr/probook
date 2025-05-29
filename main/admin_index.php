
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


 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
 

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">

    <link rel="stylesheet" type="text/css" href="css/side.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
<script src="js/application.js" type="text/javascript" charset="utf-8"></script>
   <script src="jeffartagame.js" type="text/javascript" charset="utf-8"></script>
    <link href="css/bootstrap-responsive.css" rel="stylesheet">
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
<?php
  require_once('auth.php');
?>
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

<body>
  <?php
include'includes/admin_sidebar.php';
?>

<link rel="icon" href="https://www.freeiconspng.com/uploads/sales-icon-7.png">
<link href="vendors/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
<link href="vendors/datatables/dataTables.bootstrap4.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">

<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/morris.js/0.5.1/morris.css">
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/morris.js/0.5.1/morris.min.js"></script>

 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
 

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">

    <link rel="stylesheet" type="text/css" href="css/side.css">
  


            <!-- Customer ROW -->
            <div class="row">
            <div class="col-md-3">
            <!-- Customer record -->
            <div class="col-md-12 mb-3">
              <div class="card border-left-primary shadow h-100 py-2">
                <div class="card-body">
                  <div class="row no-gutters align-items-center">
                    <div class="col mr-0">
                      <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">REVENUE</div>
                      <div class="h6 mb-0 font-weight-bold text-gray-800">
                        <?php
        include('../connect.php');
        
        $results = $db->prepare("SELECT SUM(amount) as amount FROM sales_order  ORDER BY product_code");
       $income = $db->prepare("SELECT SUM(amount) as amount FROM incomelist  ORDER BY invoice");
       $income->execute();

        $results->execute();
         
        
        
        for($i=0; $rows=$results->fetch(), $inc=$income->fetch(); $i++){
         

      
      $tot_sale = $rows['amount'] +$inc['amount'];
      

     echo formatmoney($tot_sale,true);
   }
      ?>
      
                    
                     
                  </div>
                    </div>
                      <div class="col-auto">
                        <i class="fas fa-users fa-2x text-gray-300"></i>
                      </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Supplier record -->
            <div class="col-md-12 mb-3">
              <div class="card border-left-warning shadow h-100 py-2">
                <div class="card-body">
                  <div class="row no-gutters align-items-center">
                    <div class="col mr-0">
                      <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">COST OF SALES</div>
                      <div class="h6 mb-0 font-weight-bold text-gray-800">
                        <?php
        include('../connect.php');
        
        $result = $db->prepare("SELECT sum(cost) as cost  FROM sales_order  ORDER BY product_code");
        
         
        
        

        $result->execute();
        
        
        for($i=0; $row=$result->fetch(); $i++){
          $cost_of_sale = $row['cost'];
        echo formatMoney($cost_of_sale,true); 

   }
      ?>
     
                     
                     
                      </div>
                    </div>
                    <div class="col-auto">
                      <i class="fas fa-users fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
            <!-- Employee ROW -->
          <div class="col-md-3">
            <!-- Employee record -->
            <div class="col-md-12 mb-3">
              <div class="card border-left-success shadow h-100 py-2">
                <div class="card-body">
                  <div class="row no-gutters align-items-center">
                    <div class="col mr-0">
                      <div class="text-xs font-weight-bold text-success text-uppercase mb-1">GROSS PROFIT</div>
                      <div class="h6 mb-0 font-weight-bold text-gray-800">
                        <?php
        include('../connect.php');
      $result = $db->prepare("SELECT sum(cost) as cost  FROM sales_order  ORDER BY product_code");

        $results = $db->prepare("SELECT SUM(amount) as amount FROM sales_order  ORDER BY product_code");
        $income = $db->prepare("SELECT SUM(amount) as amount FROM incomelist  ORDER BY invoice");
       $income->execute();
       

        $results->execute();
        
         
        
        

        $result->execute();
        
        
        for($i=0; $row=$result->fetch(),$rows=$results->fetch(), $inc=$income->fetch(); $i++){
        $cost_of_sale = $row['cost'];
     
       $tot_sale = $rows['amount'] + $inc['amount'];
      $gross = $tot_sale - $cost_of_sale;
      

      echo formatMoney($gross,true); 

     }

      ?>
             
             
                      </div>
                    </div>
                    <div class="col-auto">
                      <i class="fas fa-users fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>





          <div class="col-md-3">
            <!-- Employee record -->
            <div class="col-md-12 mb-3">
              <div class="card border-left-success shadow h-100 py-2">
                <div class="card-body">
                  <div class="row no-gutters align-items-center">
                    <div class="col mr-0">
                      <div class="text-xs font-weight-bold text-success text-uppercase mb-1">EXPENSES</div>
                      <div class="h6 mb-0 font-weight-bold text-gray-800">
                        <?php
        include('../connect.php');
        
        

        $result = $db->prepare("SELECT sum(cost) as cost From purchases_item WHERE description = 'Expenses' ");

        
        $result->execute();
        
        
        for($i=0; $row=$result->fetch(); $i++){
      ?>
     
      <?php
      
      $expense = $row['cost'];
      


    echo formatMoney($expense,true); 

  }

      ?>
            
             
                      </div>
                    </div>
                    <div class="col-auto">
                      <i class="fas fa-users fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>




          <div class="col-md-3">
            <!-- Employee record -->
            <div class="col-md-12 mb-3">
              <div class="card border-left-success shadow h-100 py-2">
                <div class="card-body">
                  <div class="row no-gutters align-items-center">
                    <div class="col mr-0">
                      <div class="text-xs font-weight-bold text-success text-uppercase mb-1">NET PROFIT</div>
                      <div class="h6 mb-0 font-weight-bold text-gray-800">
                        <?php
        include('../connect.php');
        
         $result = $db->prepare("SELECT sum(cost) as cost  FROM sales_order  ORDER BY product_code");

        $results = $db->prepare("SELECT SUM(amount) as amount FROM sales_order  ORDER BY product_code");

        $resultss = $db->prepare("SELECT sum(cost) as cost From purchases_item WHERE description = 'Expenses'");
        $incomes = $db->prepare("SELECT SUM(amount) as amount FROM incomelist  ORDER BY invoice");
       $incomes->execute();
        
        $resultss->execute();
       

        $results->execute();
        
         
        
        

        $result->execute();
        
        
        for($i=0; $row=$result->fetch(),$rows=$results->fetch(),$rowss=$resultss->fetch(),$inc=$incomes->fetch(); $i++){
        $cost_of_sale = $row['cost'];
     
       $tot_sale = $rows['amount'] + $inc['amount'];
      $gross = $tot_sale - $cost_of_sale;
      $expenses = $rowss['cost'];
      $net = $gross - $expenses;
      $total = array();
       $total =[$tot_sale,$cost_of_sale,$gross,$expenses,$net];
       $income = array();
       $income =[$expenses,$net];

      
    }
echo formatMoney($net,true); 
      ?>

<!--===============================Chart Begins==========================================================  -->
<!--===============================Chart Begins==========================================================  -->
<!--===============================Chart Begins==========================================================  -->
<!--===============================Chart Begins==========================================================  -->
<!--===============================Chart Begins==========================================================  -->
<!--===============================Chart Begins==========================================================  -->
<!--===============================Chart Begins==========================================================  -->
<!--===============================Chart Begins==========================================================  -->


             
              
                      </div>
                    </div>
                    <div class="col-auto">
                      <i class="fas fa-users fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>


          <div class="row">

                        <!-- Content Column -->
                        <div class="col-lg-6 mb-4">

                            <!-- Project Card Example -->
                            <div class="card shadow mb-4">
                                <div class="card-header py-3">
                                    <h6 class="m-0 font-weight-bold text-primary">Earning Overview</h6>
                                </div>
                                <div class="card-body">
                                  <div class="chart-area">
                                    <canvas id="myadminBarChart">
                                      
                                    </canvas>
                                        
                                    </div>
                                    
                                    </div>
                                </div>
                            </div>

                            <div class="col-lg-6 mb-4">

                            <!-- Project Card Example -->
                            <div class="card shadow mb-4">
                                <div class="card-header py-3">
                                    <h6 class="m-0 font-weight-bold text-primary">NET PROFIT</h6>
                                </div>
                                <div class="card-body">
                                  <div class="chart-area">
                                    <canvas id="myLineChart">
                                        
                                    </div>
                                    
                                    </div>
                                </div>
                            </div>

                           


                        </div>

 <!--===============================Chart Ends==========================================================  -->
<!--===============================Chart Ends==========================================================  -->
<!--===============================Chart Begins==========================================================  -->
<!--===============================Chart Begins==========================================================  -->
<!--===============================Chart Begins==========================================================  -->
<!--===============================Chart Begins==========================================================  -->
<!--===============================Chart Begins==========================================================  -->
<!--===============================Chart Begins==========================================================  -->         

      



<div class="clearfix"></div>
</div>
</div>
</div>
</div>



</body>
<script src="js/side.js"type="text/javascript"></script>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<!-- script src="vendor/chart.js/chart.min.js"></script> -->

<script>
const total =(<?php echo json_encode($total)?>)
var ctx = document.getElementById('myadminBarChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Revenue', 'Cost of Sale', 'Gross Profit', 'Expenses', 'Net Profit'],
        datasets: [{
            label: 'Income Statement',
            data: total,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)'
                
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 5
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});


</script>
<script>
const net =(<?php echo json_encode($income)?>)
var ctx = document.getElementById('myLineChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [ 'Expenses', 'Net Profit'],
        datasets: [{
            label: 'NET PROFIT',
            data: net,
            backgroundColor: [
                
                'rgba(153, 102, 255, 0.2)'
                
            ],
            borderColor: [
               
                'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 10
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});


</script>


<?php include('footer.php'); ?>

</html>


























































