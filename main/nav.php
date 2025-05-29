
<?php
  require_once('auth.php');
?>
<head>
  <style>
   
   /* Add a black background color to the top navigation */
.topnav {
  background-color: blue;
  overflow: hidden;
}

/* Style the links inside the navigation bar */
.topnav a {
  float: left;
  display: block;
  color: #f2f2f2;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  font-size: 17px;
  background-color: blue;
  z-index: 2;
  cursor: pointer;

}

#aa {
  margin-left: 300px;

}
/* Change the color of links on hover */
.topnav a:hover {
  background-color: #ddd;
  color: black;
}

/* Add an active class to highlight the current page */
.topnav a.active {
  background-color: #04AA6D;
  color: white;
}

/* Hide the link that should open and close the topnav on small screens */
.topnav .icon {
  display: none;
} 
 /* When the screen is less than 600 pixels wide, hide all links, except for the first one ("Home"). Show the link that contains should open and close the topnav (.icon) */
@media screen and (max-width: 600px) {
  .topnav a:not(:first-child) {display: none;}
  .topnav a.icon {
    float: right;
    display: block;
  }
}

/* The "responsive" class is added to the topnav with JavaScript when the user clicks on the icon. This class makes the topnav look good on small screens (display the links vertically instead of horizontally) */
@media screen and (max-width: 600px) {
  .topnav.responsive {position: relative;}
  .topnav.responsive a.icon {
    position: absolute;
    right: 0;
    top: 0;
  }
  .topnav.responsive a {
    float: none;
    display: block;
    text-align: left;
  }

  

</style>

 <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">
    <link rel="stylesheet" type="text/css" href="css/side.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="">
  <meta name="author" content="">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

<div class="topnav" id="myTopnav">
  <a href="#home" class="active"><h4 style="font-family: britannic bold;font-style: 80px;"><span style="font-family: ravie; color: red;font-style: 80px;"><b></b></span>P<span style="font-family: impact; color: yellow;">RO</span><span style="font-family: ravie;">ma</span><span >ge</span></h4></a>
  <a id="aa"><i class="icon-user icon-large"></i> Welcome:<strong> <?php echo $_SESSION['BRANCH'];?></strong></a>
  <a id="aa"> <i class="icon-calendar icon-large">
                <?php
                $Today = date('y:m:d',time());
                $new = date('l, F d, Y', strtotime($Today));
                echo $new;
                ?></a>
        <a id="aa" href="../index.php"><font color="red"><i class="icon-off icon-large"></i></font> Log Out</a>
            
  <a href="javascript:void(0);" class="icon" onclick="myFunction()">
    <i class="fa fa-bars"></i>
  </a>
</div>
<?php include('sidebar.php')?>















<script>

  /* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
} 
  </script>