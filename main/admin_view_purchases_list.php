<?php require_once ('auth.php');?>
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<table class="table table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
	<thead>
		<tr>
			<th width="25%"> Description </th>
			<th width="3%"> Qty </th>
			<th width="3%"> Unit Price </th>
			<th width="8%"> Amount </th>
		</tr>
	</thead>
	<tbody>
		
			<?php
				include('../connect.php');
				$id=$_GET['iv'];
				$result = $db->prepare("SELECT * FROM purchases_item WHERE branch = '{$_SESSION['BRANCH']}' AND invoice= :userid");
				$result->bindParam(':userid', $id);
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
			?>
			<tr class="record">
			<td><?php
			$rrrrrrr=$row['name'];
			$resultss = $db->prepare("SELECT * FROM products WHERE branch = '{$_SESSION['BRANCH']}' AND product_code= :asas");
			$resultss->bindParam(':asas', $rrrrrrr);
			$resultss->execute();
			for($i=0; $rowss = $resultss->fetch(); $i++){
			echo $rowss['product_code'];
			}
			?></td>
			<td><?php echo $row['qty']; ?></td>

			<td style="text-align: right"><?php
			$rrrrrrr=$row['name'];
			$resultss = $db->prepare("SELECT * FROM products WHERE branch = '{$_SESSION['BRANCH']}' AND product_code= :asas");
			$resultss->bindParam(':asas', $rrrrrrr);
			$resultss->execute();
			for($i=0; $rowss = $resultss->fetch(); $i++){
			echo $rowss['o_price'];
			}
			?></td>

			<td style="text-align: right">
			<?php
			$dfdf=$row['cost'];
			echo formatMoney($dfdf, true);
			?>
			</td>
			</tr>
			<?php
				}
			?>
			
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
				}
				
				?>
				</strong></td>
			</tr>
		
	</tbody>
</table>