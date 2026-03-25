#!/usr/bin/php
<?php
header('Content-Type: application/json');
echo json_encode(['status' => 'CGI-TEST', 'ok' => true]);
