<?php


?>
<!DOCTYPE html>
<html lang="en">

<head>
  
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="">
  <meta name="author" content="">

  <title>PROBOOK</title>
  <link rel="icon" href="https://www.freeiconspng.com/uploads/sales-icon-7.png">

  <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">

  <!-- Custom styles for this template-->

</head>
<style>
 /* The sidebar menu */
.sidebar {
  height: 100%; /* 100% Full-height */
  width: 0; /* 0 width - change this with JavaScript */
  position: fixed; /* Stay in place */
  z-index: 1; /* Stay on top */
  top: 0;
  left: 0;
  background-color: #111; /* Black*/
  overflow-x: hidden; /* Disable horizontal scroll */
  padding-top: 60px; /* Place content 60px from the top */
  transition: 0.5s; /* 0.5 second transition effect to slide in the sidebar */
}

/* The sidebar links */
.sidebar a {
  padding: 8px 8px 8px 32px;
  text-decoration: none;
  font-size: 25px;
  color: #818181;
  display: block;
  transition: 0.3s;
}

/* When you mouse over the navigation links, change their color */
.sidebar a:hover {
  color: #f1f1f1;
}

/* Position and style the close button (top right corner) */
.sidebar .closebtn {
  position: absolute;
  top: 0;
  right: 25px;
  font-size: 36px;
  margin-left: 50px;
}

/* The button used to open the sidebar */
.openbtn {
  font-size: 20px;
  cursor: pointer;
  background-color: #111;
  color: white;
  padding: 10px 15px;
  border: none;
}

.openbtn:hover {
  background-color: #444;
}

/* Style page content - use this if you want to push the page content to the right when you open the side navigation */
#main {
  transition: margin-left .5s; /* If you want a transition effect */
  padding: 20px;
}

/* On smaller screens, where height is less than 450px, change the style of the sidenav (less padding and a smaller font size) */
@media screen and (max-height: 450px) {
  .sidebar {padding-top: 15px;}
  .sidebar a {font-size: 18px;}
} 

</style>












<div id="mySidebar" class="sidebar">
  <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
  <a href="javascript:void(0)" class="openbtn" onclick="openNav()">&#9776;</a><br>
  <a href="index.php"><i class="icon-dashboard icon-2x"></i> Dashboard </a> 
  <ul class="nav nav-list">
              
                  
      <li><a href="products.php"><i class="icon-list-alt icon-2x"></i> Inventory and WareHousing</a>  </li><br>

      <a class="dropdown-btn">Sales and Customers Management
    <i class="fa fa-caret-down"></i>
  </a>
  <div class="dropdown-container">
          <li><a href="sales.php?id=cash-&invoice=<?php echo $finalcode ?>"><i class="icon-shopping-cart icon-2x"></i> Sales</a>  </li> <br>
      <li><a href="sales_inventory.php?d1=0&d2=0"><i class="icon-bar-chart icon-2x"></i> Sales Summary</a>                </li>  <br>      <li><a href="salesreport.php?d1=0&d2=0"><i class="icon-bar-chart icon-2x"></i> Sales Report</a>                </li><br>
            <li><a href="customer.php"><i class="icon-group icon-2x"></i> Customers</a>                                    </li>
  </div><br>



  <a class="dropdown-btn">Purchases and Suppliers Management
    <i class="fa fa-caret-down"></i>
  </a>
  <div class="dropdown-container">
          <li><a href="purchaseslist.php?d1=0&d2=0"><i class="icon-inbox icon-large"></i> Purchases</a>                </li><br>
      <li><a href="purchasereport.php?d1=0&d2=0"><i class="icon-inbox icon-large"></i> Purchases Report</a>                </li><br>
      <li><a href="supplier.php"><i class="icon-group icon-2x"></i> Suppliers</a>
  </div><br>
  


      <a class="dropdown-btn">Expenditure Management 
    <i class="fa fa-caret-down"></i>
  </a>
  <div class="dropdown-container">
        
      <li><a href="newexpenses.php"><i class="icon-group icon-2x"></i> Add Expenses</a>                                    </li><br>
      <li><a href="expensesreport.php?d1=0&d2=0"><i class="icon-group icon-2x"></i> Expenses Report</a>                                    </li><br>
  </div><br>

  <a class="dropdown-btn">Banking and Finance
    <i class="fa fa-caret-down"></i>
  </a>
  <div class="dropdown-container">
        
      <li><a href="debit.php"><i class="icon-inbox icon-2x"></i>Debit</a>     </li><br>
      <li><a href="credit.php"><i class="icon-list icon-2x"></i>Credit</a>           </li><br>
      <li><a href="cashbook.php"><i class="icon-group icon-2x"></i>Cashbook</a>       </li><br>
  </div><br>
  <li><a href="income_statement.php"><i class="icon-list-alt icon-2x"></i>Income Statement</a></li><br>

      <br><br><br><br>    
      <li>
       <div class="hero-unit-clock">
    
      <form name="clock">
      <font color="white">Time: <br></font>&nbsp;<input style="width:150px;" type="submit" class="trans" name="face" value="">
      </form>
        </div>
      </li>
        </ul>                               
          </div>
        </div>
      </div>

      

<script>
  
  /* Set the width of the sidebar to 250px and the left margin of the page content to 250px */
function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("mySidebar").margin-left = "250px";
  
}

/* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
function closeNav() {
  document.getElementById("mySidebar").style.width = "0px";
  document.getElementById("mySidebar").margin-left = "0px";
  
} 
</script>