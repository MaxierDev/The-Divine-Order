var password = '';
var pass1='legend';
password = prompt('Please enter your password!'); 
if (password == pass1)
    alert('Password Correct! click OK to enter!')
else {
    alert('Incorrect password. Please try again by refreshing.')
}

function getPassword() {
    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var passwordLength = 10; 
    password = ""; 
    for (var i=0; i < passwordLength; i++) {
        var randomNumber = Math.floor(Math.random() * chars.length); 
        password += chars.substring(randomNumber, randomNumber+1)
    }
    document.getElementById("password").value = password;

}