var chars = "";
for (var code = 33; code <= 126; code++){ // letters (26 + 26), digits (10) and symbols (32)
    chars+= String.fromCharCode(code)
}

var output = document.getElementById("password"); 
var generateBtn = document.getElementById("btn"); 
var copyBtn = document.getElementById("copyBtn"); 
var copyTimer = null; 

function getRandomIndex(max) {
    var limit = Math.floor(4294967296/max)*max; 
    var array = new Uint32Array(1)
    do {
        crypto.getRandomValues(array);
    } while (array[0]>=limit);
    return array[0] % max;
}

function getSelectedLength() {
    return parseInt(document.querySelector('input[name="length"]:checked').value, 10)
}

function autoResize() {
    output.style.height = "auto"; 
    var borders = output.offsetHeight - output.clientHeight; 
    output.style.height = (output.scrollHeight + borders) + "px";
}

function getPassword() {
    var passwordLength = getSelectedLength();
    var password = "";

    for (var i=0; i < passwordLength; i++) {
        password += chars.charAt(getRandomIndex(chars.length));
    }
    output.value = password; 
    autoResize();
    copyBtn.disabled = false; 
    resetCopyButton();

}

function resetCopyButton() {
    clearTimeout(copyTimer);
    copyBtn.textContent = "Copy"; 
    copyBtn.classList.remove("copied");
}

function showCopied() {
    copyBtn.textContent = "Copied"; 
    copyBtn.classList.add("copied");
    clearTimeout(copyTimer);
    copyTimer = setTimeout(resetCopyButton, 2000);
}

function copyPassword() {
    var text = output.value; 
    if (!text) return; 

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(showCopied);

    } else {
        output.select(); 
        document.execCommand("copy");
        output.setSelectionRange(0,0);
        showCopied();
    }
}

generateBtn.addEventListener("click", getPassword); 
copyBtn.addEventListener("click", copyPassword);
window.addEventListener("resize", autoResize);