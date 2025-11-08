// refined_prompt.js
// GitHub Copilot

/**
 * Convert an English number (integer >= 0 and < 1e12) to words.
 * Returns lowercase words like "twenty three".
 * Falls back to digits string if out of supported range.
 */
function numberToWords(num) {
    if (typeof num !== 'number' || !isFinite(num) || num < 0) return String(num);
    const MAX = 1_000_000_000_000; // up to trillion-1
    if (num >= MAX) return String(num);

    const belowTwenty = [
        'zero','one','two','three','four','five','six','seven','eight','nine',
        'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen',
        'seventeen','eighteen','nineteen'
    ];
    const tens = [
        '','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'
    ];
    const scales = [
        { value: 1_000_000_000, name: 'billion' },
        { value: 1_000_000, name: 'million' },
        { value: 1_000, name: 'thousand' },
    ];

    function underThousand(n) {
        const parts = [];
        if (n >= 100) {
            parts.push(belowTwenty[Math.floor(n / 100)]);
            parts.push('hundred');
            n = n % 100;
        }
        if (n >= 20) {
            parts.push(tens[Math.floor(n / 10)]);
            if (n % 10) parts.push(belowTwenty[n % 10]);
        } else if (n > 0 || parts.length === 0) {
            parts.push(belowTwenty[n]);
        }
        return parts.join(' ');
    }

    if (num === 0) return 'zero';

    const out = [];
    for (const s of scales) {
        if (num >= s.value) {
            const chunk = Math.floor(num / s.value);
            out.push(underThousand(chunk));
            out.push(s.name);
            num = num % s.value;
        }
    }
    if (num > 0) {
        out.push(underThousand(num));
    }
    return out.join(' ');
}

/**
 * Convert a string to camelCase with rules:
 * - lowercase all normal words
 * - replace punctuation, special chars, emojis, hyphens, underscores with spaces
 * - replace numeric sequences with their written English words
 * - concatenate words, first word entirely lowercase, subsequent words start with uppercase
 * - keep acronyms/abbreviations (like "OECD" or "U.S.A.") intact (uppercase, dots removed)
 * - return descriptive error message for invalid input
 *
 * Examples:
 *  toCamelCase("I like to play videogame") -> "iLikeToPlayVideogame"
 *  toCamelCase("The 23 street is far fr$om &here") -> "theTwentyThreeStreetIsFarFromHere"
 *  toCamelCase("OECD is an international organization of 38 member countries")
 *    -> "OECDIsAnInternationalOrganizationOfThirtyEightMemberCountries"
 *
 * Note: numbers are converted to words (e.g., 23 -> "twenty three").
 */
