# Agentic Trial DB Chat

> **🤖 Advanced Multi-Agent Chat System with Noodle-Based Prompt Engineering**

This repository is a fork and enhancement of [instructions-trial-openai-tools](https://github.com/boredjedi/instructions-trial-openai-tools) by [@boredjedi](https://github.com/boredjedi), transformed into a sophisticated multi-agent chat system with intelligent prompt engineering.

## 🚀 What's New in This Fork

This repository has been completely overhauled with a revolutionary multi-agent architecture:

### 🧠 Noodle-Based Prompt Engineering System
- **Intelligent Context Analysis**: Noodle (main agent) analyzes full conversation history
- **Smart Agent Routing**: Automatically determines the best agent for each question
- **Context-Aware Prompts**: Engineers comprehensive prompts with full conversation context
- **Pronoun Resolution**: Handles follow-ups like "when was he born?" by understanding context
- **Incomplete Question Handling**: Routes unclear questions back to Noodle for clarification

### 🤖 Multi-Agent Architecture
- **Noodle Agent**: Main conversational agent with clarification capabilities
- **History Tutor Agent**: Specialized for historical questions and facts
- **Web Search Agent**: Real-time internet search using OpenAI's search model
- **Organized Tools**: Each agent has dedicated tools in separate files

### 🔧 Technical Improvements
- **Modular Tool Organization**: `tools/history-tools.js`, `tools/web-tools.js`, `tools/noodle-tools.js`
- **Clean Logging System**: Readable console output for easy debugging
- **API Compatibility**: Fixed web search integration with proper OpenAI API usage
- **Enhanced Error Handling**: Robust fallbacks and error management

## 📋 System Features

This enhanced system includes all original features plus advanced multi-agent capabilities:

- **Web Interface**: Modern browser-based chat interface at `http://localhost:3000`
- **Multi-Agent System**: Intelligent routing between specialized agents
- **Context Preservation**: Full conversation history maintained across agents
- **Real-Time Web Search**: Live internet search using OpenAI's search model
- **Historical Knowledge**: Specialized history agent for historical questions
- **Smart Clarification**: Handles incomplete questions intelligently
- **Secure**: Environment-based API key management with .gitignore protection

## 🛠️ Quick Start

1. **Clone this repository:**
   ```bash
   git clone https://github.com/boredjedi/agentic-trial-db-chat.git
   cd agentic-trial-db-chat
   ```

2. **Setup and configure API key:**
   ```bash
   # Create .env file with your OpenAI API key
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   
   # Start the web interface:
   node server.js
   # Open http://localhost:3000 in your browser
   ```

3. **Test the system:**
   ```bash
   # Run the comprehensive test suite
   node tests/test-noodle-prompt-engineering.js
   ```

## 🔧 Configuration

### Required Configuration
```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here
```

### Optional Configuration
```bash
# Model Configuration
OPENAI_MODEL=gpt-4o                        # Default: gpt-4o
OPENAI_SEARCH_MODEL=gpt-4o-search-preview  # For web search functionality

# Server Configuration  
PORT=3000                                  # Default: 3000
```

## 📁 Project Structure

```
agentic-trial-db-chat/
├── agents/                    # Multi-agent system
│   ├── noodle-agent.js       # Main conversational agent
│   ├── history-tutor-agent.js # Historical knowledge agent
│   └── web-search-agent.js   # Web search agent
├── tools/                     # Organized tool system
│   ├── history-tools.js      # History agent tools
│   ├── web-tools.js          # Web search tools
│   ├── noodle-tools.js       # General conversation tools
│   ├── utility-tools.js      # Utility functions (renamed from tools.js)
│   └── tools-mcp.js          # MCP (Model Context Protocol) tools
├── utils/                     # Utility functions
│   └── prompt-engineer.js    # Noodle-based prompt engineering
├── tests/                     # Test suite
│   ├── test-noodle-prompt-engineering.js # Main system test
│   └── README.md             # Test documentation
├── app.js                     # Core application logic
├── server.js                  # Web server
├── chat.html                  # Web chat interface
├── .env                       # Configuration file
└── README.md                  # This file
```

## 💬 Usage Examples

### Basic Conversation
```
User: "Hi, what's your name?"
Noodle: "Hi there! My name is Noodle, your friendly AI assistant..."

User: "Who was Napoleon?"
System: Routes to History Tutor
History Tutor: "Napoleon Bonaparte was a French military leader..."

User: "When was he born?"
System: Routes to History Tutor (understands "he" = Napoleon)
History Tutor: "Napoleon Bonaparte was born on August 15, 1769."
```

### Web Search
```
User: "What's the current gold rate?"
System: Routes to Web Search Agent
Web Search: Provides real-time gold price information
```

### Smart Clarification
```
User: "Know the weather?"
System: Routes to Noodle (incomplete question)
Noodle: "Which location's weather would you like to know about?"

User: "Pune"
System: Routes to Web Search Agent
Web Search: Provides weather for Pune, India
```

### Historical Facts
```
User: "Give me a fun historical fact"
System: Routes to History Tutor
History Tutor: "Did you know that in 18th-century England..."

User: "Another?"
System: Routes to History Tutor (understands "another" = another fact)
History Tutor: "Here's another fun fact..."
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

## 🚀 Key Innovations

This fork represents a significant evolution in multi-agent chat systems:

- **🧠 Noodle-Based Prompt Engineering**: Revolutionary approach to context-aware conversation
- **🤖 Intelligent Agent Routing**: Automatic selection of the best agent for each query
- **📝 Context Preservation**: Seamless conversation flow across multiple specialized agents
- **🔍 Real-Time Web Integration**: Live internet search capabilities
- **💡 Smart Clarification**: Intelligent handling of incomplete questions

---

**Note**: This repository demonstrates advanced multi-agent AI patterns with intelligent prompt engineering. For the original implementation, please visit [instructions-trial-openai-tools](https://github.com/boredjedi/instructions-trial-openai-tools).
