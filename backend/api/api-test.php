<?php  
// Teste API  
header('Content-Type: application/json');  
echo json_encode(['status' => 'OK', 'time' => date('Y-m-d H:i:s')]); 
