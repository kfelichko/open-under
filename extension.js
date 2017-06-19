// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var path = require('path');
var fs = require('fs');

var getFullPath = (workspaceRoot, fileRoot, filePath) => {
    if (filePath.indexOf('/') === 0) {
      return path.join(workspaceRoot, filePath.substr(1));
    }
	
    if (filePath.indexOf('../') === 0) {
      return path.join(fileRoot, filePath);
    }

    if (filePath.indexOf('~') === 0) {
      var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
      return path.join(home, filePath.substr(1));
    }

    return path.resolve(fileRoot, filePath);
  }


function activate(context) {

    var disposable = vscode.commands.registerCommand('extension.openUnder', function () {
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
	        return;
        }

        var bounds = /.*?\.\S*/g;

        var selection;
        if (editor.selection.isEmpty) {
            selection = editor.document.getWordRangeAtPosition(
                editor.selection.active,
                bounds);
        } else {
            selection = editor.selection;
        }

        var files = editor.document.getText(selection).trim().match(bounds);
		
        for (var i = 0; i < files.length; i++) {
            var text = files[i];
			
			if (text.indexOf('"') >= 0) {
				var re = /\"([^\"]+)\"/g;
				var results = text.match(re);
				if (typeof(results[0]) !== 'undefined') {
					text = results[0];
					text = text.replace(/["]+/g, '');
				}
			}
			
            var filename = getFullPath(vscode.workspace.rootPath, path.dirname(editor.document.uri.fsPath), text);
			
            if (!fs.existsSync(filename)) {
                vscode.window.showInformationMessage(`Could not find ${filename}!`);
                continue;
            }
            vscode.workspace.openTextDocument(filename).then((textDocument) => {
                if (!textDocument) {
                    vscode.window.showErrorMessage(`Could not open ${filename}!`);
                    return;
                }
                vscode.window.showTextDocument(textDocument).then((editor) => {
                    if (!editor) {
                        vscode.window.showErrorMessage(`Could not show ${filename}!`);
                        return;
                    }
                });
            });
        }
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
