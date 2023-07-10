# React Mentions 

React Mentions is a react component that allows for inlining mentions or tag labels in a text input field. It supports multiple tag sets triggered by a configured trigger character. `onChange` will return an object with text, html and markup.

### Getting started
```
npm i react-mentionable
```
### Usage
React Mentionable is an uncontrolled input, so to clear the input from say a submit button you'll need to create a ref and pass it as the ref prop of the ReactMentionable component that will give you access to 

```js
const fieldRef = useRef()
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
		// store values on change
	}}
	defaultValue={''}
	placeHolder='Write away'
	onSubmit={({ text, __html, markup }) => {
		// do something and clear the input
		fieldRef.current.innerHTML = ''
	}}
	inputClass='editor-class'
	mentions={mentions}
/>
<button
	onClick={() => {
		fieldRef.current.innerHTML = ''
	}}
>
	Submit
</button>
```
### Why

I wanted an input field that allows inlining multiple sets of tags triggered by any confiugured trigger character.
