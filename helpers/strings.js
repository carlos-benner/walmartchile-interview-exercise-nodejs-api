function isPalindrome(str) {
    const re = /[\W_]/g;
    str = str.toLowerCase().replace(re, '');
    let revStr = str.split('').reverse().join('');
    return str === revStr;
}
module.exports = isPalindrome;
