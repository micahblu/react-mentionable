# React Mentions 

React Mentions is a react component that allows for inlining mentions or tag labels in a text field. It supports multiple tags triggered by a configured trigger character. `onChange` will return an object with text and markup.

### Getting started
```
npm i react-mentionable
```
### Usage
React Mentionable is an uncontrolled input, so to clear the input from say a submit button you'll need to create a ref and pass it as the ref prop of the ReactMentionable component that will give you access to the contenteditable div that you can manually clear

The `onChange` event will return both plain text and markup text, the markup text will provide you the string value whereas the mentions will be formatted as `__@[label](value)__`. The `@` symbol being the trigger used for the given mention. You can then manipulate that formatted mention to be whatever you'd like, a link for example.

The mention suggestions can either be an array of {label, value, any} pairs or an async function that returns a promise that resolves to the same structure. 

```js
import ReactMentionable from 'react-mentionable'
...
const fieldRef = useRef()
const [fieldValue, setFieldValue] = useState('')

const apiCall = debounce((resolve: Function) => {
  window.setTimeout(() => {
    resolve([{
      label: 'Albert Einstein',
      value: '/people/albert-einstein'
    }, {
      label: 'Elon Musk',
      value: '/people/elon-musk'
    }]) 
  }, 200)
}, 100)


const fetchSuggestions = async (searchStr: string): Promise<Array<Suggestion>> => {
  return await new Promise((resolve) => {
    apiCall(resolve) 
  })
}

const mentions = [{
  trigger: '@',
  highlightClassName: 'mentionHighlight',
  mentionClassName: 'mention',
  suggestions: [
    { label: 'Elon Musk', value: '/elonmusk' },
    { label: 'Mike Tyson', value: '/miketyson' },
    { label: 'Albert Einstein', value: '/alberteinstein' },
    { label: 'Richard Feynman', value: '/rfeynman ' },
    { label: 'Nikola Tesla', value: '/nikolatesla' }
  ]}, {
  trigger: '#',
  highlightClassName: 'tagHighlight',
  mentionClassName: 'tag',
  suggestions: (searchStr) => fetchSuggestions(searchStr)
}]
```

```js
<ReactMentionable
  ref={fieldRef}
  autoFocus={true}
  onChange={({ text, __html, markup }) => {
    setFieldValue(markup)
  }}
  defaultValue={''}
  placeHolder='Write away'
  inputClass='editor-class'
  mentions={mentions}
/>
<button
  onClick={() => {
    // submit fieldValue and clear field
    fieldRef.current.innerHTML = ''
  }}
>
  Submit
</button>
```
### Why
I really appreciate the work done by react-mentions, however I found their solution didn't work for my use cases. Primarily the inability to color the mention text. In react-mentions you have a textarea field layered atop a div that adds markup for the mention, so while you can add a background or border you can't color the font as the textarea font overlaps it. React mentionable uses a contenteditable div whereas you can style the mentions however you'd like. It also doesn't have the same issues with syncing the textarea overlay that react-mentions does. 
