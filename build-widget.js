const fs = require('fs');
const path = require('path');

// Read the widget script
const widgetScript = fs.readFileSync(path.join(__dirname, 'app/widget/route.ts'), 'utf8');

// Extract the script content between the backticks
const scriptMatch = widgetScript.match(/const script = `([\s\S]*?)`;/);
if (!scriptMatch) {
  console.error('Could not find script content in route.ts');
  process.exit(1);
}

const scriptContent = scriptMatch[1];

// Create the public directory if it doesn't exist
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Write the widget script to a file
try {
  fs.writeFileSync(path.join(__dirname, 'public/chat-widget.js'), scriptContent);
  console.log('Widget script built successfully!');
} catch (error) {
  console.error('Error writing widget script:', error);
  process.exit(1);
} 