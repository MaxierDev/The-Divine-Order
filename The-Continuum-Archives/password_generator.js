function getPassword() {
    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var passwordLength = 10; 
    var password = ""; 
    var randomValues = new Uint32Array(passwordLength); //More cryptographically secure and relies on true hardware entropy
    crypto.getRandomValues(randomValues); 

    for (var i=0; i < passwordLength; i++) {
        password += chars.charAt(randomValues[1] % chars.length);
    }
    document.getElementById("password").value = password;

}