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
  'abs': input => Math.abs(input[0]),
  'max': input => Math.max(...input),
  'min': input => Math.min(...input),
  'pow': input => Math.pow(input[0], input[1]),
  'list': input => input,
  'car': input => input[0],
  'cdr': input => input.slice(1),
  'if': input => input[0] ? input[1] : input[2],
  'define': input => declaredVars[input[0]] = parseFloat(input[1]),
  'begin': input => input[input.length - 1],
}

let declaredVars = {}

const makeRE = () => {
  let keys = Object.keys(standardEnv),
    word, array = new Array
  for (let ar_i in keys) {
    word = /\w+/.exec(keys[ar_i])
    if (word) array.push(word[0])
  }
  return new RegExp(array.join('|'))
}

const spaceParser = input => {
  return /^(\s)+/.exec(input) ? input.replace(/^(\s)+/, '') : input
}

const numberParser = input => {
  let number = /^[-+]{0,1}\d+/.exec(input)
  return number ? [parseFloat(number[0]), input.slice(number[0].length)] : null
}

const functionParser = input => {
  let SEfunctionsRE = makeRE()
  let fxn = /^[/*+-]{1}/.exec(input) || /^[=<>]{1,2}/.exec(input) || SEfunctionsRE.exec(input) || /\w{1}/.exec(input)
  //console.log("fxn-", fxn);
  return fxn ? [fxn[0], input.slice(fxn[0].length)] : null
}

const booleanParser = input => {
  let bool = /(^true|^false)/.exec(input)
  if (!bool) return null
  return bool[0] === 'true' ? [true, input.slice(bool[0].length)] : [false, input.slice(bool[0].length)]
}

const expressionParser = input => {
  if (!input.startsWith('(')) return null
  input = input.slice(1)
  let array = new Array,
    value = null
  while (!input.startsWith(')')) {
    input = spaceParser(input)
    if (input.startsWith(')')) break
    value = valueParser(input)
    array.push(value[0])
    input = value[1]
  }
  //console.log("array:", array);
  let eval = functionEvaluator(array)
  return [eval, input.slice(1)]
}

const valueParser = input => {
  input = spaceParser(input)
  let result = expressionParser(input) || numberParser(input) || functionParser(input) || booleanParser(input)
  return result
}

const functionEvaluator = input => {
  if (input.length === 1) return input[0] //only 1 value in expression
  let fxn = input[0],
    args = input.slice(1)
  //console.log("args are:", args)
  for (let ar_i in args) {
    if (declaredVars[args[ar_i]] !== undefined) {
      //console.log(declaredVars[args[ar_i]]);
      args[ar_i] = declaredVars[args[ar_i]]
    }
  }
  //console.log("args:", args);
  //console.log("dec-", declaredVars);
  return standardEnv.hasOwnProperty(fxn) ? standardEnv[fxn](args) : null
}

const lispParser = input => {
  let temp = valueParser(input)
  let parsed = temp[0]
  //console.log("temp-", temp);
  //console.log(JSON.stringify(declaredVars, null, 2));
  //console.log("output:", parsed)

  temp = valueParser(temp[1])
  console.log(temp[0]);
}

fs.readFile(file, 'utf-8', (err, input) => lispParser(input))
