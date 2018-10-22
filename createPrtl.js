const fs = require('fs');
const DOMParser = new (require('xmldom').DOMParser)();
const XMLSerializer = new (require('xmldom').XMLSerializer)();

const Config = require('./config.json');

const TemplatePath = __dirname + "/ScriptTemplates"
const OutputPath = __dirname + "/output";
const RawOutputPath = OutputPath + "/raw_0";
const RawDataListPath = RawOutputPath + "/list.json";
let json = "";

class PrtlGenerator {
    constructor(obj) {
        console.log("Start generation...");
        this.rawDataList = [];
        this.subId = 0;
        if (obj.ver != undefined) {
            switch (obj.ver) {
            case 2:
            case 1:
                this.data = obj;
                this.outputDir = this.data.title;
                for (let i = 0; i < this.data.groups.length; i++) {
                    for (let j = 0; j < this.data.groups[i].contents.length; j++) {
                        this.generate(i, j);
                    }
                }
                break;
            default:
                console.log("Unknown version of JSON data!");
            }
            fs.writeFileSync(RawDataListPath, JSON.stringify(this.rawDataList), 'utf8');
        }
        else {
            console.log("JSON with incorrect data!");
        }
    }

    generate(i, j) {
        this.subId++;
        console.log(this.subId);
        const subtitle = this.data.groups[i].contents[j];
        if (!subtitle.isRender)
            return;
        switch(subtitle.type) {
            case 0:
                this.dialog(subtitle);
                break;
            case 1:
                this.comment(subtitle);
                break;
            case 2:
                this.infomation(subtitle);
                break;
            case 3:
                this.haigu(subtitle);
                break;
            case 4:
                this.battle(subtitle);
                break;
            default:
                console.log("Unknown type " + subtitle.type);
        }
    }

    findTemplatePath(type, size, rowCount) {
        let name = type;
        if (size !== undefined) {
            if (rowCount !== undefined) {
                name += '_' + rowCount;
                if (rowCount == 2) {
                    if (size > 2)
                        name += '_2';
                    else if (size < 1)
                        name += '_1';
                    else
                        name += '_' + size;
                }
                else
                    name += '_' + size;
            }
            else {
                if (type == 1) {
                    if (size > 2)
                        name += '_2';
                    else
                        name += '_' + size;
                }
                if (type == 2) {
                    if (size > 1)
                        name += '_1';
                    else
                        name += '_' + size;
                }
            }
        }
        return TemplatePath + '/' + name + '.prtl';
    }

    setRunCount(element) {
        element.parentNode.getElementsByTagName('CharacterAttributes')[0].setAttribute("RunCount", element.textContent.length + 1);
    }

    writePrtl(filename, content, raw=false) {
        if (raw) {
            const filePath = RawOutputPath + "/" + filename + "_raw" + ".prtl";
            fs.writeFileSync(filePath, content, 'utf16le');
        }
        else {
            const filePath = OutputPath + "/" + filename + ".prtl";
            fs.writeFileSync(filePath, content, 'utf16le');
        }
    }

