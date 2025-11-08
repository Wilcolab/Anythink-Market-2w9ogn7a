
function toCamelCase(str) {
    // Split the string by spaces and filter out empty strings
    return str
        .split(' ')
        .filter(word => word.length > 0)
        .map((word, index) => {
            // If it's the first word, convert to lowercase
            if (index === 0) {
                return word.toLowerCase();
            }
            // For other words, capitalize first letter and lowercase the rest
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('');
}

// Example usage:
// console.log(toCamelCase('you will shine')); // outputs: 'youWillShine'
// console.log(toCamelCase('hello world test')); // outputs: 'helloWorldTest'