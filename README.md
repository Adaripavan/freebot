# AI Chatbot Web Page

A simple web page. The user enters their name and API key, uses the chatbot, and closes the tab when done.

## How to use

1. Open the page.
2. Enter your name and API key (OpenRouter or OpenAI-compatible).
3. Chat with the AI.
4. Close the tab when finished.

## Privacy

- The page does not store any data.
- Your API key is visible to you in the browser and is not stored by Render or any server.
- You are responsible for keeping your API key secure.

## Deploy on Render

1. Create an account on [Render](https://render.com).
2. Click **New** -> **Static Site**.
3. Connect your GitHub repository containing this folder.
4. Leave Build Command and Start Command empty.
5. Set Publish Directory to `.` (root).
6. Click **Create Static Site** and wait for the deployment to finish.

You can also use the included `render.yaml` for automatic configuration.

## Files

- `index.html` - page layout
- `style.css` - styling
- `app.js` - chat logic and API calls