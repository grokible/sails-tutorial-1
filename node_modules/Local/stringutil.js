module.exports = {
    // Clean proper name - removes whitespace and upcases first character

    cleanProperName: function (s) {
        if (s == null)
            throw { message: 'null argument passed (requires string)', code: 'call.badArgument' }

        var s2 = s.replace (/\s/g, "");  // remove all whitespace
        if (s2.length == 0)
            return s2;
        return s2.substring (0, 1).toUpperCase () + s2.substring (1);
    }
}