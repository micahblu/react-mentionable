import React, { useRef, useState, useEffect, useLayoutEffect, forwardRef } from 'react'
import * as utils from './utils'
import './styles.css'

export type Suggestion = {
  label: string
  value: string,
  [x: string]: any
}

export type Mention = {
  trigger: string 
  highlightClassName?: string
  mentionClassname?: string
  suggestions: Array<Suggestion> | ((searchStr: string) => Promise<Array<Suggestion>>)
}

type ReactMenttionableProps = {
  placeHolder?: string
  inputClass?: string
  suggestionsClass?: string
  defaultValue?: string
  onChange:  (props: { text: string, markup: string }) => void
  mentions: Array<Mention>
  renderSuggestion?: (suggestion: Suggestion, selectSuggestion: (suggestion: Suggestion) => void) => React.ReactElement, 
  disabled?: boolean
}

const ReactMentionable = forwardRef<HTMLDivElement, ReactMenttionableProps>((props: ReactMenttionableProps, ref: React.Ref<HTMLDivElement | null>) => {
  const {
    placeHolder,
    inputClass,
    suggestionsClass,
    mentions,
    onChange,
    renderSuggestion,
    disabled
  } = props

  const editorRef = useRef() as React.MutableRefObject<HTMLDivElement | null>
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<{label: string, value: string}>>([])
  const triggers = mentions.map(mention => mention.trigger)
  let isMatching = useRef<boolean>(false)
  let currentTrigger = useRef<string | undefined>()
  let matches =  useRef<Array<Suggestion>>([])
  let highlightEl = useRef<HTMLElement | undefined>() 

  const selectSuggestion = (suggestion: Suggestion) => {
    if (!editorRef.current || !highlightEl.current) return
    utils.insertMention({
      mentionClassname: mentions.find(m => m.trigger === currentTrigger.current)?.mentionClassname || '',
      trigger: currentTrigger.current || '',
      value: suggestion.value,
      editorEl: editorRef.current,
      label: suggestion.label, 
      highlightEl: highlightEl.current as HTMLElement 
    })
    setShowSuggestions(false)
    isMatching.current = false
  }
  useEffect(() => {
    if (disabled && editorRef.current) {
			editorRef.current.setAttribute('contenteditable', 'false')
			editorRef.current.style.opacity = '0.5'
		}  
  }, [disabled])

  useLayoutEffect(() => {
    if (!editorRef?.current) return
    const keyUpListener = (e: KeyboardEvent) => {
      if (!editorRef.current) return

      utils.removeFontTags(editorRef.current)
      const key = e.key || utils.getLastKeyStroke(editorRef.current)
      if (isMatching.current && key === 'Tab' || key === ' ') {
				const lastNode = utils.getLastNode(editorRef.current)
        if (!lastNode) return

        const nodeText: string = lastNode?.nodeValue?.replace(currentTrigger.current || '', '').toLowerCase() || ''

				if (highlightEl.current 
          && (matches.current.length === 1
          && isMatching.current)
          || matches.current.map(m => m.label).includes(nodeText)
        ) {
          utils.insertMention({
            mentionClassname: mentions.find(m => m.trigger === currentTrigger.current)?.mentionClassname || '',
            trigger: currentTrigger.current || '',
            value: matches.current[0].value,
            editorEl: editorRef.current,
            label: matches.current[0].label, 
            highlightEl: highlightEl.current as HTMLElement
          })
				} else if (isMatching.current && matches.current.length !== 1) {
					utils.removeHighlight(editorRef.current, highlightEl.current as HTMLElement)
					utils.autoPositionCaret(editorRef.current)
				}
        isMatching.current = false
        setShowSuggestions(false)
      }
      // if deleting last char, stop matching and hide suggestions
      else if (key === 'Backspace' && highlightEl.current?.innerText.length === 1) {
        e.preventDefault()
        isMatching.current = false
        setShowSuggestions(false)
      }
      else if (isMatching.current && key !== currentTrigger.current) {
				const inputStr = highlightEl.current?.innerText || ''
				const symbolIndex = inputStr.lastIndexOf(currentTrigger.current || '')
				const searchStr = inputStr.substr(symbolIndex + 1).replace(/[^\w]/, '')
				const regex = new RegExp(searchStr, 'i')

        const mention = mentions.find(m => m.trigger === currentTrigger.current)

        const suggestions = mentions.find(m => m.trigger === currentTrigger.current)?.suggestions as Array<Suggestion>
        if (Array.isArray(mention?.suggestions)) {
          if (suggestions) {
            matches.current = suggestions.filter((suggestion) => regex.test(suggestion.label))
            setSuggestions(matches.current)
          }
        } else {
          mention?.suggestions(searchStr).then((suggested: Array<Suggestion>) => {
            matches.current = suggested.filter((suggestion) => regex.test(suggestion.label))
            setSuggestions(matches.current)
          })
        }
			}

      onChange({
				text: editorRef.current.innerText,
        markup: utils.convertToMarkup(editorRef.current.innerHTML)
			})
    }
    
    const keyDownListener = (e: KeyboardEvent) => {
      const key = e.key || utils.getLastKeyStroke(editorRef.current)

      if (!key || !editorRef.current) return
      if (key === 'Enter') {
        e.preventDefault()
        const br = document.createElement('br')
        const textNode = document.createTextNode('\u200B')
        utils.insertAtCaretPos(editorRef.current, br)
        utils.insertAfter(textNode, br)
        utils.autoPositionCaret(editorRef.current)
      }
      else if (key === 'Tab') e.preventDefault()
      else if (triggers.includes(key)) {
        if (isMatching.current) {
          // Prevent reentering triggering symbol if already matching
          e.preventDefault()
          return
        }

        currentTrigger.current = key
        isMatching.current = true

        highlightEl.current = document.createElement('span')
        highlightEl.current.className = `${mentions.find(m => m.trigger === currentTrigger.current)?.highlightClassName}`
        highlightEl.current.innerText = currentTrigger.current 
        highlightEl.current.setAttribute('contentEditable', 'true')

        utils.insertAtCaretPos(editorRef.current, highlightEl.current)

        setShowSuggestions(true)
        utils.autoPositionCaret(highlightEl.current)
        utils.scrollIntoView(editorRef.current)
        e.preventDefault()
			}
    }

    editorRef.current.addEventListener('keydown', keyDownListener)
    editorRef.current.addEventListener('keyup', keyUpListener)
  }, [])

  return (
    <div className='react-mentionable'>
			<div className='react-mentionable-editor-container'>
			  <div
          placeholder={placeHolder}
          className={`react-mentionable-input ${inputClass}`}
          ref={(node) => {
            editorRef.current = node
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref) {
              ref.current
            }
          }} 
          contentEditable
          />
			</div>
			{showSuggestions && (
				<div className={`react-mentionable-suggestions ${suggestionsClass}`}>
					{suggestions && suggestions.map((suggestion) => {
            if (renderSuggestion) return renderSuggestion(suggestion, selectSuggestion)
            return (
						  <div
                onClick={() => selectSuggestion(suggestion)}
                key={suggestion.label}
                className='react-mentionable-suggestion'
              >
							  { suggestion.label }
						  </div>
            )
          })}
				</div>
			)}
		</div>
  )
}) 

export default ReactMentionable