function toCamelCase(input) {
    if (input === null || input === undefined) {
        return 'Invalid input: value is null or undefined; expected a non-empty string.';
    }
    if (typeof input !== 'string') {
        return 'Invalid input: expected a string.';
    }
    const trimmed = input.trim();
    if (trimmed.length === 0) {
        return 'Invalid input: empty or whitespace-only string.';
    }

    // Step 1: Replace any character that's NOT a letter, digit, dot, or whitespace with a space.
    // This removes punctuation, emojis, hyphens, underscores, etc.
    // Use Unicode property escapes to keep letters from all languages.
    const cleaned = trimmed.replace(/[^\p{L}\p{N}.\s]+/gu, ' ');

    // Step 2: Split into raw tokens by whitespace.
    const rawTokens = cleaned.split(/\s+/).filter(Boolean);
    if (rawTokens.length === 0) {
        return 'Invalid input: no usable words found after cleaning.';
    }

    const units = []; // array of { type: 'word'|'acronym', text: '...' }

    // Helper to push plain word units (split on inner non-letter boundaries)
    function pushWordChunk(chunk) {
        if (!chunk) return;
        // remove stray dots left inside non-acronym tokens
        const cleanedChunk = chunk.replace(/\./g, '');
        if (cleanedChunk.length === 0) return;
        units.push({ type: 'word', text: cleanedChunk.toLowerCase() });
    }

    // Detect acronyms/abbreviations:
    // - pure uppercase letters length >=2 (e.g., OECD)
    // - sequences like U.S.A. or U.S. (uppercase letter + dot, repeated)
    const acronymRegex = /^[A-Z]{2,}(\.[A-Z]{2,})*$/;
    const dottedAcronymRegex = /^(?:[A-Z]\.){2,}[A-Z]?$/; // e.g., U.S.A. or U.S.

    for (const token of rawTokens) {
        // If token is an acronym-like, keep it intact (remove dots)
        if (acronymRegex.test(token) || dottedAcronymRegex.test(token)) {
            const acronym = token.replace(/\./g, '');
            units.push({ type: 'acronym', text: acronym });
            continue;
        }

        // Otherwise, handle numeric sequences inside token.
        // Split token into parts where digits are separate: e.g., "room23a" => ["room", "23", "a"]
        const parts = token.split(/(\d+)/).filter(Boolean);
        for (const part of parts) {
            if (/^\d+$/.test(part)) {
                // number -> words (lowercase), then split into separate word chunks
                const n = parseInt(part, 10);
                const words = numberToWords(n); // e.g., "twenty three"
                words.split(/\s+/).forEach(w => { if (w) units.push({ type: 'word', text: w.toLowerCase() }); });
            } else {
                // Non-numeric part: it might still contain dots or mixed case; remove dots and split on non-letters
                // Keep letters, drop remaining punctuation (dots removed above but be safe)
                const cleanedPart = part.replace(/\./g, ' ');
                cleanedPart.split(/\s+/).forEach(p => {
                    if (!p) return;
                    // remove any remaining non-letter characters (like stray punctuation)
                    const onlyLetters = p.replace(/[^\p{L}]+/gu, '');
                    if (onlyLetters) pushWordChunk(onlyLetters);
                });
            }
        }
    }

    if (units.length === 0) {
        return 'Invalid input: no word tokens produced after processing.';
    }

    // Build camelCase: first unit special-cased, subsequent units TitleCase (except acronyms)
    let result = '';
    for (let i = 0; i < units.length; i++) {
        const u = units[i];
        if (i === 0) {
            // First unit:
            if (u.type === 'acronym') {
                // keep acronym as-is (intact)
                result += u.text;
            } else {
                // first word should be entirely lowercase
                result += u.text.toLowerCase();
            }
        } else {
            if (u.type === 'acronym') {
                result += u.text;
            } else {
                // Capitalize first letter, keep the rest lowercase
                result += u.text.charAt(0).toUpperCase() + u.text.slice(1).toLowerCase();
            }
        }
    }

    return result;
}

// Export for Node environments; also define as global for browsers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = toCamelCase;
}
if (typeof window !== 'undefined') {
    window.toCamelCase = toCamelCase;
}

// **********

function toDotCase(input) {
    if (input === null || input === undefined) {
        return 'Invalid input: value is null or undefined; expected a non-empty string.';
    }
    if (typeof input !== 'string') {
        return 'Invalid input: expected a string.';
    }
    const trimmed = input.trim();
    if (trimmed.length === 0) {
        return 'Invalid input: empty or whitespace-only string.';
    }

    const cleaned = trimmed.replace(/[^\p{L}\p{N}.\s]+/gu, ' ');
    const rawTokens = cleaned.split(/\s+/).filter(Boolean);
    if (rawTokens.length === 0) {
        return 'Invalid input: no usable words found after cleaning.';
    }

    const words = [];

    const acronymRegex = /^[A-Z]{2,}(\.[A-Z]{2,})*$/;
    const dottedAcronymRegex = /^(?:[A-Z]\.){2,}[A-Z]?\.?$/;

    function pushWordChunk(chunk) {
        if (!chunk) return;
        const c = chunk.replace(/\./g, '');
        const onlyLetters = c.replace(/[^\p{L}]+/gu, '');
        if (onlyLetters) words.push(onlyLetters.toLowerCase());
    }

    for (const token of rawTokens) {
        if (acronymRegex.test(token) || dottedAcronymRegex.test(token)) {
            words.push(token.replace(/\./g, ''));
            continue;
        }

        const parts = token.split(/(\d+)/).filter(Boolean);
        for (const part of parts) {
            if (/^\d+$/.test(part)) {
                const n = parseInt(part, 10);
                const spelled = numberToWords(n);
                spelled.split(/\s+/).forEach(w => { if (w) words.push(w.toLowerCase()); });
            } else {
                const replaced = part.replace(/\./g, ' ');
                replaced.split(/\s+/).forEach(p => {
                    if (!p) return;
                    const onlyLetters = p.replace(/[^\p{L}]+/gu, '');
                    if (onlyLetters) words.push(onlyLetters.toLowerCase());
                });
            }
        }
    }

    if (words.length === 0) {
        return 'Invalid input: no word tokens produced after processing.';
    }

    return words.join('.');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports.toDotCase = toDotCase;
}
if (typeof window !== 'undefined') {
    window.toDotCase = toDotCase;
}