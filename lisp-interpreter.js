const fs = require('fs')
const file = process.argv[2]

let standardEnv = {
    '+' : input => input.reduce((sum, num) => sum+num, 0),
    '-' : input => input[0] - input[1],
    '*' : input => input.reduce((product, num) => product*num, 1),
    '/' : input => input[0] / input[1],
    '=' : input => input[0] === input[1],
    '<' : input => input[0] < input[1],
    '<=' : input => input[0] <= input[1],
    '>' : input => input[0] > input[1],
    '>=' : input => input[0] >= input[1],

    'if' : input => input[0] ? input[1] : input[2],
    'define' : input => standardEnv[input[0]] = input[1],
    'begin' : input => input[input.length - 1],
    'abs' : input => Math.abs(input[0]),
    'max' : input => input.reduce((array, value) => Math.max(array, value)), //...array
    'min' : input => input.reduce((array, value) => Math.min(array, value)),
    'list' : input => input,
    'car' : input => input[0],
    'cdr' : input => input.slice(1)
}

let functions = ['if', 'define', 'begin', 'abs', 'max', 'min', 'list', 'car', 'cdr']
let functionRE = new RegExp(functions.join('|'))

let secondaryEnv = {}

const spaceParser = function(input){
    return /^(\s)+/.exec(input) ? input.replace(/^(\s)+/, '') : input
}

const numberParser = function(input){
    let string = /^[-+]{0,1}\d+/.exec(input)
    return string ? [parseFloat(string[0]), input.slice(string[0].length)] : null
}

const identifierParser = function(input){
    let string = /^\w+/.exec(input)
    return string ? [string[0], input.slice(string[0].length)] : null
}

const functionParser = function (input){
    let string = /^[*/+-]/.exec(input) || /^[=<>]{1,2}/.exec(input) || functionRE.exec(input)
    return string ? [string[0], input.slice(string[0].length)] : null
}

const expressionParser = function(input){
    if(input[0] !== '(') return null
    input = input.slice(1)
    let array = [], value = null
    while(input[0] !== ')'){
        input = spaceParser(input)
        let value = valueParser(input)
        if(!value) return null
        array.push(value[0])
        input = value[1]
    }
    console.log(array);
    return [functionEvaluator(array, standardEnv), input.slice(1)]
}

const valueParser = function(input){
    input = spaceParser(input)
    let result = (expressionParser(input) || numberParser(input) || functionParser(input) || identifierParser(input))
    return result
    return null
}

const functionEvaluator = function(input, currentEnv){
    let operator = input[0], operation = null
    input.shift()
    let keys = Object.keys(currentEnv)
    for(let ar_i in keys)
        if(operator === keys[ar_i]){
            operation = currentEnv[keys[ar_i]]
            break
        }
    return operation(input)
}

const lambdaParser = function(input){
    if(input.slice(0, 7) !== '(lambda') return null
    input = input.slice(9) //remove (lambda (
    let argumentArray = []
    while(input[0] !== ')'){    //arguments
        let argument = identifierParser(input)
        argumentArray.push(argument[0])
        input = argument[1]
        input = spaceParser(input)
    }
    secondaryEnv['arguments'] = argumentArray

    input = input.slice(2) //remove ) .
    let bodyString = '', count = 0
    do{ //body
        let char = input.slice(0,1)
        if(char === '(') count++
        if(char === ')') count--
        bodyString += char
        input = input.slice(1)
    }while(input[0] !== ')' && count !== 0)
    bodyString += ')'
    secondaryEnv['body'] = bodyString
    console.log(secondaryEnv);
    return true
}

//fs.readFile(file, 'utf-8', (error, input) => console.log(valueParser(input)))
fs.readFile(file, 'utf-8', (error, input) => console.log(lambdaParser(input)))
