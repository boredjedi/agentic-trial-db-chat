# OpenAI Chat Application

> **🤖 This repo is 100% created and maintained by an AI agent**

A complete OpenAI chat application with CLI and web interfaces, featuring automatic tool usage and conversation context.

## Features

- **CLI Interface**: Command-line chat with OpenAI
- **Web Interface**: Modern browser-based chat interface
- **Tool Support**: Automatic function calling with built-in tools
- **Conversation Memory**: Maintains context across multiple exchanges
- **Debug Mode**: Optional detailed logging and debugging information
- **Secure**: Environment-based API key management with .gitignore protection

## Quick Start

1. **Setup and configure API key:**
   ```bash
   node app.js setup
   # This creates .env file - edit it with your OpenAI API key, then start using:
   node app.js "What time is it?"
   # OR start web interface:
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
- `tools.js` - Tool definitions and handlers
- `.env` - API key configuration (created by setup)
- `tests/` - All test files (see tests/README.md for details)

## Built-in Tools

The application automatically decides when to use these tools:

1. **get_current_time** - When user asks about time/date
2. **calculate** - When user needs mathematical calculations
3. **weather_info** - When user asks about weather (returns mock data)

## Configuration

### API Key Setup

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Run `node app.js setup` to create .env file
3. Edit .env file: `OPENAI_API_KEY=your_actual_key_here`

### Environment Variables

Configure the application by setting these environment variables in your `.env` file:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional - Model Configuration
OPENAI_MODEL=gpt-4o-mini                    # Default: gpt-4o-mini
OPENAI_SEARCH_MODEL=gpt-4o-search-preview   # For web search functionality

# Optional - Server Configuration  
PORT=3000                                   # Default: 3000

# Automatically managed (don't set manually)
VECTOR_STORE_ID=vs_xxx                      # Set automatically by the system
ASSISTANT_ID=asst_xxx                       # Set automatically by the system
```

**Available Models:**
- `gpt-4o` - Most capable model
- `gpt-4o-mini` - Fast and efficient (default)
- `gpt-4-turbo` - Previous generation
- `gpt-3.5-turbo` - Legacy model

## No Configuration Needed

- Tools are used automatically based on user input
- No flags or options to remember
- Simple prompt → intelligent response with tools when needed
- JSON output shows exactly what happened for debugging

Perfect for development and debugging OpenAI tool usage!
