<?php
  require_once('auth.php');
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <style type="text/css">
#overlay {
  position: fixed;
  display: none;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  
  background-color: rgba(0,0,0,0.1);
  z-index: 2;
  cursor: pointer;
}
#text{
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 50px;
  color: white;
  transform: translate(-50%,-50%);
  -ms-transform: translate(-50%,-50%);
}
</style>
   <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="">
  <meta name="author" content="">

  <title>PROBOOK</title>
  <link rel="icon" href="https://www.freeiconspng.com/uploads/sales-icon-7.png">
  <link rel="stylesheet" type="text/css" href="css/side.css">
  <link href="vendor/datatables/dataTables.bootstrap4.min.css" rel="stylesheet">

  <!-- Custom fonts for this template-->
  <link href="vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">

  <!-- Custom styles for this template-->
  <link href="css/sb-admin-2.min.css" rel="stylesheet">

  <!-- Custom styles for this page -->
  <link href="vendor/datatables/dataTables.bootstrap4.min.css" rel="stylesheet">
</head>

<body id="page-top">
          
  <!-- Page Wrapper -->
  <div id="wrapper">

    <!-- Sidebar -->
    <ul class="navbar-nav bg-danger sidebar sidebar-dark accordion" id="accordionSidebar">

      <!-- Sidebar - Brand -->
      <a class="sidebar-brand d-flex align-items-center justify-content-center" href="index.php">
        <div class="sidebar-brand-icon rotate-n-15">
          <i class="icon-dashboard"></i>
        </div>
        <div class="sidebar-brand-text mx-3">PROBOOK</div>
      </a>

      <!-- Divider -->
      <hr class="sidebar-divider my-0">

      <!-- Nav Item - Dashboard -->
      <li class="nav-item">
        <a class="nav-link" href="index.php">
          <i class="fas fa-fw fa-home"></i>
          <span>Dashboard</span></a>
      </li>
      <!-- Divider -->
      <hr class="sidebar-divider">

      
      <!-- Tables Buttons -->
      <li class="nav-item">
        <a class="nav-link" href="admin_inventory.php?branch=0">
          <i class="fas fa-fw fa-archive"></i>
          <span>Inventory</span></a>
      </li>
      <hr class="sidebar-divider">
      <!--Sale-->

      <button style="font-size: 15px;" class="dropdown-btn">Sales & Purchases
    <i class="fa fa-caret-down"></i>
  </button>
  <div class="dropdown-container">
      
      
      <li class="nav-item">
        <a class="nav-link" href="admin_sale.php?branch=0">
          <i class="fa fa-university" aria-hidden="true"></i>
          <span>Sales Summary</span></a>
      </li>

      <li class="nav-item">
        <a class="nav-link" href="admin_sales_report.php?branch=0&d1=0&d2=0">
          <i class="fa fa-bug" aria-hidden="true"></i>
          <span>Sales Reports</span></a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="admin_purchases.php?branch=0">
          <i class="fa fa-university" aria-hidden="true"></i>
          <span>Purchases Summary</span></a>
      </li>

      <li class="nav-item">
        <a class="nav-link" href="admin_purchases_report.php?branch=0&d1=0&d2=0">
          <i class="fa fa-bug" aria-hidden="true"></i>
          <span>Purchases Reports</span></a>
      </li>

      <li class="nav-item">
        <a class="nav-link" href="adminOtherIncome.php">
          <i class="fa fa-bug" aria-hidden="true"></i>
          <span>Other Incomes</span></a>
      </li>
      
    </div><br>
    <hr class="sidebar-divider">
<!--Sale-->

<!--Purchases-->

 <button style="font-size: 15px;" class="dropdown-btn">Expenses
    <i class="fa fa-caret-down"></i>
  </button>
  <div class="dropdown-container">
      <li class="nav-item">
        <a class="nav-link" href="admin_create_expenses.php">
          <i class="fa fa-table" aria-hidden="true"></i>
          <span>Add Expenses</span></a>
      </li>
      
      <li class="nav-item">
        <a class="nav-link" href="admin_expenses.php?branch=0">
          <i class="fa fa-university" aria-hidden="true"></i>
          <span>Expenses Summary</span></a>
      </li>

      <li class="nav-item">
        <a class="nav-link" href="admin_expenses_report.php?branch=0&d1=0&d2=0">
          <i class="fa fa-bug" aria-hidden="true"></i>
          <span>Expenses Reports</span></a>
      </li>
      
    </div><br>
