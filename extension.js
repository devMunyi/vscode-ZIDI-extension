const vscode = require('vscode');
const axios = require('axios');
const open = require('open');

/**
 * @param {vscode.ExtensionContext} context
 */

var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : new P(function (resolve) {
              resolve(result.value);
            }).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };

//function that activates the extension
function activate(context) {
  const searchBySelectionInput = vscode.commands.registerCommand(
    'zidi-code-search.zidiCodeSearchBySelectionInput',
    () =>
      __awaiter(this, void 0, void 0, function* () {
        const searchTerm = getSelectedText();
        yield executeSearch(searchTerm);
      })
  );

  const searchWithPromptInput = vscode.commands.registerCommand(
    'zidi-code-search.zidiCodeSearchByPromptInput',
    () =>
      __awaiter(this, void 0, void 0, function* () {
        const selectedText = getSelectedText();
        const searchTerm = yield vscode.window.showInputBox({
          ignoreFocusOut: selectedText === '',
          placeHolder: 'Enter your ZIDI search query',
          // prompt: 'search for tooltip',
          value: selectedText,
          valueSelection: [0, selectedText.length + 1],
        });
        yield executeSearch(searchTerm);
      })
  );
  context.subscriptions.push(searchBySelectionInput);
  context.subscriptions.push(searchWithPromptInput);
}

// This method is called when your extension is deactivated
function deactivate() {}

// function to execute a search based on search term
function executeSearch(searchTerm) {
  return __awaiter(this, void 0, void 0, function* () {
    if (!searchTerm || searchTerm.trim() === '') {
      return;
    }
    searchTerm = searchTerm.trim();
    console.log(
      `User initiated a zidi search with [${searchTerm}] search term`
    );

    const rpp = 250;
    const apiSearchUrl = `https://backgen.net/back/search-codesnippet?search_=${searchTerm}&rpp=${rpp}`;
    const zidiSiteSearchUrl = `https://zidiapp.com?search_=${searchTerm}`;
    const googleSearchUrl = `https://www.google.com/search?q=${searchTerm}`;

    let questionsMeta = [];
    try {
      const searchResponse = (yield axios.get(apiSearchUrl)).data;
      if (searchResponse.data && searchResponse.data.length > 0) {
        searchResponse.data.forEach(
          ({ uid, title, user_implementation_type }, i) => {
            const hyphenatedTitle = hyphenateTitle(title);
            questionsMeta.push({
              title: `${i + 1} ➡️ ${title} : ✅${user_implementation_type}`,
              url: `https://zidiapp.com/solutions/${uid}/${hyphenatedTitle}`,
            });
          }
        );
      } else {
        questionsMeta = [
          { title: 'No Matches Found. Click esc key to dismiss and retry or click one of the following:' },
          {
            title: `🌐 🔎 Search On ZIDI Site: ${searchTerm}`,
            url: zidiSiteSearchUrl,
          },
          {
            title: `🕸️ 🔎 Search On Google: ${searchTerm}`,
            url: googleSearchUrl,
          },
        ];
      }
    } catch (error) {
      console.error(error);
    }
    const questions = questionsMeta.map((q) => q.title);
    const selectedTitle = yield vscode.window.showQuickPick(questions, {
      canPickMany: false,
    });
    const selectedQuestionMeta = questionsMeta.find(
      (q) => q.title === selectedTitle
    );
    const selectedQuestionUrl = selectedQuestionMeta
      ? selectedQuestionMeta.url
      : null;
    if (selectedQuestionUrl) {
      open(selectedQuestionUrl);
    }
  });
}

// function to get selected text from the editor
function getSelectedText() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return '';
  }
  const document = editor.document;
  const eol = document.eol === 1 ? '\n' : '\r\n';
  let result = '';
  const selectedTextLines = editor.selections.map((selection) => {
    if (
      selection.start.line === selection.end.line &&
      selection.start.character === selection.end.character
    ) {
      const range = document.lineAt(selection.start).range;
      const text = editor.document.getText(range);
      return `${text}${eol}`;
    }
    return editor.document.getText(selection);
  });
  if (selectedTextLines.length > 0) {
    result = selectedTextLines[0];
  }
  result = result.trim();
  return result;
}

// helper function to hyphenate title
function hyphenateTitle(str) {
  str = str.toLowerCase();
  return str.replace(/ /gi, '-');
}

module.exports = {
  activate,
  deactivate,
};
