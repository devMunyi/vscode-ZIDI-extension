// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// rlthiyl7inn5a32z4hl5blgtcrkhyeriwfq2aftnaujxazkqahna
const vscode = require('vscode');
const axios = require('axios');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  const { data: resp } = await axios.get(
    'https://backgen.net/back/codesnippets'
  );
  const solutions = resp.data.map(({ uid, title, language_name }) => {
    hyphenatedTitle = hyphenateTitle(title);
    return {
      label: `${title} in ${language_name}`,
      detail: '',
      link: `https://zidiapp.com/solutions/${uid}/${hyphenatedTitle}-in-${language_name}`,
    };
  });

  let disposable = vscode.commands.registerCommand(
    'zidi-instant-search.zidiSolutionSearch',

    async function () {
      const solution = await vscode.window.showQuickPick(solutions, {
        matchOnDetail: true,
      });

      if (solution == null) return;
      vscode.env.openExternal(solution.link);
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

function hyphenateTitle(str) {
  str = str.toLowerCase();
  return str.replace(/ /gi, '-');
}

module.exports = {
  activate,
  deactivate,
};
