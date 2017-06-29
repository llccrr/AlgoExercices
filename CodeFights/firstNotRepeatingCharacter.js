function firstNotRepeatingCharacter(s) {
    var obj={};
    // - reverse every bit and add 1, ~reverse everybyte so we just added 1.
    for(char of s) {
        obj[char] = -~obj[char];
    }
    for (key in obj) {
        if(obj[key] == 1)
            return key
    }
    return '_';
}

// Note: Write a solution that only iterates over the string once and uses O(1) additional memory
// For s = "abacabad", the output should be
// firstNotRepeatingCharacter(s) = 'c'.
//
// There are 2 non-repeating characters in the string: 'c' and 'd'. Return c since it appears in the string first.
//
// For s = "abacabaabacaba", the output should be
// firstNotRepeatingCharacter(s) = '_'.
//
// There are no characters in this string that do not repeat.
