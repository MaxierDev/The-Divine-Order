var LAYERS = [
    {
        name: "Basic ASCII", 
        ranges: [[0x20, 0x7E]] }, 
    {
        name: "Basic ASCII & Extended Latin", 
        ranges: [[0x20, 0x24F]] }, 
    {
        name: "Mathematical, Technical & Alchemical Symbols", 
        ranges: [[0x2200, 0x23FF], [0x27C0, 0x27EF], [0x2980, 0x2AFF], [0x1D400, 0x1D7FF], [0x1F700, 0x1F77F]]},
    {
        name: "Box Drawing, Block Elements & Braille",
        ranges: [[0x2500, 0x259F], [0x2800, 0x28FF]],},
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

var layerList = document.getElementById("layerList");
var layerInfo = document.getElementById("layerInfo"); 
var output = document.getElementById("password"); 
var generateBtn = document.getElementById("btn"); 
var copyBtn = document.getElementById("copyBtn"); 
var statusLine = document.getElementById("status");
var copyTimer = null; 
var CurrentPassword = ""; 
var layerBoxes = []; 
var pool = { ranges: [], total: 0}; 
var assigned = /^[^\p{Cn}\p{Co}\p{Cs}]$/u; 

var ALL_INDEX = LAYERS.length - 1; 


function sumRanges(ranges) {
    var total = 0; 
    ranges.forEach(function (r){
        total += r[1] - r[0] + 1; 
    })
    return total; 
}

function keepAssigned(ranges) {
    var out = []; 
    ranges.forEach(function (r) {
        var start = null; 
        for (var cp = r[0]; cp <= r[1]; cp++){
            if (assigned.test(String.fromCodePoint(cp))) {
                if (start === null) start = cp;
            } else if (start !== null) {
                out.push([start, cp - 1]); 
                start = null; 
            }
        }
        if (start !== null) out.push ([start, r[1]])
    }); 
    return out; 
}

LAYERS.forEach(function (layer) {
    layer.effective = layer.assignedOnly ? keepAssigned(layer.ranges) : layer.ranges; 
    layer.total = sumRanges(layer.effective);
});

function mergeRanges(ranges) {
    var sorted = ranges.map(function (r) { return [r[0], r[1]]; }).sort(function (a, b) { return a[0] - b[0]; });
    var merged = [];
    sorted.forEach(function (r) {
        var last = merged[merged.length -1];
        if (last && r[0] <= last[1] + 1){
            last[1] = Math.max(last[1], r[1]); 
        } else {
            merged.push(r);
        }
    });
    return merged; 
}


LAYERS.forEach(function (layer, i) {
    var label = document.createElement("label"); 
    label.className = "layerItem"; 

    var box = document.createElement("input"); 
    box.type = "checkbox"; 
    box.value = i; 
    if (i === 0) box.checked = true; 

    var name = document.createElement("span"); 
    name.textContent = i + " \u00B7 " + layer.name; 

    var count = document.createElement("small"); 
    count.textContent = layer.total.toLocaleString(); 

    label.appendChild(box); 
    label.appendChild(name); 
    label.appendChild(count); 
    layerList.appendChild(label); 
    layerBoxes.push(box); 
}); 

function hex(n) {
    return "U+" + n.toString(16).toUpperCase().padStart(4, "0");
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
    if (pool.total === 0) return; 

    var passwordLength = getSelectedLength();
    var parts = [];

    for (var i=0; i < passwordLength; i++) {
        parts.push(String.fromCodePoint(getRandomCodepoint()));
    }

    CurrentPassword = parts.join(""); 
    output.value = CurrentPassword; 
    autoResize();

    var bytes = new TextEncoder().encode(CurrentPassword).length; 
    var entropy = Math.round(passwordLength * Math.log2(pool.total)); 
    statusLine.textContent = passwordLength + " characters \u00B7 " + bytes.toLocaleString() + " bytes in UTF-8 \u00B7 about " + entropy.toLocaleString() + " bits of entropy";


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




function getRandomCodepoint() {
    var n = getRandomIndex(pool.total); 
    for (var i = 0; i < pool.ranges.length; i++) {
        var size = pool.ranges[i][1] - pool.ranges[i][0] + 1; 
        if (n < size) {
            return pool.ranges[i][0] + n; 
        }
        n -= size; 
    }
}

function getRandomIndex(max) {
    var limit = Math.floor(4294967296/max)*max; 
    var array = new Uint32Array(1)
    do {
        crypto.getRandomValues(array);
    } while (array[0]>=limit);
    return array[0] % max;
}


function updatePool() {
    var allChecked = layerBoxes[ALL_INDEX].checked; 

    layerBoxes.forEach(function (box, i){
        box.disabled = allChecked && i !== ALL_INDEX; 
    }); 

    var chosen = [];
    var notes = []; 
    layerBoxes.forEach(function (box, i) {
        var active = allChecked ? i === ALL_INDEX : box.checked; 
        if (active) {
            chosen.push(i); 
            if (LAYERS[i].note) notes.push(LAYERS[i].note);
        }
    });

    var ranges = []; 
    chosen.forEach(function (i) {
        ranges = ranges.concat(LAYERS[i].effective); 
    }); 

    pool.ranges = mergeRanges(ranges); 
    pool.total = sumRanges(pool.ranges);

    generateBtn.disabled = pool.total === 0; 

    if (pool.total === 0) {
        layerInfo.textContent = "Select at least one layer."; 
        return; 
    }

    var rangeText = pool.ranges.map(function (r){
        return r[0] === r[1] ? hex(r[0]) : hex(r[0]) + "\u2013" + hex(r[1]); }).join(", "); 

    var bits = Math.log2(pool.total).toFixed(2);

    layerInfo.textContent = chosen.length + (chosen.length === 1? " layer" : " layers") + " \u00b7 " + pool.total.toLocaleString() + " possible characters (" + bits + " bits each) \u00B7 " + rangeText + (notes.length ? " \u00B7 " + notes.join(" ") : ""); 

}


layerList.addEventListener("change", updatePool)
generateBtn.addEventListener("click", getPassword); 
copyBtn.addEventListener("click", copyPassword);
window.addEventListener("resize", autoResize);

updatePool(); 

