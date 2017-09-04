const fs = require('fs')
const path = require('path')
const file = fs.readFileSync(path.join(__dirname,'./file')).toString()

const spaceParser = function(input){
    return /^(\s)+/.exec(input) ? input.replace(/^(\s)+/, '') : input
}

const numberParser = function(input){
    let string = /^\d+/.exec(input)
    return string ? [parseFloat(string[0]), input.slice(string[0].length)] : null
}

const variableParser = function(input){
    let string = /^[a-z]+/.exec(input)
    return string ? [string[0], input.slice(string[0].length)] : null
}

const expressionParser = function(input){
    if(input[0] !== '(') return null
    input = input.slice(1)
    let result = []
    while(input[0] !== ')'){

    }
    return [result, input.slice(1)]
}

const parser = function(input){
    let result = (expressionParser(input) || numberParser(input) || variableParser(input))
        return result
    return null
}
console.log(parser(file))

// IDEA: parse empty ()
// IDEA: parse num value
// IDEA: var name parse
// IDEA: parse basic math
