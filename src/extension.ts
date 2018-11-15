"use strict";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

// get date of today
function getNowYMD() {
  var dt = new Date();
  var y = ("" + dt.getFullYear()).slice(-2);
  var m = ("00" + (dt.getMonth() + 1)).slice(-2);
  var d = ("00" + dt.getDate()).slice(-2);
  var result = y + m + d;
  return result;
}

export function activate(context: vscode.ExtensionContext) {
  console.log("journal is now active");

  let disposable = vscode.commands.registerCommand("journal.today", () => {
    // get file name
    const config = vscode.workspace.getConfiguration("journal");
    const basepath = config.get("basepath", "/tmp/");
    const newfilename = path.join(basepath, getNowYMD() + ".md");
    var setting: vscode.Uri = vscode.Uri.parse("file:" + newfilename);

    // open journal.md
    const promise = new Promise((resolve, reject) => {
      fs.access(newfilename, fs.constants.F_OK, err => {
        if (err) {
          setting = vscode.Uri.parse("untitled:" + newfilename);
          resolve(true);
          console.log("not exist, create new file.");
        } else {
          resolve(false);
          console.log("already exist, open the file.");
        }
      });
    });

    promise.then(res => {
      console.log("open");
      vscode.workspace
        .openTextDocument(setting)
        .then((doc: vscode.TextDocument) => {
          vscode.window.showTextDocument(doc, 1, false).then(e => {
            if (res) {
              e.edit(edit => {
                // initial content of the journal
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

export function deactivate() {
  console.log("journal: deactivated");
}
