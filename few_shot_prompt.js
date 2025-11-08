/**
 * Converts a string to camelCase format
 * @param {string} str - The input string to convert
 * @returns {string} The camelCase version of the input string
 */
function toCamelCase(str) {
    // Return empty string if input is empty
    if (!str) return '';

    // Replace spaces, hyphens, and underscores with spaces
    // Then split into words
    const words = str.replace(/[-_\s]+/g, ' ').split(' ');

    // Convert first word to lowercase
    let result = words[0].toLowerCase();

    // Capitalize first letter of remaining words and add them
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        result += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }

    return result;
}

// Test cases
console.log(toCamelCase('first name'));     // firstName
console.log(toCamelCase('user_id'));        // userId
console.log(toCamelCase('SCREEN_NAME'));    // screenName
console.log(toCamelCase('mobile-number'));  // mobileNumber


// Convert numbers to English words (supports up to billions)
function numberToWords(num) {
    if (num === 0) return 'zero';
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
                  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
                  'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const scales = ['', 'thousand', 'million', 'billion'];

    function underThousand(n) {
        let parts = [];
        if (n >= 100) {
            parts.push(ones[Math.floor(n / 100)] + ' hundred');
            n = n % 100;
        }
        if (n >= 20) {
            parts.push(tens[Math.floor(n / 10)]);
            if (n % 10) parts.push(ones[n % 10]);
        } else if (n > 0) {
            parts.push(ones[n]);
        }
        return parts.join(' ');
    }

    let resultParts = [];
    let scaleIndex = 0;
    while (num > 0) {
        const chunk = num % 1000;
        if (chunk) {
            const chunkWords = underThousand(chunk);
            resultParts.unshift(chunkWords + (scales[scaleIndex] ? ' ' + scales[scaleIndex] : ''));
        }
        num = Math.floor(num / 1000);
        scaleIndex++;
    }
    return resultParts.join(' ').trim();
}

function convertToCamelCase(input) {
    if (!input || typeof input !== 'string') return '';

    // 1) Replace any character that is not a letter or digit with a space (keeps letters and digits)
    // This removes punctuation, emojis and special symbols.
    let cleaned = input.replace(/[^A-Za-z0-9]+/g, ' ');

    // 2) Replace digit sequences with their word equivalents (e.g. "23" -> "twenty three")
    cleaned = cleaned.replace(/\d+/g, (match) => {
        // parse as integer and convert; leading zeros become their numeric value
        const n = parseInt(match, 10);
        return numberToWords(n);
    });

    // 3) Normalize spaces, split into words and lowercase them
    const words = cleaned.trim().split(/\s+/).filter(Boolean).map(w => w.toLowerCase());

    if (words.length === 0) return '';

    // 4) Build camelCase: first word lowercase, subsequent words capitalized
    const first = words[0];
    const rest = words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1));
    return first + rest.join('');
}

// Examples / tests
console.log(convertToCamelCase('I like to play videogame')); // iLikeToPlayVideogame
console.log(convertToCamelCase('Prompt engineering is awesome')); // promptEngineeringIsAwesome
console.log(convertToCamelCase('The 23 street is far fr$om &here')); // theTwentyThreeStreetIsFarFromHere
console.log(convertToCamelCase('user_id')); // userId
console.log(convertToCamelCase('SCREEN_NAME')); // screenName
console.log(convertToCamelCase('mobile-number!')); // mobileNumber