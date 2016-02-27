<?php

if(isset($_POST['action'])){
  $log = (object) null;
  $log->errors = array();
  $log->success = array();
  
    if($_POST['action'] == 'email'){
        
        $to = 'AKSELLSFLRE@gmail.com, ed@edrodriguez.com';
        $subject = 'Property Report Request';
        $message = 'Name: '.$_POST['name']."\n";
        $message .= 'Email: '.$_POST['email']."\n";
        $message .= 'Phone: '.$_POST['phone']."\n";
        $message .= 'Reason: '.$_POST['reason']."\n";
        $message .= 'Address: '.$_POST['address']."\n";
        $message .= "\n\n";
        
        if(mail($to, $subject, $message)){
            $log->success[] = 'Email sent';
        }else{
      $log->errors[] = 'Email not sent';
    }
    }
  
  if(!$log->errors && !$log->success){
    $log->errors[] = 'An unknown error occurred!';
  }
  
  header('Cache-Control: no-cache, must-revalidate');
  header('Expires: Wed, 21 May 1975 05:00:00 GMT');
  header('Content-Type: application/json');
  
  die(json_encode($log));
}
