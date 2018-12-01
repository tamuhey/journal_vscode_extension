"use strict";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

function getDate(date_offset = 0) {
  var dt = new Date();
  dt.setDate(dt.getDate() + date_offset);
  return dt;
}

// get date of today
function getNowYMD(date_offset = 0) {
  var dt = getDate(date_offset);
  var y = ("" + dt.getFullYear()).slice(-2);
  var m = ("00" + (dt.getMonth() + 1)).slice(-2);
  var d = ("00" + dt.getDate()).slice(-2);
  var result = y + m + d;
  return result;
}

function open_journal(fname_suffix: string, date: string) {
  // get file name
  const config = vscode.workspace.getConfiguration("journal");
  const basepath = config.get("basepath", "/tmp/");
  const newfilename = path.join(basepath, fname_suffix + ".md");
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
            const user_body = config.get("body", "");
            e.edit(edit => {
              // body
              let body =
                `---\ntitle: ${fname_suffix}\ndate: ${date}\n---\n` + user_body;
              // initial content of the journal
              edit.insert(new vscode.Position(0, 0), body);
            });
          }
        });
      });
  });
}

export function activate(context: vscode.ExtensionContext) {
  console.log("journal is now active");
  let disposable_today = vscode.commands.registerCommand(
    "journal.today",
    () => {
      open_journal(getNowYMD(), new Date().toISOString());
    }
  );

  let disposable_yesterday = vscode.commands.registerCommand(
    "journal.yesterday",
    () => {
      open_journal(getNowYMD(-1), getDate(-1).toISOString());
    }
  );

  let disposable_offset = vscode.commands.registerCommand(
    "journal.date_offset",
    () => {
      vscode.window.showInputBox().then(value => {
        if (value === undefined) {
          value = "0";
        }
        var offset = Number(value);
        open_journal(getNowYMD(offset), getDate(offset).toISOString());
      });
    }
  );

  context.subscriptions.push(
    disposable_today,
    disposable_yesterday,
    disposable_offset
  );
}

export function deactivate() {
  console.log("journal: deactivated");
}
