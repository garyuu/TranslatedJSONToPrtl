const fs = require('fs');
const DOMParser = new (require('xmldom').DOMParser)();
const XMLSerializer = new (require('xmldom').XMLSerializer)();

const Config = require('./config.json');

const OutputPath = __dirname + "/output";
const RawOutputPath = OutputPath + "/raw_0";
const RawDataListPath = RawOutputPath + "/list.json";

const dataList = require(RawDataListPath);

class PrtlMiddler {
    constructor() {
        console.log("Setting prtl middle...");
        for (let i of dataList) {
            const prtl = fs.readFileSync(RawOutputPath + "/" + i + "_raw.prtl", 'utf16le');
            const dom = DOMParser.parseFromString(prtl);
            const textChains = dom.getElementsByTagName('TextChain');
            const width = textChains[0].getElementsByTagName('Size')[0].getElementsByTagName('x')[0].textContent;

            textChains[0].getElementsByTagName('Position')[0].getElementsByTagName('x')[0].textContent = ((1280.0 - width) / 2.0).toFixed(2);
            const XPoses = textChains[0].getElementsByTagName('XPos');
            for (let j = 0; j < XPoses.length; j++) {
                console.log(XPoses[j].textContent + " " + j);
                XPoses[j].textContent = ((1280.0 - width) / 2.0).toFixed(2);
            }

            let output = XMLSerializer.serializeToString(dom);

            const filePath = OutputPath + "/" + i + ".prtl";
            fs.writeFileSync(filePath, output, 'utf16le');
        }
    }
}

let Middler = new PrtlMiddler();
