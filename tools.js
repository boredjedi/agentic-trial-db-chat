// tools.js - Tool functions and definitions

// Tool functions
function getCurrentTime(timezone = 'UTC') {
    const now = new Date();
    const options = {
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    };
    
    return {
        current_time: now.toLocaleString('en-US', options),
        timestamp: now.toISOString(),
        timezone: timezone
    };
}

async function getWeather(location, units = 'metric') {
    // Mock weather function - in production, you'd call a real weather API
    // For now, returning simulated data
    const weatherData = {
        location: location,
        temperature: Math.floor(Math.random() * 35) + 5, // Random temp between 5-40°C
        condition: ['sunny', 'cloudy', 'rainy', 'partly cloudy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 100),
        wind_speed: Math.floor(Math.random() * 20) + 5,
        units: units,
        timestamp: new Date().toISOString()
    };
    
    // Add some realistic variations based on location
    if (location.toLowerCase().includes('london')) {
        weatherData.condition = 'rainy';
        weatherData.temperature = Math.floor(Math.random() * 15) + 10;
    } else if (location.toLowerCase().includes('dubai')) {
        weatherData.condition = 'sunny';
        weatherData.temperature = Math.floor(Math.random() * 20) + 25;
    } else if (location.toLowerCase().includes('new york')) {
        weatherData.temperature = Math.floor(Math.random() * 25) + 5;
    }
    
    return weatherData;
}

// Tool definitions
const AVAILABLE_TOOLS = [
    {
        type: "function",
        function: {
            name: "get_current_time",
            description: "Get the current time in a specified timezone",
            parameters: {
                type: "object",
                properties: {
                    timezone: {
                        type: "string",
                        description: "The timezone to get the time for (e.g., 'UTC', 'America/New_York', 'Europe/London')",
                        default: "UTC"
                    }
                },
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_weather",
            description: "Get current weather information for a specified location",
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "The location to get weather for (e.g., 'London', 'New York', 'Dubai')"
                    },
                    units: {
                        type: "string",
                        description: "Temperature units - 'metric' for Celsius, 'imperial' for Fahrenheit",
                        enum: ["metric", "imperial"],
                        default: "metric"
                    }
                },
                required: ["location"]
            }
        }
    }
];

// Execute tool function
async function executeToolFunction(toolCall) {
    const { name, arguments: args } = toolCall.function;
    
    switch (name) {
        case 'get_current_time':
            const timezone = args.timezone || 'UTC';
            return getCurrentTime(timezone);
            
        case 'get_weather':
            const location = args.location;
            const units = args.units || 'metric';
            return await getWeather(location, units);
            
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}

// Export all tools functionality
module.exports = {
    AVAILABLE_TOOLS,
    executeToolFunction,
    getCurrentTime,
    getWeather
};
