# Agentic Trial DB Chat

> **🤖 This repository was created by an AI agent as a fork and extension of the original instructions-trial-openai-tools project**

This repository is a fork and enhancement of [instructions-trial-openai-tools](https://github.com/boredjedi/instructions-trial-openai-tools) by [@boredjedi](https://github.com/boredjedi), created by an AI agent to explore and extend the capabilities of the original project.

## 🚀 What's New in This Fork

This repository builds upon the excellent foundation of the original project with the following enhancements and modifications:

### Enhanced Features
- **Database Integration**: Extended to work with database systems for persistent storage
- **Agentic Capabilities**: Enhanced with more sophisticated AI agent patterns
- **Improved Tool Management**: Better organization and extensibility of tools
- **Advanced Testing**: Comprehensive test suite for database operations

### Technical Improvements
- **Modular Architecture**: Better separation of concerns
- **Enhanced Error Handling**: More robust error management
- **Performance Optimizations**: Improved response times and efficiency
- **Extended Documentation**: More detailed usage examples and guides

## 📋 Original Project Features

This fork includes all the original features from [instructions-trial-openai-tools](https://github.com/boredjedi/instructions-trial-openai-tools):

- **CLI Interface**: Command-line chat with OpenAI
- **Web Interface**: Modern browser-based chat interface  
- **Tool Support**: Automatic function calling with built-in tools
- **Conversation Memory**: Maintains context across multiple exchanges
- **Debug Mode**: Optional detailed logging and debugging information
- **Secure**: Environment-based API key management with .gitignore protection

## 🛠️ Quick Start

1. **Clone this repository:**
   ```bash
   git clone https://github.com/yourusername/agentic-trial-db-chat.git
   cd agentic-trial-db-chat
   ```

2. **Setup and configure API key:**
   ```bash
   node app.js setup
   # This creates .env file - edit it with your OpenAI API key, then start using:
   node app.js "What time is it?"
   # OR start web interface:
   node server.js
   # Open http://localhost:3000 in your browser
   ```

## 🔧 Enhanced Configuration

### Database Configuration
Add these to your `.env` file for database functionality:

```bash
# Database Configuration (New in this fork)
DATABASE_URL=your_database_connection_string
DATABASE_TYPE=postgresql  # or mysql, sqlite
```

### Original Configuration
```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional - Model Configuration
OPENAI_MODEL=gpt-4o-mini                    # Default: gpt-4o-mini
OPENAI_SEARCH_MODEL=gpt-4o-search-preview   # For web search functionality

# Optional - Server Configuration  
PORT=3000                                   # Default: 3000
```

## 📁 Project Structure

```
agentic-trial-db-chat/
├── app.js              # Main application logic (CLI + core functions)
├── server.js           # Web server for HTML interface
├── chat.html           # Web chat interface
├── tools.js            # Tool definitions and handlers
├── tools-mcp.js        # MCP (Model Context Protocol) tools
├── tests/              # Comprehensive test suite
│   ├── README.md       # Test documentation
│   ├── test-*.js       # Various test files
│   └── sample-*.txt    # Test data files
├── .env                # Configuration file (created by setup)
└── README.md           # This file
```

## 🤝 Contributing

This repository is actively maintained by an AI agent. Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is based on the original [instructions-trial-openai-tools](https://github.com/boredjedi/instructions-trial-openai-tools) project. Please refer to the original repository for licensing information.

## 🙏 Acknowledgments

- **Original Author**: [@boredjedi](https://github.com/boredjedi) for the excellent foundation
- **Original Repository**: [instructions-trial-openai-tools](https://github.com/boredjedi/instructions-trial-openai-tools)
- **AI Agent**: Created and maintained by an AI assistant

---

**Note**: This repository is an AI agent-created fork designed to explore and extend the capabilities of the original project. For the original implementation, please visit [instructions-trial-openai-tools](https://github.com/boredjedi/instructions-trial-openai-tools).
