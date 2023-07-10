const { Extension, type, api } = require('clipcc-extension');
const vm = api.getVmInstance();
const jszip = require('jszip');
zipsaver = {};
error = "";
class JZExtension extends Extension {
    onInit() {
        api.addCategory({
            categoryId: 'jasonxu.jszip.jszip',
            messageId: 'jasonxu.jszip.jszip.messageid',
            color: '#555555'
        });

        api.addBlock({
            opcode: 'jasonxu.jszip.getFileList.opcode',
            type: type.BlockType.REPORTER,
            messageId: 'jasonxu.jszip.getFileList',
            categoryId: 'jasonxu.jszip.jszip',
            function: (args, util) => {
                error = "";
                try {
                    let filenames = [];
                    for (let file in zipsaver[args.NAME].files) {
                        if (file.substr(-1) == "/") continue;
                        filenames.push(file);
                    }
                    return filenames;
                } catch (err) {
                    error = err;
                    return "ERR";
                }
            }, param: {
                NAME: {
                    type: type.ParameterType.STRING,
                    default: 'MyZipFile'
                }
            }
        });

        api.addBlock({
            opcode: 'jasonxu.jszip.getfile.opcode',
            type: type.BlockType.REPORTER,
            messageId: 'jasonxu.jszip.getfile',
            categoryId: 'jasonxu.jszip.jszip',
            function: (args, util) => {
                error = "";
                try {
                    return zipsaver[args.NAME].files[args.FILENAME].async(args.AS);
                } catch (err) {
                    error = err;
                    return "ERR";
                }
            }, param: {
                NAME: {
                    type: type.ParameterType.STRING,
                    default: 'MyZipFile'
                }, FILENAME: {
                    type: type.ParameterType.STRING,
                    default: 'abc.svg'
                }, AS: {
                    type: type.ParameterType.STRING,
                    menu: [{
                        messageId: 'jasonxu.jszip.as.string',
                        value: 'string'
                    }, {
                        messageId: 'jasonxu.jszip.as.base64',
                        value: 'base64'
                    }],
                    default: 'string'
                }
            }
        });

        api.addBlock({
            opcode: 'jasonxu.jszip.loadZipFile.opcode',
            type: type.BlockType.COMMAND,
            messageId: 'jasonxu.jszip.loadZipFile',
            categoryId: 'jasonxu.jszip.jszip',
            function: async (args, util) => {
                try {
                    error = "";
                    var file;
                    if (!window.showOpenFilePicker) {
                        file = new Promise(resolve => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.onchange = () => {
                                const filereader = new FileReader();
                                const loadfile = input.files[0];
                                filereader.onload = (e) => {
                                    resolve(e.target.result);
                                };
                                filereader.onerror = (err) => {
                                    console.log(err);
                                    resolve();
                                };
                                filereader.readAsArrayBuffer(loadfile);
                            }
                            input.click();
                        });
                    } else {
                        const [fileHandle] = await window?.showOpenFilePicker({
                            types: [
                                {
                                    description: "压缩文档",
                                    accept: { "application/zip": [args.TYPE] }
                                }
                            ]
                        });
                        file = await fileHandle?.getFile();
                    }
                    let unzipper = new jszip();
                    await unzipper.loadAsync(file).then(function (zip) {
                        zipsaver[args.NAME] = zip;
                        console.log(zipsaver);
                    })
                } catch (err) {
                    error = err;
                    console.log(err);
                }
            }, param: {
                NAME: {
                    type: type.ParameterType.STRING,
                    default: 'MyZipFile'
                }, TYPE: {
                    type: type.ParameterType.STRING,
                    default: '.zip'
                }
            }
        });

        api.addBlock({
            opcode: 'jasonxu.jszip.newZipFile.opcode',
            type: type.BlockType.COMMAND,
            messageId: 'jasonxu.jszip.newZipFile',
            categoryId: 'jasonxu.jszip.jszip',
            function: async (args, util) => {
                try {
                    zipsaver[args.NAME] = new jszip();
                } catch (err) {
                    error = err;
                    console.log(err);
                }
            }, param: {
                NAME: {
                    type: type.ParameterType.STRING,
                    default: 'MyZipFile'
                }
            }
        });

