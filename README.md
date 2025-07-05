# OpenAI Chat Application

> **🤖 This repo is 100% created and maintained by an AI agent**

A simple chat application that automatically uses tools when needed. Includes both CLI and web interfaces with JSON debugging.

## Features

- **Automatic tool usage** - No need to specify when to use tools
- **Built-in tools**: Time, Calculator, Weather (mock)
- **JSON debugging** - See exactly what's happening under the hood
- **CLI interface** - Simple command-line usage
- **Web interface** - Clean HTML chat interface
- **No dependencies** - Uses only Node.js built-in modules

## Quick Start

1. **Setup API key:**
   ```bash
   node app.js setup
   # Edit .env file with your OpenAI API key
   ```

2. **CLI Usage:**
   ```bash
   node app.js "What time is it?"
   node app.js "Calculate 15 * 23 + 47"
   node app.js "What's the weather in Paris?"
   ```

3. **Web Interface:**
   ```bash
   node server.js
   # Open http://localhost:3000 in your browser
   ```

## Examples

### CLI Examples
```bash
# Simple question
node app.js "Hello, how are you?"

# Automatic time tool usage
node app.js "What time is it in New York?"

# Automatic calculator usage
node app.js "What's 156 * 23?"

# Automatic weather tool usage
node app.js "How's the weather in Tokyo?"

# Complex multi-tool usage
node app.js "What time is it and what's 50 * 30?"
```

### JSON Output
All responses are in JSON format for easy debugging:

```json
{
  "response": "The current time in New York is 3:45 PM EST.",
  "model": "gpt-3.5-turbo",
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 12,
    "total_tokens": 37
  },
  "finish_reason": "stop",
  "iterations": 2,
  "debug": {
    "tool_calls": [
      {
        "function_name": "get_current_time",
        "arguments": { "timezone": "America/New_York" },
        "result": { "formatted": "12/7/2025, 3:45:00 PM" }
      }
    ]
  }
}
```

## Web Interface

The web interface provides:
- **Split-screen layout** with chat on left, JSON debug on right
- **Real-time JSON debugging** - see all API calls and tool usage
- **Clean chat interface** - easy to use for conversations
- **Automatic tool detection** - tools are used transparently

## Files

- `app.js` - Main application logic (CLI + core functions)
- `server.js` - Web server for HTML interface
- `chat.html` - Web chat interface
- `.env` - API key configuration (created by setup)

## Built-in Tools

The application automatically decides when to use these tools:

1. **get_current_time** - When user asks about time/date
2. **calculate** - When user needs mathematical calculations
3. **weather_info** - When user asks about weather (returns mock data)

## API Key Setup

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Run `node app.js setup` to create .env file
3. Edit .env file: `OPENAI_API_KEY=your_actual_key_here`

## No Configuration Needed

- Tools are used automatically based on user input
- No flags or options to remember
- Simple prompt → intelligent response with tools when needed
- JSON output shows exactly what happened for debugging

Perfect for development and debugging OpenAI tool usage!
