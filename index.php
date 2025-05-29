<?php
	//Start session
	session_start();
	
	//Unset the variables stored in session
	unset($_SESSION['SESS_MEMBER_ID']);
	unset($_SESSION['SESS_FIRST_NAME']);
	unset($_SESSION['SESS_LAST_NAME']);
?>
<html>
<head>
<title>
PROBOOK
</title>
    <link rel="shortcut icon" href="main/images/pos.jpg">

 
  <link href="styless.css" media="screen" rel="stylesheet" type="text/css" />
  <link rel="stylesheet" href="main/css/font-awesome.min.css">
    
  


</head>
<!--div class="position-relative">
  
  <img class="bg obj-fit-cover" src="acc.jpg" alt="...">
</div-->
<body>
    
		
<div class="container"  id="login">
<?php
if( isset($_SESSION['ERRMSG_ARR']) && is_array($_SESSION['ERRMSG_ARR']) && count($_SESSION['ERRMSG_ARR']) >0 ) {
	foreach($_SESSION['ERRMSG_ARR'] as $msg) {
		echo '<div style="color: red; text-align: center;">',$msg,'</div><br>'; 
	}
	unset($_SESSION['ERRMSG_ARR']);
}
?>

<div class="login-form" action="login.php" method="post">
	<form action="login.php" method="post">


			<marquee><h3><font style=" font:bold 44px 'Aleo'; text-shadow:1px 1px 15px #000; color:#fff;"><center><span style="color: red;">P</span>RO<span style="color: blue;">B</span>OO<span style="color: green;">K</span></span></center></font></h3></marquee><br>
		

	<!--form action="login.php" method="post"-->	
<div class="input-prepend">
		<b><input type="text" name="username" Placeholder="Username" required/></b> <br>
</div>


<div class="input-prepend">
	<b><input type="password"  name="password" Placeholder="Password" required/></b><br>
</div>
	
		<div class="qwe">
		 <button class="btn btn-large btn-primary btn-block pull-right" href="dashboard.html" type="submit"><i class="icon-signin icon-large"></i> Login</button>
		</div>
	</form>
		</div>
		 </div>

		 <!--/form-->

</div>
</div>
</div>
</div>
<marquee><img class="bg obj-fit-cover" src=""  alt=""></marquee>
</body>

</html>