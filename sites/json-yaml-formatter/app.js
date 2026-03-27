/**
 * Formatter & Validator Core Logic using js-yaml
 */

function processData() {
    const inputStr = document.getElementById('raw-input').value.trim();
    const inputType = document.getElementById('input-type').value;
    const outputType = document.getElementById('output-type').value;
    
    const outputEl = document.getElementById('formatted-output');
    const errorBox = document.getElementById('error-box');
    const statusLabel = document.getElementById('status-label');
    
    if (!inputStr) {
        outputEl.innerHTML = '';
        errorBox.classList.add('hidden');
        statusLabel.textContent = 'Empty';
        statusLabel.className = 'text-muted';
        return;
    }

    let parsedObj = null;
    let detectedType = inputType;
    let errorMsg = null;

    // Phase 1: Parsing
    try {
        if (inputType === 'auto') {
            if (inputStr.startsWith('{') || inputStr.startsWith('[')) {
                parsedObj = JSON.parse(inputStr);
                detectedType = 'json';
            } else if (inputStr.startsWith('<')) {
                // simple xml check
                detectedType = 'xml';
                const parser = new DOMParser();
                const dom = parser.parseFromString(inputStr, "application/xml");
                if(dom.querySelector("parsererror")) throw new Error("Invalid XML Syntax");
                parsedObj = inputStr; // we don't convert XML to JSON directly here, just format
            } else {
                parsedObj = jsyaml.load(inputStr);
                detectedType = 'yaml';
            }
        } else if (inputType === 'json') {
            parsedObj = JSON.parse(inputStr);
        } else if (inputType === 'yaml') {
            parsedObj = jsyaml.load(inputStr);
        } else if (inputType === 'xml') {
            const parser = new DOMParser();
            const dom = parser.parseFromString(inputStr, "application/xml");
            if(dom.querySelector("parsererror")) throw new Error(dom.querySelector("parsererror").textContent);
            parsedObj = inputStr;
        }
    } catch (e) {
        errorMsg = e.message;
    }

    // Phase 2: Show Errors or Format
    if (errorMsg) {
        errorBox.textContent = `❌ Parse Error: ${errorMsg}`;
        errorBox.classList.remove('hidden');
        statusLabel.textContent = 'Invalid';
        statusLabel.className = 'text-red-500';
    } else {
        errorBox.classList.add('hidden');
        statusLabel.textContent = `Valid ${detectedType.toUpperCase()}`;
        statusLabel.className = 'text-green-500';
        
        let outStr = '';
        let langClass = 'language-json';

        if (detectedType === 'xml') {
            // Very naive XML formatting for illustration (a robust one requires more logic)
            outStr = inputStr.replace(/(>)(<)(\/*)/g, '$1\n$2$3');
            langClass = 'language-markup';
        } else {
            // JSON / YAML Outputting
            if (outputType === 'json') {
                outStr = JSON.stringify(parsedObj, null, 2);
                langClass = 'language-json';
            } else if (outputType === 'yaml') {
                outStr = jsyaml.dump(parsedObj);
                langClass = 'language-yaml';
            } else if (outputType === 'min') {
                outStr = JSON.stringify(parsedObj);
                langClass = 'language-json';
            }
        }
        
        outputEl.textContent = outStr;
        outputEl.className = langClass;
        
        if (window.Prism) {
            Prism.highlightElement(outputEl);
        }
    }
}

function copyOutput() {
    const text = document.getElementById('formatted-output').textContent;
    if (!text) return;
    navigator.clipboard.writeText(text);
    const btn = event.target;
    btn.textContent = '✅ Copied!';
    setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
}

if (typeof document !== 'undefined') {
    // We bind processData in HTML via onchange/oninput
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { processData, copyOutput };
}
