import React, { useRef, useState, useEffect, useLayoutEffect, forwardRef } from 'react'
import * as utils from './utils'
import './styles.css'

export type Suggestion = {
  label: string
  value: string
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
  onSubmit:  (props: { text: string, markup: string }) => void
  mentions: Array<Mention>
  disabled?: boolean
}

const ReactMentionable = forwardRef<HTMLDivElement, ReactMenttionableProps>((props: ReactMenttionableProps, ref: React.Ref<HTMLDivElement | null>) => {
  const {
    placeHolder,
    inputClass,
    suggestionsClass,
    mentions,
    onChange,
    onSubmit,
    disabled
  } = props

  const editorRef = useRef() as React.MutableRefObject<HTMLDivElement | null>
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<{label: string, value: string}>>([])
  const selectSuggestion = (suggestion: { label: string, value: string }) => {}
  
  const triggers = mentions.map(mention => mention.trigger)
  let isMatching = false
  let currentTrigger: string | undefined
  let matches: Array<Suggestion> = []
  let highlightEl: HTMLElement | undefined 
  
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
      const key = e.key || utils.getLastKeyStroke(editorRef.current)
      if (key === 'Tab' || key === ' ' || key === 'Enter') {
				const lastNode = utils.getLastNode(editorRef.current)
        if (!lastNode) return
        const nodeText: string = lastNode?.nodeValue?.replace(currentTrigger || '', '').toLowerCase() || ''

				if (highlightEl && (matches.length === 1 && isMatching) || matches.map(m => m.label).includes(nodeText)) {
          utils.insertMention({
            mentionClassname: mentions.find(m => m.trigger === currentTrigger)?.mentionClassname || '',
            trigger: currentTrigger,
            value: matches[0].value,
            editorEl: editorRef.current,
            label: matches[0].label, 
            highlightEl: highlightEl as HTMLElement
          })
				} else if (isMatching && matches.length === 0) {
					utils.removeHighlight(editorRef.current, highlightEl as HTMLElement)
					utils.autoPositionCaret(editorRef.current)
				} else if (key === 'Enter' && onSubmit) {
					onSubmit({
						text: editorRef.current.innerText,
						markup: editorRef.current.innerHTML
					})
				}
        isMatching = false
        setShowSuggestions(false)
      }
      else if (key === 'Backspace') {
        // if deleting last char, stop matching and hide suggestions
        if (highlightEl?.innerText.length === 1) {
          isMatching = false
          setShowSuggestions(false)
        }
      }
      else if (isMatching && key !== currentTrigger) {
				const inputStr = highlightEl?.innerText || ''
				const symbolIndex = inputStr.lastIndexOf(currentTrigger || '')
				const searchStr = inputStr.substr(symbolIndex + 1).replace(/[^\w]/, '')
				const regex = new RegExp(searchStr, 'i')

        const mention = mentions.find(m => m.trigger === currentTrigger)

        const suggestions = mentions.find(m => m.trigger === currentTrigger)?.suggestions as Array<Suggestion>
        if (Array.isArray(mention?.suggestions)) {
          if (suggestions) {
            matches = suggestions.filter((suggestion) => regex.test(suggestion.label))
            setSuggestions(matches)
          }
        } else {
          mention?.suggestions(searchStr).then((suggested: Array<Suggestion>) => {
            matches = suggested.filter((suggestion) => regex.test(suggestion.label))
            setSuggestions(matches)
          })
        }
			}

      onChange({
				text: editorRef.current.innerText,
        markup: utils.convertToMarkup(editorRef.current.innerHTML)
			})
    }
    
    const keyDownListener = (e: KeyboardEvent) => {

      utils.removeBreaks(editorRef.current)

      const key = e.key || utils.getLastKeyStroke(editorRef.current)
      if (!key || !editorRef.current) return

      if (key === 'Enter' || key === 'Tab') e.preventDefault()
      else if (triggers.includes(key)) {
        if (isMatching) {
          // Prevent reentering triggering symbol if already matching
          e.preventDefault()
          return
        }

        currentTrigger = key
        // Remove any pesky br tags added by browser
        utils.removeBreaks(editorRef.current)

        isMatching = true

        highlightEl = document.createElement('span')
        highlightEl.className = `${mentions.find(m => m.trigger === currentTrigger)?.highlightClassName}`
        highlightEl.innerText = currentTrigger 
        highlightEl.setAttribute('contentEditable', 'true')

        utils.insertAtCaretPos(editorRef.current, highlightEl)

        setShowSuggestions(true)
        utils.autoPositionCaret(highlightEl)
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
					{suggestions && suggestions.map((suggestion) => (
						<div
              onClick={() => selectSuggestion(suggestion)}
              key={suggestion.label}
              className='react-mentionable-suggestion'
            >
							{ suggestion.label }
						</div>
					))}
				</div>
			)}
		</div>
  )
}) 

export default ReactMentionable
