// test-mcp-schema.js - Test specific MCP schema examples
const { 
    checkApprovalRequirement, 
    validateToolParameters, 
    checkToolCallPermission 
} = require('./tools-mcp');

console.log('🧪 Testing Specific MCP Schema Examples\n');

// Test 1: "require_approval": "never"
console.log('1. Testing require_approval: "never"');
const tool1 = {
    function: {
        name: 'test_tool',
        require_approval: 'never'
    }
};
const approval1 = checkApprovalRequirement(tool1, {});
console.log('Result:', approval1.required ? '❌ Requires Approval' : '✅ No Approval Needed');
console.log();

// Test 2: "required": ["repoName"]
console.log('2. Testing required: ["repoName"]');
const tool2 = {
    function: {
        name: 'test_tool',
        parameters: {
            type: 'object',
            properties: {
                repoName: { type: 'string' },
                optional: { type: 'string' }
            },
            required: ['repoName']
        }
    }
};

// Test with missing required parameter
const validation2a = validateToolParameters(tool2, { optional: 'test' });
console.log('Missing repoName:', validation2a.valid ? '✅ Valid' : '❌ Invalid');
console.log('Errors:', validation2a.errors.join(', '));

// Test with required parameter present
const validation2b = validateToolParameters(tool2, { repoName: 'my-repo', optional: 'test' });
console.log('With repoName:', validation2b.valid ? '✅ Valid' : '❌ Invalid');
console.log();

// Test 3: "allowed_tools": ["ask_question"]
console.log('3. Testing allowed_tools: ["ask_question"]');
const tool3 = {
    function: {
        name: 'test_tool',
        allowed_tools: ['ask_question']
    }
};

const permission3a = checkToolCallPermission(tool3, 'ask_question');
console.log('Calling ask_question:', permission3a.allowed ? '✅ Allowed' : '❌ Denied');
console.log('Reason:', permission3a.reason);

const permission3b = checkToolCallPermission(tool3, 'forbidden_tool');
console.log('Calling forbidden_tool:', permission3b.allowed ? '✅ Allowed' : '❌ Denied');
console.log('Reason:', permission3b.reason);
console.log();

// Test 4: Complex "require_approval" object with tool_names
console.log('4. Testing complex require_approval object');
const tool4 = {
    function: {
        name: 'test_tool',
        require_approval: {
            type: 'conditional',
            tool_names: ['ask_question', 'read_wiki_structure'],
            message: 'This tool accesses sensitive information'
        }
    }
};

const approval4a = checkApprovalRequirement(tool4, { tool: 'ask_question' });
console.log('With ask_question involvement:', approval4a.required ? '✋ Requires Approval' : '✅ No Approval');
console.log('Reason:', approval4a.reason);

const approval4b = checkApprovalRequirement(tool4, { tool: 'safe_tool' });
console.log('With safe_tool involvement:', approval4b.required ? '✋ Requires Approval' : '✅ No Approval');
console.log();

console.log('🎉 All schema examples tested successfully!');
