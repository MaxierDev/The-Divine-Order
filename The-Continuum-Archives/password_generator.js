var LAYERS = [
    {
        name: "Basic ASCII", 
        ranges: [[0x20, 0x7E]] }, 
    {
        name: "Basic ASCII & Extended Latin", 
        ranges: [[0x20, 0x24F]] }, 
    {
        name: "Mathematical, Technical & Alchemcial Symbols", 
        ranges: [[0x2200, 0x23FF], [0x27C0, 0x27EF], [0x2980, 0x2AFF], [0x1D400, 0x1D7FF], [0x1F700, 0x1F77F]]},
    {
        name: "Ancient & Historic Scripts", 
        assignedOnly: true,
        ranges: [[0x16A0, 0x16FF], [0x10000, 0x1345F]]}, 
    {
        name: "Global Living Scripts", 
        assignedOnly: true,
        ranges: [[0x20, 0xD7FF], [0x20000, 0x323AF]]}, 
    {
        name: "Emojis", 
        ranges: [[0x2600, 0x27BF], [0x1F300, 0x1FAFF], [0xFE0F, 0xFE0F]]},
    {
        name: "Adversarial Unicode & Control Characters",
        
        ranges: [[0x0, 0x1F], [0x7F, 0x9F], [0x300, 0x36F], [0x200B, 0x200F], [0x202A, 0x202E], [0xE0000, 0xE007F]]},
    {
        name: "All of the Above", 
        assignedOnly: true,
        ranges: [[0x0, 0xD7FF], [0xE000, 0x10FFFF]]},
        
]

LAYERS.forEach(function (layer) {
    layer.total = 0; 
    layer.ranges.forEach(function (r) {
        layer.total += r[1] - r[0] +1; 
    })
});

var layerSelect = document.getElementById("layer"); 
var layerInfo = document.getElementById("layerInfo"); 
var output = document.getElementById("password"); 
var generateBtn = document.getElementById("btn"); 
var copyBtn = document.getElementById("copyBtn"); 
var statusLine = document.getElementById("status");
var copyTimer = null; 
var CurrentPassword = ""; 

LAYERS.forEach(function (layer, i) {
    var option = document.createElement("option"); 
    option.value = i; 
    option.textContent = i + " \u00b7 " + layer.name; 
    layerSelect.appendChild(option); 
}); 

function hex(n) {
    return "U+" + n.toString(16).toUppercase().padStart(4, "0");
}

function getSelectedlayer() {
    return LAYERS[parseInt(layerSelect.value, 10)];
}



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
    var layer = getSelectedlayer();
    var passwordLength = getSelectedLength();
    var parts = [];

    for (var i=0; i < passwordLength; i++) {
        parts.push(String.fromCodePoint(getRandomCodepoint(layer)));
    }

    CurrentPassword = parts.join(""); 
    output.value = CurrentPassword; 
    autoResize();

    var bytes = new TextEncoder().encode(CurrentPassword).length; 
    var entropy = Math.round(passwordLength * Math.log2(layer, total)); 
    statusLine.textContent = passwordLength + "characters \u00B7 " + bytes.toLocaleString() + " bytes in UTF-8 \u00B7 about " + entropy.toLocaleString() + " bits of entropy";


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
    if (!CurrentPassword) return; 

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(CurrentPassword).then(showCopied);

    } else {
        output.select(); 
        document.execCommand("copy");
        output.setSelectionRange(0,0);
        showCopied();
    }
}

function updateLayerInfo() {
    var layer = getSelectedlayer(); 
    var ranges = layer.ranges.map(function (r) {
        return r[0] === r[1] ? hex(r[0]) : hex(r[0]) + "\u2013" + hex(r[1]);
    }).join(", ")
    var bits = Math.log2(layer.total).toFixed(2);

    layerInfo.textContent = ranges + " \u00B7 " + layer.total.toLocaleString() +
    " possible characters (" + bits + " bits each)." + (layer.note ? " " + layer.note : "");
}

var assigned = /^[^\p{Cn}\p{Co}\p{Cs}]$/u; 

function getRandomCodepoint(layer) {
    while (true) {
        var n = getRandomIndex(layer.total); 
        var cp = null; 
        for (var i = 0; i < layer.ranges.length; i++) {
            var size = layer.ranges [i][1] - layer.ranges[i][0] + 1; 
            if (n < size) { cp = layer.ranges[i][0] + n; break;}
            n -= size; 
        }
        if (!layer.assignedOnly || assigned.test(String.fromCodePoint(cp))) {
            return cp; 
        }
    
    }


}


layerSelect.addEventListener("change", updateLayerInfo)
generateBtn.addEventListener("click", getPassword); 
copyBtn.addEventListener("click", copyPassword);
window.addEventListener("resize", autoResize);

updateLayerInfo(); 