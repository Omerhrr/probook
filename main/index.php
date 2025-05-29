<!DOCTYPE html>
<html lang="en">
<head>

 <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="">
  <meta name="author" content="">
<?php 
require_once('auth.php');
?>



<!--User Panel-->
	<?php

$position=$_SESSION['SESS_LAST_NAME'];
if($position=='admin') {
  header("location: admin_index.php");

}
elseif($position!='admin') {
  header("location: user_index.php");



}
?>


