const fs = require('fs')
const path = require('path')
const file = fs.readFileSync(path.join(__dirname,'./file')).toString()

let standardEnv = {
    '+' : input => input.reduce((sum, num) => sum+num, 0),
    '-' : input => input[0] - input[1],
    '*' : input => input.reduce((product, num) => product*num, 1),
    '/' : input => input[0] / input[1],

    '=' : input => input[0] === input[1],
    '<' : input => input[0] < input[1],
    '>' : input => input[0] > input[1],
    '<=' : input => input[0] <= input[1],
    '>=' : input => input[0] >= input[1],

    'if' : input => input[0] ? input[1] : input[2],
    'define' : input => standardEnv[input[0]] = input[1],
    'begin' : input => input.slice(0, -1),
    'write' : input => input[0],

    'abs' : input => Math.abs(input[0]),
    'max' : input => input.reduce((array, value) => Math.max(array, value)),
    'min' : input => input.reduce((array, value) => Math.min(array, value)),

    'lambda' : input => lambdaParser(input)
}

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

const expressionParser = function(input){
    if(input[0] !== '(') return null
    input = input.slice(1)
    let array = []
    while(input[0] !== ')'){
        input = spaceParser(input)
        if(input[0] === ')') break
        let string = valueParser(input)
        if(!string){
            let EoF = input.indexOf(' ')
            array.push(input.slice(0, EoF))
            input = input.slice(EoF)
        }
        else{
            array.push(string[0])
            input = string[1]
        }
        input = spaceParser(input)
        if(input[0] === ')') break
        let value = expressionParser(input)
        if(value){
            array.push(value[0])
            input = value[1]
        }
    }
    return [functionParser(array), input.slice(1)]
}

const valueParser = function(input){
    let result = (expressionParser(input) || numberParser(input) || identifierParser(input))
    return result
    return null
}

const functionParser = function(input){
    let operator = input[0], operation = null
    input.shift()
    let keys = Object.keys(standardEnv)
    for(let ar_i in keys)
        if(operator === keys[ar_i]){
            operation = standardEnv[keys[ar_i]]
            break
        }
    return operation(input)
}

const lambdaParser = function(input){
    console.log(input);
    return true
}

console.log(valueParser(file))

// IDEA: lambda
/*      'append':  op.add,
        'apply':   apply,
        'begin':   lambda *x: x[-1],
        'car':     lambda x: x[0],
        'cdr':     lambda x: x[1:],
        'cons':    lambda x,y: [x] + y,
        'eq?':     op.is_,
        'equal?':  op.eq,
        'length':  len,
        'list':    lambda *x: list(x),
        'list?':   lambda x: isinstance(x,list),
        'map':     map,
        'not':     op.not_,
        'null?':   lambda x: x == [],
        'number?': lambda x: isinstance(x, Number),
        'procedure?': callable,
        'round':   round,
        'symbol?': lambda x: isinstance(x, Symbol),
*/
