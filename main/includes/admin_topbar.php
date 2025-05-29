<?php
  require_once('auth.php');
?>

    <!-- Content Wrapper -->
    <div id="content-wrapper" class="d-flex flex-column">

      <!-- Main Content -->
      <div id="content">

        <!-- Topbar -->
        <nav class="navbar navbar-expand navbar-light bg-black topbar mb-4 static-top shadow">
          
      <?php
      
        include('../connect.php');
        $result = $db->prepare("SELECT * FROM branch ");
        $result->execute();
        for($i=0; $row = $result->fetch(); $i++){
        
      ?>
         <?php
}
      ?>
<button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-3">
            <i class="fa fa-bars"></i>
          </button>
     
      <font style=" font:bold 15px 'Aleo'; text-shadow:1px 1px 10px #000; color:#fff;"><center><i class="icon-user icon-large"></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo 'Admin' ?></center></font>
   
      

          <!-- Sidebar Toggle (Topbar) -->
          

          <!-- Topbar Navbar -->
          <ul class="navbar-nav ml-auto">

           

        
        <li><a href="../index.php"><font color="red"><i class="icon-off icon-large"></i></font> Log Out</a></li>

            <div class="topbar-divider d-none d-sm-block"></div>

           
          </ul>

        </nav>
        <!-- End of Topbar -->
          
        <!-- Begin Page Content -->
        <div class="container-fluid">