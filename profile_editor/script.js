function insertCode(code) {
    const editor = monaco.editor.getModels()[0]; // Assuming only one editor
    const cursorPosition = editor.getPosition();
    const rangeToReplace = new monaco.Range(
        cursorPosition.lineNumber,
        cursorPosition.column,
        cursorPosition.lineNumber,
        cursorPosition.column
    );
    editor.executeEdits(null, [{
        range: rangeToReplace,
        text: code
    }]);
}

// Example of how the agent might send code
// insertCode("console.log('Hello from the agent!');");
