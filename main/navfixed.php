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
  z-index: 1;
  cursor: pointer;
}
#text{
  position: absolute;
  top: 50%;
  right: 50%;
  font-size: 50px;
  color: white;
  transform: translate(-50%,-50%);
  -ms-transform: translate(-50%,-50%);
}
</style>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="">
  <meta name="author" content="">

 <div class="navbar navbar-inverse navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container-fluid">
          <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </a>
          <a class="brand" href="index.php"><h4 style="font-family: britannic bold;font-style: 80px;"><span style="font-family: ravie; color: red;font-style: 80px;"><b>M</b></span><span style="font-family: impact; color: yellow;">age</span><span style="font-family: ravie;">X</span><span >3</span></h4></a>

          <div class="nav-collapse collapse">

            <ul class="nav pull-right">
              <li><a><i class="icon-user icon-large"></i> Welcome:<strong> <?php echo $_SESSION['BRANCH'];?></strong></a></li>
			 <li><a> <i class="icon-calendar icon-large"></i>
								<?php
								$Today = date('y:m:d',time());
								$new = date('l, F d, Y', strtotime($Today));
								echo $new;
								?>

				</a></li>
              <li><a href="../index.php"><font color="red"><i class="icon-off icon-large"></i></font> Log Out</a></li>
            </ul>
          </div>
        </div>
          </div><!--/.nav-collapse -->
        </div>
      </div>
    </div>
  </head>

	