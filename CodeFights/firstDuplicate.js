function firstDuplicate(a) {
    var b = a;
    var obj = {};

    for(var i=0; i<a.length; i++){

        if (obj[a[i]] == 1) {
            return a[i];
        }
        obj[a[i]] = 1;
    }
    return -1;
}
// Note: Write a solution with O(n) time complexity and O(1) additional space complexity.
// Example
//
// For a = [2, 3, 3, 1, 5, 2], the output should be
// firstDuplicate(a) = 3.
//
// There are 2 duplicates: numbers 2 and 3. The second occurrence of 3 has a smaller index than than second occurrence of 2 does, so the answer is 3.
//
// For a = [2, 4, 3, 5, 1], the output should be
// firstDuplicate(a) = -1.
