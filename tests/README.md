# Test Files

This directory contains all test files for the OpenAI chat application with tool integration.

## Test Categories

### Core Functionality Tests
- `test-server.js` - Basic server connection test
- `test-server-connection.js` - Server connectivity validation
- `test-mcp-schema.js` - MCP schema validation tests

### File Upload Tests
- `test-file-upload.js` - Basic file upload functionality
- `test-upload-timing.js` - File upload performance testing
- `test-small-upload.js` - Small file upload tests
- `test-upload-debug.js` - Debug file upload issues
- `test-pdf-upload.js` - PDF file upload testing
- `test-pdf-create.js` - PDF creation and upload workflow

### Vector Store Tests
- `test-vector-store.js` - Vector store creation and management
- `test-vector-store-list.js` - List and query vector stores
- `test-vector-store-debug.js` - Debug vector store issues

### Tool Integration Tests
- `test-multi-tool.js` - Multi-tool assistant functionality
- `test-file-search.js` - File search tool testing
- `test-specific-search.js` - Specific search queries

### Workflow Tests
- `test-complete-workflow.js` - End-to-end workflow testing
- `test-final.js` - Final integration tests

### Web Interface Tests
- `test-upload.html` - Web-based upload testing
- `test-simple-upload.html` - Simple upload interface

### Test Data
- `sample-document.txt` - Sample text document for testing
- `test-small.txt` - Small text file for upload tests
- `test-simple.pdf` - Simple PDF for upload tests

## Running Tests

Most tests can be run with:
```bash
node tests/test-filename.js
```

HTML test files can be accessed via the web server:
- http://localhost:3000/test-upload
- http://localhost:3000/simple-test

## Environment Requirements

Make sure you have the following environment variables set:
- `OPENAI_API_KEY` - Your OpenAI API key
- `OPENAI_MODEL` - Model to use (defaults to gpt-4o-mini)
- `OPENAI_ASSISTANT_ID` - Assistant ID (optional, will create if not set) 