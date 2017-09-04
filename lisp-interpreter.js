function tokenize(input){ //convert string to tokens
    input = input.replace(/\(/g, ' ( ')
    input = input.replace(/\)/g, ' ) ')
    input = input.trim()
    return input.split(/\s+/g)
}

function parse(input){
    return readFromTokens(tokenize(input))
}

function readFromTokens(tokens){
    let token = tokens.shift()
    if(token === '('){
        let expression = []
        while(tokens[0] !== ')'){
            expression.push(readFromTokens(tokens))
        }
        tokens.shift() //remove )
        return expression
    }
    if(token === ')') return null
    return atom(token)
}

function atom(token){
    let float = parseFloat(token)
    if(!isNaN(float)) return float
    return token
}

let program = "(begin (define r 10) (* pi (* r r)))"
console.log(parse(program))
