TypeScript Refactor Helper

🚀 Refactor TypeScript code efficiently in VS Code!
The TypeScript Refactor Helper extension helps developers extract functions, optimize code structure, and improve maintainability with a single command.

Features

🔹 Extract Function – Easily extract selected code into a reusable function.
🔹 Function Placement Options – Choose to place the extracted function:
	•	Above the current function
	•	At the bottom of the file
	•	In a new file
🔹 Auto-Suggested Function Names – Automatically suggests meaningful function names based on your code.
🔹 Optimized Parameter Detection – Only passes necessary variables to extracted functions.
🔹 Class Method Extraction – If the function is inside a class, it extracts it as a class method.
🔹 Preview Before Applying Refactoring – View the extracted function preview before confirming.

How to Use

1️⃣ Select a block of TypeScript code that you want to refactor.
2️⃣ Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P).
3️⃣ Run: "Extract Function (Refactor Helper)".
4️⃣ Choose the function placement (above, bottom of file, or new file).
5️⃣ Confirm the refactor preview and apply changes!

Requirements

✅ VS Code version 1.97.0 or higher
✅ TypeScript installed in your workspace

Extension Settings

This extension currently does not require configuration, but in future versions, users will be able to:
	•	Customize default function placement (above, bottom, or new file).
	•	Enable/disable auto-suggested function names.


🐞 Known Issues
	•	Multiline object extractions may require manual adjustment.
	•	Extracted functions may require imports when moved to a new file.


📌 Release Notes

v1.0.0

✅ Initial release
✅ Extract function from selected TypeScript code
✅ Function placement options
✅ Auto-suggest function names