        api.addBlock({
            opcode: 'jasonxu.jszip.addFile.opcode',
            type: type.BlockType.COMMAND,
            messageId: 'jasonxu.jszip.addFile',
            categoryId: 'jasonxu.jszip.jszip',
            function: async (args, util) => {
                try {
                    if(args.AS=='base64') zipsaver[args.NAME].file(args.FNAME, args.CONTENT, { base64: true });
                    else zipsaver[args.NAME].file(args.FNAME, args.CONTENT);
                } catch (err) {
                    error = err;
                    console.log(err);
                }
            }, param: {
                NAME: {
                    type: type.ParameterType.STRING,
                    default: 'MyZipFile'
                }, FNAME: {
                    type: type.ParameterType.STRING,
                    default: 'hello.txt'
                }, CONTENT: {
                    type: type.ParameterType.STRING,
                    default: 'hello!'
                }, AS: {
                    type: type.ParameterType.STRING,
                    menu: [{
                        messageId: 'jasonxu.jszip.as.string',
                        value: 'string'
                    }, {
                        messageId: 'jasonxu.jszip.as.base64',
                        value: 'base64'
                    }],
                    default: 'string'
                }
            }
        });

        api.addBlock({
            opcode: 'jasonxu.jszip.addFolder.opcode',
            type: type.BlockType.COMMAND,
            messageId: 'jasonxu.jszip.addFolder',
            categoryId: 'jasonxu.jszip.jszip',
            function: async (args, util) => {
                try {
                    zipsaver[args.NAME].folder(args.FNAME);
                } catch (err) {
                    error = err;
                    console.log(err);
                }
            }, param: {
                NAME: {
                    type: type.ParameterType.STRING,
                    default: 'MyZipFile'
                }, FNAME: {
                    type: type.ParameterType.STRING,
                    default: 'new folder'
                }
            }
        });

        api.addBlock({
            opcode: 'jasonxu.jszip.deleteZipFile.opcode',
            type: type.BlockType.COMMAND,
            messageId: 'jasonxu.jszip.deleteZipFile',
            categoryId: 'jasonxu.jszip.jszip',
            function: async (args, util) => {
                try {
                    delete zipsaver[args.NAME];
                } catch (err) {
                    error = err;
                    console.log(err);
                }
            }, param: {
                NAME: {
                    type: type.ParameterType.STRING,
                    default: 'MyZipFile'
                }
            }
        });

        api.addBlock({
            opcode: 'jasonxu.jszip.downloadZip.opcode',
            type: type.BlockType.COMMAND,
            messageId: 'jasonxu.jszip.downloadZip',
            categoryId: 'jasonxu.jszip.jszip',
            function: async (args, util) => {
                try {
                    zipsaver[args.NAME].generateAsync({
                        type: 'blob',
                        compression: "DEFLATE",
                        compressionOptions: {
                            level: args.LEVEL
                        }
                    }).then(function (content) {
                        var filename = args.FNAME;
                        var eleLink = document.createElement('a');
                        eleLink.download = filename;
                        eleLink.style.display = 'none';
                        eleLink.href = URL.createObjectURL(content);
                        document.body.appendChild(eleLink);
                        eleLink.click();
                        document.body.removeChild(eleLink);
                    });
                } catch (err) {
                    error = err;
                    console.log(err);
                }
            }, param: {
                NAME: {
                    type: type.ParameterType.STRING,
                    default: 'MyZipFile'
                }, FNAME: {
                    type: type.ParameterType.STRING,
                    default: 'MyZipFile.zip'
                }, LEVEL: {
                    type: type.ParameterType.NUMBER,
                    default: 9
                }
            }
        });

        api.addBlock({
            opcode: 'jasonxu.jszip.deleteAll.opcode',
            type: type.BlockType.COMMAND,
            messageId: 'jasonxu.jszip.deleteAll',
            categoryId: 'jasonxu.jszip.jszip',
            function: async (args, util) => {
                zipsaver = [];
            }
        });



        api.addBlock({
            opcode: 'jasonxu.jszip.error.opcode',
            type: type.BlockType.REPORTER,
            messageId: 'jasonxu.jszip.error',
            categoryId: 'jasonxu.jszip.jszip',
            function: () => { return error; }
        });
    }

    onUninit() {
        api.removeCategory('jasonxu.jszip.jzsip');
    }
}

module.exports = JZExtension;
