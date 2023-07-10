declare module 'react-mentionable/index' {
  export function sum(num1: number, num2: number): number;

}
declare module 'react-mentionable' {
  import main = require('react-mentionable/src/index');
  export = main;
}