<?php
/* Database config */
$db_host		= 'localhost';
$db_user		= 'probookc_probook';
$db_pass		= '078952Umar-python';
$db_database	= 'probookc_probook'; 

/* End config */

$db = new PDO('mysql:host='.$db_host.';dbname='.$db_database, $db_user, $db_pass);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

?>