<?php
session_start();
	include('../connect.php');
	$id=$_GET['id'];
	$td=$_GET['branch'];
	
	$result = $db->prepare("DELETE FROM branch WHERE branch_id = :memid");
	$result->bindParam('memid', $id);
	$result->execute();

	



 //    $results = $db->prepare("DELETE FROM products WHERE branch = '{$td}'");
	// $results->bindParam(''{$td}'', $td);
	// $results->execute();


	$results = $db->prepare("DELETE FROM products WHERE branch = '{$td}'");
	//$results->bindParam(''{$td}'', $td);
	$results->execute();


	$resultss = $db->prepare("DELETE FROM sales WHERE branch= '{$td}'");
	//$resultss->bindParam(''{$td}'', $td);
	$resultss->execute();



	$resultsss = $db->prepare("DELETE FROM sales_order WHERE branch= '{$td}'");
	//$resultsss->bindParam(''{$td}'', $td);
	$resultsss->execute();


	$resultssss = $db->prepare("DELETE FROM employee WHERE branch= '{$td}'");
	//$resultssss->bindParam(''{$td}'', $td);
	$resultssss->execute();


	$resultsssss = $db->prepare("DELETE FROM customer WHERE branch= '{$td}'");
	//$resultsssss->bindParam(''{$td}'', $td);
	$resultsssss->execute();

	$resultssssss = $db->prepare("DELETE FROM supliers WHERE branch= '{$td}'");
	//$resultssssss->bindParam(''{$td}'', $td);
	$resultssssss->execute();
	

	$resultssssssss = $db->prepare("DELETE FROM expenselist WHERE branch= '{$td}'");
	//$resultssssssss->bindParam(''{$td}'', $td);
	$resultssssssss->execute();


	$resultsssssssss = $db->prepare("DELETE FROM purchases WHERE branch= '{$td}'");
	//$resultsssssssss->bindParam(''{$td}'', $td);
	$resultsssssssss->execute();

	$resultssssssssss = $db->prepare("DELETE FROM purchases_item WHERE branch= '{$td}'");
	//$resultssssssssss->bindParam(''{$td}'', $td);
	$resultssssssssss->execute();


	$resultsssssssssss = $db->prepare("DELETE FROM collection WHERE branch= '{$td}'");
	//$resultsssssssssss->bindParam(''{$td}'', $td);
	$resultsssssssssss->execute();

	$resultssssssssssss = $db->prepare("DELETE FROM user WHERE branch= '{$td}'");
	//$resultssssssssssss->bindParam(''{$td}'', $td);
	$resultssssssssssss->execute();
	
	$resultsssssssssssss = $db->prepare("DELETE FROM incomelist WHERE branch= '{$td}'");
	//$resultssssssssssss->bindParam(''{$td}'', $td);
	$resultsssssssssssss->execute();
	
	$resultsssssssssssssa = $db->prepare("DELETE FROM c_ledger WHERE branch= '{$td}'");
	//$resultssssssssssss->bindParam(''{$td}'', $td);
	$resultsssssssssssssa->execute();
	
	$resultsssssssssssssaa = $db->prepare("DELETE FROM s_ledger WHERE branch= '{$td}'");
	//$resultssssssssssss->bindParam(''{$td}'', $td);
	$resultsssssssssssssaa->execute();
	
	
	$resultsssssssssssssaaa = $db->prepare("DELETE FROM deposit WHERE branch= '{$td}'");
	//$resultssssssssssss->bindParam(''{$td}'', $td);
	$resultsssssssssssssaaa->execute();
	
	$resultsssssssssssssaaaa = $db->prepare("DELETE FROM withdrawal WHERE branch= '{$td}'");
	//$resultssssssssssss->bindParam(''{$td}'', $td);
	$resultsssssssssssssaaaa->execute();

header("location:  branches.php");



























?>