    removeHideMark(str) {
        return str.replace(/[\[\]']+/g, '');
    }

    dialog(subtitle) {
        this.rawDataList.push(this.subId);
        let lines;
        if (subtitle.content !== undefined)
            lines = subtitle.content.trim().split(/\r?\n/);
        else
            lines = [" "];
        let text = fs.readFileSync(this.findTemplatePath(subtitle.type, subtitle.size, lines.length), 'utf16le');
        const dom = DOMParser.parseFromString(text);
        const textChains = dom.getElementsByTagName('TextChain');

        /* Content */
        const strTags = textChains[0].getElementsByTagName('TRString');
        for (let i = 0; i < lines.length; i++) {
            strTags[i].textContent = this.removeHideMark(lines[i]);
            this.setRunCount(strTags[i]);
        }

        /* Name */
        const strTag = textChains[1].getElementsByTagName('TRString')[0];
        strTag.textContent = subtitle.title;
        this.setRunCount(strTag);
        const color = Config.colors[subtitle.color];
        const redTags = dom.getElementsByTagName('red');
        for (let i in redTags) {
            if (redTags[i].textContent == "232") {
                redTags[i].textContent = color[0];
                redTags[i].parentNode.getElementsByTagName('green')[0].textContent = color[1];
                redTags[i].parentNode.getElementsByTagName('blue')[0].textContent = color[2];
            }
        }

        let output = XMLSerializer.serializeToString(dom);
        this.writePrtl(this.subId, output, true);
    }

    comment(subtitle) {
        let text = fs.readFileSync(this.findTemplatePath(subtitle.type, subtitle.size), 'utf16le');
        const dom = DOMParser.parseFromString(text);
        const textChain = dom.getElementsByTagName('TextChain')[0];

        /* Content */
        let lines;
        if (subtitle.content !== undefined)
            lines = subtitle.content.trim().split(/\r?\n/);
        else
            lines = [" "];
        // Create nodes
        const strNode = textChain.getElementsByTagName('TextLine')[0];
        let objID = parseInt(strNode.getAttribute('objectID'));
        let prsID = parseInt(strNode.getAttribute('persistentID'));
        for (let i = 1; i < lines.length; i++) {
            const newNode = strNode.cloneNode(true);
            newNode.setAttribute('objectID', ++objID)
            newNode.setAttribute('persistentID', ++prsID)
            textChain.appendChild(newNode);
        }

        // Fill in contents
        const strTags = textChain.getElementsByTagName('TRString');
        for (let i = 0; i < lines.length; i++) {
            if (i != lines.length - 1)
                strTags[i].setAttribute('TXMarker', "Booyah");
            
            strTags[i].textContent = lines[i];
            this.setRunCount(strTags[i]);
        }

        // Change color
        const color = Config.colors[subtitle.color];
        const redTags = dom.getElementsByTagName('red');
        for (let i in redTags) {
            if (redTags[i].textContent == "232") {
                redTags[i].textContent = color[0];
                redTags[i].parentNode.getElementsByTagName('green')[0].textContent = color[1];
                redTags[i].parentNode.getElementsByTagName('blue')[0].textContent = color[2];
            }
        }

        let output = XMLSerializer.serializeToString(dom);
        this.writePrtl(this.subId, output);
    }

    infomation(subtitle) {
        let text = fs.readFileSync(this.findTemplatePath(subtitle.type, subtitle.size), 'utf16le');
        const dom = DOMParser.parseFromString(text);
        const textChains = dom.getElementsByTagName('TextChain');

        /* Title */
        const strTag = textChains[0].getElementsByTagName('TRString')[0];
        strTag.textContent = subtitle.title;
        this.setRunCount(strTag);
    
        /* Content */
        let lines;
        if (subtitle.content !== undefined)
            lines = subtitle.content.trim().split(/\r?\n/);
        else
            lines = [" "];
        // Create nodes
        const strNode = textChains[1].getElementsByTagName('TextLine')[0];
        let objID = parseInt(strNode.getAttribute('objectID'));
        let prsID = parseInt(strNode.getAttribute('persistentID'));
        for (let i = 1; i < lines.length; i++) {
            const newNode = strNode.cloneNode(true);
            newNode.setAttribute('objectID', ++objID)
            newNode.setAttribute('persistentID', ++prsID)
            textChains[1].appendChild(newNode);
        }

        // Fill in contents
        const strTags = textChains[1].getElementsByTagName('TRString');
        for (let i = 0; i < lines.length; i++) {
            if (i != lines.length - 1)
                strTags[i].setAttribute('TXMarker', "Booyah");
            
            strTags[i].textContent = lines[i];
            this.setRunCount(strTags[i]);
        }

        let output = XMLSerializer.serializeToString(dom);
        this.writePrtl(this.subId, output);
    }

    haigu(subtitle) {
        let text = fs.readFileSync(this.findTemplatePath(subtitle.type), 'utf16le');
        const dom = DOMParser.parseFromString(text);
        const strTags = dom.getElementsByTagName('TRString');
        const lines = subtitle.content.trim().split(/\r?\n/);
        for (let i = 0; i < 4; i++) {
            strTags[i].textContent += lines[i];
            this.setRunCount(strTags[i]);
            let output = XMLSerializer.serializeToString(dom);
            this.writePrtl(this.subId + "-" + (i+1), output);
        }
    }

    battleUnit(subtitle, name) {
        let text = fs.readFileSync(this.findTemplatePath(subtitle.type, subtitle.size), 'utf16le');
        const dom = DOMParser.parseFromString(text);
        const textChain = dom.getElementsByTagName('TextChain')[0];

        /* Content */
        let lines;
        if (subtitle.content !== undefined)
            lines = subtitle.content.trim().split(/\r?\n/);
        else
            lines = [" "];
        // Create nodes
        const strNode = textChain.getElementsByTagName('TextLine')[0];
        let objID = parseInt(strNode.getAttribute('objectID'));
        let prsID = parseInt(strNode.getAttribute('persistentID'));
        for (let i = 1; i < lines.length; i++) {
            const newNode = strNode.cloneNode(true);
            newNode.setAttribute('objectID', ++objID)
            newNode.setAttribute('persistentID', ++prsID)
            textChain.appendChild(newNode);
        }

        // Fill in contents
        const strTags = textChain.getElementsByTagName('TRString');
        for (let i = 0; i < lines.length; i++) {
            if (i != lines.length - 1)
                strTags[i].setAttribute('TXMarker', "Booyah");
            
            strTags[i].textContent = lines[i];
            this.setRunCount(strTags[i]);
        }

        // Change color
        const color = Config.colors[subtitle.color];
        const redTags = dom.getElementsByTagName('red');
        for (let i in redTags) {
            if (redTags[i].textContent == "232") {
                redTags[i].textContent = color[0];
                redTags[i].parentNode.getElementsByTagName('green')[0].textContent = color[1];
                redTags[i].parentNode.getElementsByTagName('blue')[0].textContent = color[2];
            }
        }

        let output = XMLSerializer.serializeToString(dom);
        this.writePrtl(this.subId + 'b' + name, output);
    }

    battle(subtitle) {
        let result = {
            type: 1,
            size: 0
        };
        let side = 'L';
        for (let i = 0; i < 2; i++, side = 'R') {
            const info = subtitle.battleInfo[i];
            for (let j = 0; j < info.length; j++)
            result.color = info[j][0];
            result.content = info[j][1];
            this.battleUnit(result, side + j);
        }
    }
}

process.stdin.on('readable', () => {
    let input = process.stdin.read();
    if (input != null)
        json += input.toString().trim();
});

process.stdin.on('end', () => {
    let rawSubtitle;
    try {
        rawSubtitle = JSON.parse(json);
    }
    catch(e) {
        console.log(e);
    }
    finally {
        generator = new PrtlGenerator(rawSubtitle);
    }
    process.exit(0);
});
