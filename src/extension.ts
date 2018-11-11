'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from "path";
import * as fs from "fs";
import { print } from 'util';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

function getNowYMD(){
  var dt = new Date();
  var y = ("" + dt.getFullYear()).slice(-2);
  var m = ("00" + (dt.getMonth()+1)).slice(-2);
  var d = ("00" + dt.getDate()).slice(-2);
  var result = y +  m + d;
  return result;
}

export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('journal is now active');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('journal.today', () => {
        // The code you place here will be executed every time your command is executed

        const config = vscode.workspace.getConfiguration("journal");
        const basepath = config.get("basepath", "/tmp/");
        const newfilename = path.join(basepath, getNowYMD()+".md");
        var setting: vscode.Uri = vscode.Uri.parse("file:" + newfilename);

        const promise = new Promise((resolve, reject) => {
            fs.access(newfilename, fs.constants.F_OK, (err) => {
                if (err){
                    setting = vscode.Uri.parse("untitled:" + newfilename);
                    resolve(true);
                    console.log("not exist");
                } else{
                    resolve(false);
                    console.log("exist!!!");
                }
            });
        });

        promise.then((res)=> {
            console.log("open");
            vscode.workspace.openTextDocument(setting).then((doc: vscode.TextDocument) => {
                vscode.window.showTextDocument(doc, 1, false).then(e => {
                    if (res) {
                        e.edit(edit => {
                            edit.insert(new vscode.Position(0, 0), "# note\n");
                            edit.insert(new vscode.Position(0, 1), "# work\n");
                        });
                    }
                });
            });
        });
    });
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
