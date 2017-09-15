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
  'max': input => input.reduce((array, value) => Math.max(array, value)),
  'min': input => input.reduce((array, value) => Math.min(array, value)),
  'pow': input => Math.pow(input[0], input[1]),
  'list': input => input,
  'car': input => input[0],
  'cdr': input => input.slice(1),
  //'print': input => console.log(input[0]),
  'if': input => input[0] ? input[1] : input[2],
  'define': input => standardEnv[input[0]] = parseFloat(input[1]),
  'r' : input => 10
}

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
    //console.log("value is", value[0]);
    array.push(value[0])
    input = value[1]
  }
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
  return standardEnv.hasOwnProperty(fxn) ? standardEnv[fxn](args) : null
}

const lispParser = input => {
  let temp = valueParser(input)
  let parsed = temp[0]

  console.log("output:", parsed)

  input = temp[1]
  temp = valueParser(input)
  parsed = temp[0]
  console.log("op2:", parsed);
}

fs.readFile(file, 'utf-8', (err, input) => lispParser(input))
