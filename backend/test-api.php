<?php
header('Content-Type: application/json');
echo json_encode(['status' => 'OK', 'time' => date('Y-m-d H:i:s'), 'file' => 'test-api.php']);
