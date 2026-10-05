"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getRootDirs", {
    enumerable: true,
    get: function() {
        return getRootDirs;
    }
});
// Ture-maintained acquisition adapter. All lint rules retain upstream bytes.
var _picomatch = require("picomatch");
var _braceExpansion = require("brace-expansion");
var _globParent = require("glob-parent");
var _path = require("node:path");
var _fs = require("node:fs");
var matchOptions = { dot: false, posix: true, strictSlashes: false };
function dynamic(pattern) {
    return /[*?]|^!|\[[^[]*\]|(?:^|[^!*+?@])\([^(]*\|[^|]*\)|[!*+?@]\([^(]*\)|\{[^}]*[,]|\{[^}]*\.\./.test(pattern);
}
function existingDirectory(path) {
    try {
        return _fs.statSync(path).isDirectory();
    } catch (error) {
        if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return false;
        throw error;
    }
}
function tasks(patterns) {
    var groups = new Map();
    for (var pattern of patterns) {
        var base = _globParent(pattern, { flipBackslashes: false });
        if (!groups.has(base)) groups.set(base, []);
        groups.get(base).push(pattern);
    }
    var outside = [];
    var inside = [];
    for (var group of groups) {
        (group[0].startsWith('..') || group[0].startsWith('./..') ? outside : inside).push(group);
    }
    if (groups.has('.')) inside = [['.', inside.flatMap(function(group) { return group[1]; })]];
    return outside.concat(inside);
}
function partialMatcher(pattern) {
    var parts = _picomatch.scan(pattern, { parts: true }).parts;
    if (!parts.length) parts = [pattern];
    if (parts[0].startsWith('/')) {
        parts[0] = parts[0].slice(1);
        parts.unshift('');
    }
    var globstar = parts.indexOf('**');
    var expressions = parts.map(function(part) {
        return dynamic(part) ? _picomatch.makeRe(part, matchOptions) : null;
    });
    return function(filepath) {
        var actual = filepath.split('/');
        if (globstar < 0 && parts.length <= actual.length) return false;
        // Like the original walker, only the section before the first globstar
        // restricts descent. Full matching still excludes unrequested dot paths.
        var length = globstar < 0 ? actual.length : Math.min(actual.length, globstar);
        for (var i = 0; i < length; i++) {
            if (expressions[i] ? !expressions[i].test(actual[i]) : parts[i] !== actual[i]) return false;
        }
        return true;
    };
}
/**
 * Process a Next.js root directory glob.
 */ var processRootDir = function(rootDir) {
    var pattern = rootDir.replace(/\\/g, '/');
    if (pattern.length === 0) {
        throw new TypeError("Patterns must be a string (non empty) or an array of strings");
    }
    if (pattern.length > 10000) {
        throw new RangeError("Next rootDir glob exceeds the bounded length limit");
    }
    var depth = 0;
    var delimiters = 0;
    for (var character of pattern) {
        if (character === '{' || character === '(' || character === '[') {
            if (++delimiters > 1000) throw new RangeError("Next rootDir glob exceeds the bounded delimiter limit");
            if (++depth > 100) {
                throw new RangeError("Next rootDir glob exceeds the bounded nesting limit");
            }
        } else if (character === '}' || character === ')' || character === ']') {
            if (++delimiters > 1000) throw new RangeError("Next rootDir glob exceeds the bounded delimiter limit");
            depth = Math.max(0, depth - 1);
        }
    }
    if (pattern.startsWith('!') && pattern[1] !== '(') return [];
    // Ask for one beyond the limit: never silently accept a truncated expansion.
    // The original parser leaves a comma group starting with '..' unexpanded
    // as an invalid range. Do not turn that malformed configuration into roots.
    var expanded = /\{\.\.[^}]*,/.test(pattern) ? [pattern] : _braceExpansion.expand(pattern, {
        max: 1001, maxLength: 10020000, maxDepth: 101, maxRewrites: 1001
    });
    if (expanded.length > 1000) throw new RangeError("Next rootDir glob exceeds the bounded expansion limit");
    var patterns = Array.from(new Set(expanded)).filter(Boolean).sort(function(a, b) {
        return a.length - b.length;
    }).map(function(value) { return value.replace(/(?!^)\/{2,}/g, '/'); });
    var roots = [];
    var seen = new Set();
    var negative = patterns.filter(function(value) { return value.startsWith('!') && value[1] !== '('; }).map(function(value) { return value.slice(1); });
    var rejected = negative.map(function(value) { return _picomatch.makeRe(value, { ...matchOptions, dot: true }); });
    var forbiddenDescent = negative.filter(function(value) {
        return value.endsWith('/**') || !dynamic(_path.posix.basename(value));
    }).map(function(value) { return _picomatch.makeRe(value, matchOptions); });
    patterns = patterns.filter(function(value) { return !value.startsWith('!') || value[1] === '('; });
    function add(value) {
        var identity = value.replace(/^\.\//, '');
        if (rejected.some(function(expression) { return expression.test(identity) || expression.test(identity + '/'); })) return;
        if (!seen.has(identity)) { seen.add(identity); roots.push(value); }
    }
    // Static tasks precede dynamic tasks in the original plugin dependency.
    for (var literal of tasks(patterns.filter(function(value) { return !dynamic(value); })).flatMap(function(task) { return task[1]; })) {
        var expression = _picomatch.makeRe(literal, matchOptions);
        var filepath = literal.replace(/^\.\//, '');
        if (existingDirectory(literal) && (expression.test(filepath) || expression.test(filepath + '/'))) add(literal);
    }
    var visits = 0;
    for (var task of tasks(patterns.filter(dynamic))) {
        if (!existingDirectory(task[0])) continue;
        var expressions = task[1].map(function(value) { return _picomatch.makeRe(value, matchOptions); });
        var descend = task[1].map(partialMatcher);
        var absoluteBase = _path.resolve(task[0]);
        var queue = [{ disk: absoluteBase, display: task[0] === '.' ? '' : task[0], ancestors: new Set([_fs.realpathSync(absoluteBase)]) }];
        // Breadth first preserves task/result order, including directory symlinks.
        for (var cursor = 0; cursor < queue.length; cursor++) {
            var item = queue[cursor];
            for (var entry of _fs.readdirSync(item.disk, { withFileTypes: true })) {
                if (++visits > 100000) throw new RangeError("Next rootDir glob exceeds the bounded traversal limit");
                var disk = _path.join(item.disk, entry.name);
                if (!entry.isDirectory() && (!entry.isSymbolicLink() || !existingDirectory(disk))) continue;
                var display = item.display ? item.display + '/' + entry.name : entry.name;
                var filepath = display.replace(/^\.\//, '');
                if (expressions.some(function(expression) { return expression.test(filepath) || expression.test(filepath + '/'); })) add(display);
                if (!descend.some(function(matcher) { return matcher(filepath); })) continue;
                if (forbiddenDescent.some(function(expression) { return expression.test(filepath); })) continue;
                var real = _fs.realpathSync(disk);
                if (item.ancestors.has(real)) throw new RangeError("Next rootDir glob encountered a directory symlink cycle");
                var ancestors = new Set(item.ancestors);
                ancestors.add(real);
                queue.push({ disk: disk, display: display, ancestors: ancestors });
            }
        }
    }
    return roots;
};
var getRootDirs = function(context) {
    var rootDirs = [
        context.cwd
    ];
    var nextSettings = context.settings.next || {};
    var rootDir = nextSettings.rootDir;
    if (typeof rootDir === 'string') {
        rootDirs = processRootDir(rootDir);
    } else if (Array.isArray(rootDir)) {
        rootDirs = rootDir.map(function(dir) {
            return typeof dir === 'string' ? processRootDir(dir) : [];
        }).flat();
    }
    return rootDirs;
};
