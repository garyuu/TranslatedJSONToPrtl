const xml = require('xml-parse');
let json = "";

class PtrlGenerator {
    constuctor(obj) {
        this.subId = 0;
        this.loadXml();
        switch (this.data.ver) {
            case 1:
                this.data = obj;
                this.outputDir = this.data.title;
                for (let i in this.data.groups) {
                    for (let j in this.data.contents) {
                        this.generate(i, j);
                    }
                }
                break;
            default:
                console.log("Unknown version of json data!");
        }
    }

    loadXml() {
        console.log('Loading XML...');
    }

    generate(i, j) {
        console.log(this.data.groups[i].contents[j]);
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
        PrtlGenerator(rawSubtitle);
    }
    process.exit(0);
});
