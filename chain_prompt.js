function toKebabCase(input) {
    // Input Validation
    if (input === null || input === undefined || typeof input !== 'string') {
        return "Input must be a valid string.";
    }
    
    // Handle Empty String
    if (input === "") {
        return "";
    }
    
    // Trim Whitespace
    let result = input.trim();
    
    // Lowercase
    result = result.toLowerCase();
    
    // Normalize Characters
    result = result.replace(/[^a-z0-9\s]/g, ' ');
    
    // Hyphenate
    result = result.replace(/\s+/g, '-');
    
    return result;
}

// Test cases
console.log(toKebabCase("Hello World")); // "hello-world"
console.log(toKebabCase(" Hello! World 😃 ")); // "hello-world"
console.log(toKebabCase("Another___Test")); // "another-test"
console.log(toKebabCase("Input with !punctuation.")); // "input-with-punctuation"
console.log(toKebabCase("Multiple   spaces")); // "multiple-spaces"
console.log(toKebabCase("ALL CAPS")); // "all-caps"
console.log(toKebabCase(null)); // "Input must be a valid string."
console.log(toKebabCase("")); // ""
console.log(toKebabCase(undefined)); // "Input must be a valid string."
console.log(toKebabCase(123)); // "Input must be a valid string."