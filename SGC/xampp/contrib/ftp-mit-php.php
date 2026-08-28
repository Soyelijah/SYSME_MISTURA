<?php
$host="localhost";
$user="zaphod";
$password="blabla";

// Herstellen der Basis-Verbindung
$conn_id = ftp_connect($host); 

// Einloggen mit Benutzername und Kennwort
$login_result = ftp_login($conn_id, $user, $password); 

// Verbindung �berpr�fen
if ((!$conn_id) || (!$login_result)) { 
        echo "Ftp-Verbindung nicht hergestellt!";
        echo "Verbindung mit $host als Benutzer $user nicht m�glich"; 
        die; 
    } else {
        echo "Verbunden mit $host als Benutzer $user";
    }

print "<br>";
$path="/";
$dir = "";
///// List  
$files=ftp_nlist($conn_id, "$path");
foreach ($files as $file) {
 $isfile = ftp_size($conn_id, $file); 
 if($isfile == "-1") { // Ist ein Verzeichnis
  print $file."/ [DIR]<br>";
 }
 else {
  $filelist[(count($filelist)+1)] = $file; // Ist eine Verzeichnis
  print $file."<br>";
 }
}


///// Upload 
// ftp_put($conn_id, $remote_file_path, $local_file_path, FTP_BINARY);
 
///// Download
// ftp_get($conn_id, $local_file_path, $remote_file_path, FTP_BINARY); 

///// L�schen einer Datei
// ftp_delete ($conn_id, $remote_file_path); 


// Schlie�en des FTP-Streams
ftp_quit($conn_id); 
?>
