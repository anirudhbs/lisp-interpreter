const fs = require('fs')
const path = require('path')
const file = fs.readFileSync(path.join(__dirname,'./file')).toString()

let standardEnv = {
    '+' : input => input.reduce((sum, num) => sum+num, 0),
    '-' : input => input[0] - input[1],
    '*' : input => input.reduce((product, num) => product*num, 1),
    '/' : input => input[0] / input[1],
    '=' : input => input[0] === input[1] ? true : false,
    '<' : input => input[0] < input[1] ? true : false,
    '>' : input => input[0] > input[1] ? true : false,
    '<=' : input => input[0] <= input[1] ? true : false,
    '>=' : input => input[0] >= input[1] ? true : false
}
/*      'abs':     abs,
        'append':  op.add,
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
        'max':     max,
        'min':     min,
        'not':     op.not_,
        'null?':   lambda x: x == [],
        'number?': lambda x: isinstance(x, Number),
        'procedure?': callable,
        'round':   round,
        'symbol?': lambda x: isinstance(x, Symbol),
*/
const spaceParser = function(input){
    return /^(\s)+/.exec(input) ? input.replace(/^(\s)+/, '') : input
}

/*
function tokenize(input){ //convert string to tokens
    input = input.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').trim().split(/\s+/g)
}
*/

const numberParser = function(input){
    let string = /^\d+/.exec(input)
    return string ? [parseFloat(string[0]), input.slice(string[0].length)] : null
}

const identifierParser = function(input){
    let string = /^\w/.exec(input)
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
            let f = input.slice(0, EoF)
            //console.log(f)
            array.push(f)
            input = input.slice(EoF)
        }
        else{
            array.push(string[0])
            input = string[1]
        }
        input = spaceParser(input)
        if(input[0] === ')') break
        let value =  expressionParser(input)
        //console.log(value)
        if(value){
        array.push(value[0])
        input = value[1]
        }
    }
    let oc = functionParser(array)
    //console.log(oc)
    return [oc, input.slice(1)]
}

const valueParser = function(input){
    let result = (expressionParser(input) || numberParser(input) || identifierParser(input))
        return result
    return null
}

const functionParser = function(input){
    let operator = input[0], operation
    // input = input.slice(1)
    input.shift()
    let keys = Object.keys(standardEnv)
    for(let ar_i in keys)
        if(operator === keys[ar_i]){
            operation = standardEnv[keys[ar_i]]
            break
        }
    return operation(input)
}

console.log(valueParser(file))
// IDEA: lambda
// IDEA: if
// IDEA: define
