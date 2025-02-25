import * as vscode from 'vscode';
import * as ts from 'typescript';

export function activate(context: vscode.ExtensionContext) {
    const refactorProvider = new RefactorProvider();
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('typescript', refactorProvider, {
            providedCodeActionKinds: [vscode.CodeActionKind.Refactor]
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.extractFunction', extractFunction)
    );
}

class RefactorProvider implements vscode.CodeActionProvider {
    provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] {
        const codeActions: vscode.CodeAction[] = [];

        console.log("Code Actions Triggered for Selection:", range);

        const selectedText = document.getText(range);
        if (!selectedText.includes("return") && !selectedText.includes("=")) {
            return [];
        }

        if (range.end.line - range.start.line > 1) {
            const action = new vscode.CodeAction('✨ Extract to Helper Function (Custom)', vscode.CodeActionKind.RefactorExtract);
            action.command = { command: 'extension.extractFunction', title: 'Extract Function', arguments: [document, range] };

            console.log("Adding Code Action:", action.title);

            codeActions.push(action);
        }

        return codeActions;
    }
}

// ✅ Extract only used variables
function getUsedVariables(selectedText: string): string[] {
    const sourceFile = ts.createSourceFile("temp.ts", selectedText, ts.ScriptTarget.ESNext, true);
    const usedVariables = new Set<string>();

    function visit(node: ts.Node) {
        if (ts.isIdentifier(node)) {
            usedVariables.add(node.text);
        }
        ts.forEachChild(node, visit);
    }

    ts.forEachChild(sourceFile, visit);
    return Array.from(usedVariables);
}

// ✅ Suggest function name based on selected code pattern
function suggestFunctionName(selectedText: string): string {
    if (selectedText.includes("fetch") || selectedText.includes("API")) {
        return "fetchFromApi";
    }
    if (selectedText.includes("reduce") || selectedText.includes("sum")) {
        return "calculateTotal";
    }
    if (selectedText.includes("console.log")) {
        return "logMessage";
    }
    return "newHelperFunction"; // Fallback
}

// ✅ Detect if selection is inside a class
function isInsideClass(document: vscode.TextDocument, range: vscode.Range): boolean {
    const textBefore = document.getText(new vscode.Range(new vscode.Position(0, 0), range.start));
    return textBefore.includes("class ");
}

async function extractFunction(document: vscode.TextDocument, range: vscode.Range) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active editor.");
        return;
    }

    const selectedText = document.getText(range);
    const insideClass = isInsideClass(document, range);
    const functionName = suggestFunctionName(selectedText);
    const params = getUsedVariables(selectedText);

    // ✅ Modify function structure based on class context
    const extractedFunction = insideClass
        ? `\n${functionName}(${params.join(", ")}) {\n${selectedText}\n}\n` // Class method
        : `\nfunction ${functionName}(${params.join(", ")}) {\n${selectedText}\n}\n`; // Global function

    // ✅ If inside a class, replace function call with `this.functionName()`
    const functionCall = insideClass ? `this.${functionName}(${params.join(", ")});` : `${functionName}(${params.join(", ")});`;

	// ✅ Define preview before using it
	const preview = `// Suggested Function:\n${extractedFunction}\n\nReplaces:\n${selectedText}`;

	// ✅ Define choices correctly using QuickPickItem[]
	const previewChoices: vscode.QuickPickItem[] = [
		{ label: "Apply Refactor", description: "Extracts the selected code into a new function", detail: preview },
		{ label: "Cancel", description: "Abort the refactoring operation" }
	];

	const confirmChoice = await vscode.window.showQuickPick(previewChoices, {
		placeHolder: "Preview the extracted function before applying.",
		canPickMany: false // 🔥 Ensures a single item is returned
	}) as vscode.QuickPickItem | undefined; // ✅ Ensures correct return type

// ✅ Fix: Compare confirmChoice.label instead of confirmChoice directly
if (!confirmChoice || confirmChoice.label === "Cancel") {
    vscode.window.showInformationMessage("Refactoring cancelled.");
    return;
}
    // ✅ Ask the user where to place the function
    const placementOptions: vscode.QuickPickItem[] = [
        { label: "Above Current Function", description: "Insert function above the calling function" },
        { label: "Bottom of File", description: "Insert function at the bottom of the file" },
        { label: "Move to New File", description: "Move the function to a new file" }
    ];

    const placementChoice = await vscode.window.showQuickPick(placementOptions, {
        placeHolder: "Where do you want to place the extracted function?",
        canPickMany: false
    });

    if (!placementChoice) {
        vscode.window.showInformationMessage("Refactoring cancelled.");
        return;
    }

    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, range, functionCall);

    if (placementChoice.label === "Above Current Function") {
        const insertionPos = new vscode.Position(range.start.line - 1, 0);
        edit.insert(document.uri, insertionPos, extractedFunction);
    } 
    else if (placementChoice.label === "Bottom of File") {
        console.log("Appending function at the bottom of the file...");
        const lastLine = document.lineAt(document.lineCount - 1);
        const lastPosition = new vscode.Position(lastLine.lineNumber + 1, 0);
        edit.insert(document.uri, lastPosition, extractedFunction);
    } 
    else if (placementChoice.label === "Move to New File") {
        const newFileName = await vscode.window.showInputBox({
            prompt: "Enter filename for new function file",
            value: `${functionName}.ts`
        });

        if (newFileName) {
            const newUri = vscode.Uri.joinPath(document.uri, "..", newFileName);
            const functionContent = Buffer.from(extractedFunction, "utf-8");

            try {
                await vscode.workspace.fs.writeFile(newUri, Uint8Array.from(functionContent));
                vscode.window.showInformationMessage(`Function moved to ${newFileName}`);
            } catch (error) {
                vscode.window.showErrorMessage(`Error writing to new file: ${error}`);
                return;
            }
        }
    }

    await vscode.workspace.applyEdit(edit);
    vscode.window.showInformationMessage(`Extracted function "${functionName}" created!`);
}

export function deactivate() {}