<hr class="sidebar-divider">
<button style="font-size: 15px;"class="dropdown-btn">Ledgers 
    <i class="fa fa-caret-down"></i>
  </button>
  <div class="dropdown-container">
    <li class="nav-item">
        <a class="nav-link" href="admin_cashbook.php?branch=0">
          <i class="fa fa-book" aria-hidden="true"></i>
          <span>Cashbook</span></a>
      </li>
     
      <li class="nav-item">
        <a class="nav-link" href="admin_customer_ledger.php?branch=">
          <i class="fa fa-credit-card"></i> 

          <span>Customer Ledger</span></a>
      </li>
      
      <li class="nav-item">
        <a class="nav-link" href="admin_supplier_ledger.php?branch=">
          <i class="fa fa-credit-card" ></i>

          <span>Supplier Ledger</span></a>
      </li>
     
     

      
      <li class="nav-item">
        <a class="nav-link" href="admin_accountreceivables.php?branch=">
          <i class="fa fa-credit-card"></i>

          <span>Accounts Recievables</span></a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="admin_accountpayables.php?branch=">
          <i class="fa fa-credit-card"></i>

          <span>Accounts Payables</span></a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="admin_incomeStatement.php?branch=0">
          <i class="fas fa-fw fa-table"></i>
          <span>Income Statements</span></a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="admin_incomeStatementReport.php?branch=0&d1=0&d2">
          <i class="fas fa-fw fa-table"></i>
          <span>Income Statement Reports</span></a>
      </li>

      
      
    </div><br>
    <!--Expenditure-->

 <hr class="sidebar-divider">
    <!--Expenditure-->
    <button style="font-size: 15px;" class="dropdown-btn">Banking
    <i class="fa fa-caret-down"></i>
  </button>
  <div class="dropdown-container">
      <li class="nav-item">
        <a class="nav-link" href="admin_create_bank.php">
          <i class="fa fa-table" aria-hidden="true"></i>
          <span>Add Bank Account</span></a>
      </li>
      
      <li class="nav-item">
        <a class="nav-link" href="admin_deposit.php?branch=0">
          <i class="fa fa-university" aria-hidden="true"></i>
          <span>Deposits Summary</span></a>
      </li>

 <li class="nav-item">
        <a class="nav-link" href="admin_withdrawal.php?branch=0">
          <i class="fa fa-university" aria-hidden="true"></i>
          <span>Withdrawals Summary</span></a>
      </li>

      <li class="nav-item">
        <a class="nav-link" href="admin_bank_statement.php?branch=0&d1=0&d2=0">
          <i class="fa fa-bug" aria-hidden="true"></i>
          <span>Bank Statements</span></a>
      </li>
      
    </div><br>
<hr class="sidebar-divider">


    

 <button style="font-size: 15px;" class="dropdown-btn">Accounts
    <i class="fa fa-caret-down"></i>
  </button>
  <div class="dropdown-container">
      <li class="nav-item">
        <a class="nav-link" href="branches.php">
          <i class="fa fa-child" aria-hidden="true"></i>

          <span>Branches</span></a>
      </li>
      
      <li class="nav-item">
        <a class="nav-link" href="employee.php">
          <i class="fa fa-users" aria-hidden="true"></i>

          <span>Employees</span></a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="accounts.php">
          <i class="fa fa-cog" aria-hidden="true"></i>

          <span>User Accounts</span></a>
      </li>
      
      
      
      
    </div><br>

    <hr class="sidebar-divider">

      
     
      <!-- Divider -->
      <hr class="sidebar-divider d-none d-md-block">

      
      
       <li class="nav-item">
        <a class="nav-link" href="../index.php">
          <i style="color: red;"class="icon-off icon-large"></i>
          <span> Log Out</span></a>
      </li>
 

      <!-- Sidebar Toggler (Sidebar) -->
      <div class="text-center d-none d-md-inline">
        <button class="rounded-circle border-0" id="sidebarToggle"></button>
      </div>
<hr class="sidebar-divider">
    </ul>
  <?php include_once 'admin_topbar.php'; ?>
    <!-- End of Sidebar -->
    