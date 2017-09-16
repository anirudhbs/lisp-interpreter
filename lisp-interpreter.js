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
  'define': input => standardEnv[input[0]] = parseFloat(input[1]),
  'begin': input => input[input.length - 1],
  'begin': input => input.slice(0, input.length - 1),
  'abs': input => Math.abs(input[0]),
  'max': input => input.reduce((array, value) => Math.max(array, value)), //...array
  'min': input => input.reduce((array, value) => Math.min(array, value)),
  'list': input => input,
  'car': input => input[0],
  'cdr': input => input.slice(1),
  'print': input => console.log(input[0]),
  'pow': input => Math.pow(input[0], input[1])
}

let secondaryEnv = new Object()

const spaceParser = input => {
  return /^(\s)+/.exec(input) ? input.replace(/^(\s)+/, '') : input
}

const numberParser = input => {
  let number = /^[-+]{0,1}\d+/.exec(input)
  return number ? [parseFloat(number[0]), input.slice(number[0].length)] : null
}

const stringParser = input => {
  let EoS = input.indexOf(' ') // IDEA: print strings"
  return input.startsWith('"') ? [input.slice(1, EoS), input.slice(EoS + 1)] : null
}

const functionParser = input => {
  let fxn = /^[a-z]+/.exec(input) || /^[/*-+]/.exec(input) || /^[=<>]{1,2}/.exec(input)
  if (fxn) input = spaceParser(input.slice(fxn[0].length))
  return fxn ? [fxn[0], input] : null
}

const expressionParser = input => {
  if (input[0] !== '(') return null
  input = input.slice(1)
  let array,
    value
  if (array = lambdaParser(input)) return array
  array = []
  while (input[0] !== ')') {
    value = valueParser(input)
    if (!value) return null
    array.push(value[0])
    input = value[1]
  }
  return [functionEvaluator(array), input.slice(1)]
}

const valueParser = input => {
  input = spaceParser(input)
  return numberParser(input) || stringParser(input) || functionParser(input) || expressionParser(input)
}

const functionEvaluator = input => {
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

const lambdaParser = input => {
  if (!input.startsWith('define')) return null
  input = input.slice(7)
  let identifier,
    result
  identifier = functionParser(input)
  input = spaceParser(identifier[1])
  result = LambdaHelper(input.slice(1))
  if (!result) return null
  secondaryEnv[identifier[0]] = result[0]
  input = spaceParser(result[1])
  input = input.slice(1)
  return [null, input]
}

const LambdaHelper = input => {
  if (!input.startsWith('lambda')) return null
  input = input.slice(8)
  let argumentArray = new Array,
    fxn = new Object(),
    body
  while (input[0] != ')') { //arguments
    input = spaceParser(input)
    if (input[0] === ')') return null
    let value = valueParser(input)
    argumentArray.push(value[0])
    input = value[1]
    input = spaceParser(input)
  }
  fxn.argumentArray = argumentArray
  input = spaceParser(input.slice(1))
  let EoE = input.indexOf('))') //body
  body = input.slice(0, (EoE + 1))
  fxn.body = body
  fxn.env = {}
  input = input.slice(body.length + 1)
  return [fxn, input]
}

const procedure = (fxn, args) => {
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

const parser = input => {
  while (input) {
    let temp = valueParser(input)
    if (temp[0]) console.log(temp[0])
    input = temp[1].slice(1)
    input = spaceParser(input)
  }
}

fs.readFile(file, 'utf-8', (err, input) => parser(input))
