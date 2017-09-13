const fs = require('fs')
const file = process.argv[2]

let standardEnv = {
    '+': input => input.reduce((sum, num) => sum + num, 0),
    '-': input => input[0] - input[1],
    '*': input => input.reduce((product, num) => product * num, 1),
    '/': input => input[0] / input[1],
    '=': input => input[0] === input[1],
    '<': input => input[0] < input[1],
    '<=': input => input[0] <= input[1],
    '>': input => input[0] > input[1],
    '>=': input => input[0] >= input[1],

    'if': input => input[0] ? input[1] : input[2],
    'define': input => standardEnv[input[0]] = input[1],
    'begin': input => input[input.length - 1],
    'abs': input => Math.abs(input[0]),
    'max': input => input.reduce((array, value) => Math.max(array, value)), //...array
    'min': input => input.reduce((array, value) => Math.min(array, value)),
    'list': input => input,
    'car': input => input[0],
    'cdr': input => input.slice(1),
    'print': input => input[0]
}

/*
let functions = ['if', 'define', 'begin', 'abs', 'max', 'min', 'list', 'car', 'cdr']
let functionRE = new RegExp(functions.join('|'))
*/

let secondaryEnv = {}

const spaceParser = function(input) {
    return /^(\s)+/.exec(input) ? input.replace(/^(\s)+/, '') : input
}

const numberParser = function(input) {
    let number = /^[-+]{0,1}\d+/.exec(input)
    return number ? [parseFloat(number[0]), input.slice(number[0].length)] : null
}

const stringParser = function(input) {
    let EoS = input.indexOf('"')
    return input[0] === '"' ? [input.slice(1, EoS), input.slice(EoS + 1)] : null
}

const functionParser = function(input) {
    let argument, fxn = /^[a-z]+/.exec(input) || /^[/*-+]/.exec(input) || /^[=<>]{1,2}/.exec(input)
    if (fxn) argument = spaceParser(input.slice(fxn[0].length))
    return fxn ? [fxn[0], argument] : null
}

const expressionParser = function(input) {
    if (input[0] !== '(') return null
    input = spaceParser(input.slice(1))
    let array,
        value
    if (array = lambdaParser(input) || defineParser(input)) return array
    array = []
    while (input[0] !== ')') {
        input = spaceParser(input)
        value = valueParser(input)
        if (!value) return null
        array.push(value[0])
        input = value[1]
    }
    return [functionEvaluator(array), input.slice(1)]
}

const valueParser = function(input) {
    return numberParser(input) || stringParser(input) || functionParser(input) || expressionParser(input)
}

const functionEvaluator = function(input) {
    let fxn = input[0],
        args = input.slice(1)
    for (let ar_i of args) {
        if (functionParser(ar_i) !== null && secondaryEnv[ar_i] !== undefined)
            ar_i = secondaryEnv[arg]
    }
    let keys = Object.keys(standardEnv),
        operation = null
    for (let ar_i in keys)
        if (fxn === keys[ar_i]) operation = standardEnv[keys[ar_i]]
    return operation ? operation(args) : procedure(fxn, args)
}

const lambdaParser = function(input) {
    if (input.slice(0, 6) !== 'lambda') return null
    let argumentArray = [],
        fxn = {},
        body
    input = input.slice(8)
    while (input[0] != ')') {
        if (input[0] === ')') return null
        let value = valueParser(input)
        argumentArray.push(value[0])
        input = value[1]
    }
    fxn.argumentArray = argumentArray
    input = spaceParser(input.slice(1))
    let EoE = input.indexOf('))')
    body = input.slice(0, (EoE + 1))
    fxn.body = body
    fxn.env = {}
    input = input.slice(body.length + 1)
    return [fxn, input]
}

const defineParser = function(input) {
    if (input.slice(0, 6) !== 'define') return null
    input = input.slice(7)
    let identifier,
        result
    identifier = functionParser(input)
    input = spaceParser(identifier[1])
    result = lambdaParser(input.slice(1))
    if (!result) return null
    secondaryEnv[identifier[0]] = result[0]
    result = spaceParser(result[1])
    result = result.slice(1)
    return [, result]
}

const procedure = function(fxn, args) {
    let keys = Object.keys(secondaryEnv)
    for (let ar_i in keys)
        if (fxn === keys[ar_i]) fxn = secondaryEnv[fxn]
    let argumentArray = fxn.argumentArray,
        body = fxn.body
    for (let ar_i in args) fxn.env[argumentArray[ar_i]] = args[ar_i]
    for (let argument in argumentArray) {
        let temp = argumentArray[argument]
        body = body.replace(new RegExp(temp), fxn.env[temp])
    }
    return expressionParser(body)[0]
}

const macroParser = function(input) {
    return true
}

// IDEA: parser()
const parser = function(input) {
    let temp = valueParser(input)
    input = temp[1].slice(1)
    temp = valueParser(spaceParser(input))
    if (temp[0] !== undefined) console.log(temp[0])
}

fs.readFile(file, 'utf-8', (err, input) => parser(input))
//fs.readFile(file, 'utf-8', (err, input) => console.log(macroParser(input)))
