palindromeRearranging = (a) => {
    let map = {};
    let sum = 0;

    for(let i = 0; i<a.length; i++) {
        sum += ((map[a[i]] = -~map[a[i]])%2) *2 - 1;
    }
    return (sum == 0 || sum == 1);
}
// Given a string, find out if its characters can be rearranged to form a palindrome.
// Example
// For inputString = "aabb", the output should be
// palindromeRearranging(inputString) = true.
//
// We can rearrange "aabb" to make "abba", which is a palindrome.
