/**
 * Funtionality for working with JavaScript
 */
const isFunc = (def) => typeof def === 'function'

const isUnd = (def) => def === undefined

const splitTrim = (str, char) => str.split(char).map(item => item.trim())

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

/*
 * Converts an array of objects to one object with arrays.
 *
 * in:  [{k: 'a', ...}, {k: 'b', ...}]
 * out: {a: [...], b: [...]}
 */
const groupArray = (ar, key, f) => {
	const obj = {}
	ar.forEach(i => {
		let k = i[key]
		if (!obj.hasOwnProperty(k)) {
      obj[k] = []
    }
    obj[k].push(f(i))
	})
	return obj
}

/**
 * Returns undefined if string is only whitespace, else the original string.
 */
function clearIfEmpty(str) {
	if (str.trim().length > 0) {
		return str
	}
}
	
const arrayStartsWith = (origin, test) => {
	if (test.length <= origin.length) {
		return false
	}
	for (const [i, v] of origin.entries()) {
		if (test[i] !== v) {
			return false
		}
	}
	return true
}

/**
 * Replaces arg variables if found.
 * 
 * replaceArgs("foo(n, c, o)", "c", "component")  >>  "foo(n, component, o)"
 * replaceArgs("foo(n, c, o)", "X", "X")  >>  "foo(n, c, o)"
 * 
 * Only works on last set of brackets, so:
 * 
 * replaceArgs("foo(n, c, o).bar(c, p)", "c", "X")  >>  "foo(n, c, o).bar(X, p)"
 * 
 * @param {string} str 
 * @param {string} oldArg 
 * @param {string} newArg 
 */
const replaceArgs = (str, oldArg, newArg) => {
	const openArgBracket = str.lastIndexOf("(");
	const closeArgBracket = str.lastIndexOf(")");
	if (openArgBracket >=0 && closeArgBracket >= openArgBracket) {
		const argString = str.slice(openArgBracket + 1, closeArgBracket)
		const argsArray = argString.split(',').map(s => s.trim())
		const argPostition = argsArray.indexOf(oldArg)
		if (argPostition >= 0) {
			argsArray[argPostition] = newArg
			return str.slice(0, openArgBracket + 1) + argsArray.join(',') + ')'
		}
	}
	return str
}

/*
 * Given an array of nodeIndexPaths such as
 *
 *   [
 *     [0],
 *     [0, 1],
 *     [0, 2],
 *     [1],
 *   ]
 *
 * It returns an array the number of nested items, like so:
 *
 *  [2, 0, 0, 0]
 *
 *
 */
const extractShieldCounts = (paths) => {
	const processedPaths = []

	paths.forEach(path => {
		processedPaths.forEach(processed => {
			if (arrayStartsWith(processed.path, path)) {
				processed.count ++
			}
		})
		processedPaths.push({path: path, count: 0})
	})
	return processedPaths.map(i => i.count)
}


const escapeSingleQuotes = (text) => text.replace(/'/g, "\\'")
const escapeDoubleQuotes = (text) => text.replace(/"/g, '\\"')


module.exports = {
	arrayStartsWith,
	capitalize,
	clearIfEmpty,
	escapeSingleQuotes,
	escapeDoubleQuotes,
	extractShieldCounts,
	groupArray,
	isFunc,
	isUnd,
	replaceArgs,
	splitTrim
}
