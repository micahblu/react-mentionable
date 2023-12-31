import React, { useRef, useState, useEffect, useLayoutEffect, forwardRef, MutableRefObject } from 'react'
import * as utils from './utils'

export type Suggestion = {
  label: string
  value: string,
  [x: string]: any
}

export type Mention = {
  trigger: string 
  requireMatch?: boolean
  highlightClassName?: string
  keepTrigger?: boolean
  mentionClassName?: string
  suggestions: Array<Suggestion> | ((searchStr: string) => Promise<Array<Suggestion>>)
}

type ReactMenttionableProps = {
  placeHolder?: string
  inputClassName?: string
  suggestionsClassName?: string
  defaultValue?: string
  onChange:  (props: { text: string, markup: string }) => void
  mentions: Array<Mention>
  renderSuggestion?: (trigger: string, suggestion: Suggestion, selectSuggestion: (suggestion: Suggestion) => void) => React.ReactElement, 
  disabled?: boolean
}

export const MENTION_HIGHLIGHT_CLASSNAME = 'react-mentionable-highlight'

const ReactMentionable = forwardRef<HTMLDivElement, ReactMenttionableProps>(
  (
    props: ReactMenttionableProps,
    ref
  ) => {
  const {
    placeHolder,
    defaultValue,
    inputClassName,
    suggestionsClassName,
    mentions,
    onChange,
    renderSuggestion,
    disabled
  } = props

  const editorRef = useRef() as React.MutableRefObject<HTMLDivElement | null>
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<{label: string, value: string}>>([])
  const triggers = mentions.map(mention => mention.trigger)
  let currentTrigger = useRef<string | undefined>()
  let matches =  useRef<Array<Suggestion>>([])

  const selectSuggestion = (suggestion: Suggestion) => {
    const highlightEl = document.getElementsByClassName(MENTION_HIGHLIGHT_CLASSNAME)[0] as HTMLSpanElement 
    if (!editorRef.current || !highlightEl) return
    const mention = mentions.find(m => m.trigger === currentTrigger.current)
    utils.insertMention({
      mentionClassName: mention?.mentionClassName || '',
      trigger: currentTrigger.current || '',
      keepTrigger: mention?.keepTrigger || false,
      value: suggestion.value,
      editorEl: editorRef.current,
      label: suggestion.label, 
      highlightEl: highlightEl
    })
    setShowSuggestions(false)
  }

  const onPasteListener = (e: ClipboardEvent) => {
    e.preventDefault()
    const paste = e.clipboardData?.getData('text') || ''

    const selection = window.getSelection()

    if (!selection?.rangeCount) return
    selection.deleteFromDocument()
    selection.getRangeAt(0).insertNode(document.createTextNode(paste))
    selection.collapseToEnd()
  }

  const keyUpListener = (e: KeyboardEvent) => {
    if (!editorRef.current) return
    const highlightEl = document.getElementsByClassName(MENTION_HIGHLIGHT_CLASSNAME)[0] as HTMLSpanElement 
    
    utils.removeFontTags(editorRef.current)
    const key = e.key || utils.getLastKeyStroke(editorRef.current)
    if (highlightEl && key === 'Tab' || key === ' ') {
      const requireMatch = mentions.find(m => m.trigger === currentTrigger.current)?.requireMatch

      if (matches.current.length && key ==='Tab') {
        // autofill top suggestion
        const mention = mentions.find(m => m.trigger === currentTrigger.current)
        utils.insertMention({
          mentionClassName: mention?.mentionClassName || '',
          trigger: currentTrigger.current || '',
          keepTrigger: mention?.keepTrigger || false,
          value: matches.current[0].value,
          editorEl: editorRef.current,
          label: matches.current[0].label, 
          highlightEl: highlightEl
        })
      }
      else if (!requireMatch) {
        const mention = mentions.find(m => m.trigger === currentTrigger.current)
        utils.insertMention({
          mentionClassName: mention?.mentionClassName || '',
          trigger: currentTrigger.current || '',
          keepTrigger: mention?.keepTrigger || false,
          value: highlightEl.innerText,
          editorEl: editorRef.current,
          label: highlightEl.innerText, 
          highlightEl: highlightEl
        }) 
      }
      else if (requireMatch) {
        utils.removeHighlight(editorRef.current, highlightEl)
        utils.autoPositionCaret(editorRef.current)
      }
      // reset match vars and suggestions
      matches.current = []
      setSuggestions([])
      setShowSuggestions(false)
    }
    
    else if (highlightEl && key !== currentTrigger.current) {
      const inputStr = highlightEl?.innerText || ''
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
          // matches.current = suggested.filter((suggestion) => regex.test(suggestion.label))
          matches.current = suggested
          setSuggestions(matches.current)
        })
      }
    }
   
    if (key === 'Backspace') {
      const selection = window.getSelection()
      const anchorNode = selection?.anchorNode
      if (!anchorNode) return

      // It may be necessary to remove unecessary brower added br tags
      const last = anchorNode.childNodes.length || 0
      const lastAnchorChild = anchorNode.childNodes[last - 1]
      if (lastAnchorChild?.nodeValue === '') {
        lastAnchorChild?.parentNode?.removeChild(lastAnchorChild)
      }
      // remove trailing breaks, relative to the anchorNode
      utils.removeTrailingBreaks(anchorNode)

      // remove trailing breaks that may sneak in, from the end of the editor
      utils.removeTrailingBreaks(editorRef.current)
     
      // If the highlighted element was removed, hide suggestions, stop matching
      if (!highlightEl) {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }
  }
    
  const keyDownListener = (e: KeyboardEvent) => {
    const key = e.key || utils.getLastKeyStroke(editorRef.current)
    const highlightEl = document.getElementsByClassName(MENTION_HIGHLIGHT_CLASSNAME)[0] as HTMLSpanElement 

    if (!key || !editorRef.current || typeof document === 'undefined') return
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
      if (highlightEl) {
        // Prevent reentering triggering symbol if already matching
        e.preventDefault()
        return
      }

      currentTrigger.current = key
      const highlightSpan = document.createElement('span')
      const mention = mentions.find(m => m.trigger === currentTrigger.current)
      highlightSpan.className = `${MENTION_HIGHLIGHT_CLASSNAME} ${mention?.highlightClassName}`
      highlightSpan.setAttribute('require-match', mention?.requireMatch ? 'true' : 'false')
      highlightSpan.setAttribute('trigger', currentTrigger.current)
      highlightSpan.innerText = currentTrigger.current 
      highlightSpan.setAttribute('contentEditable', 'true')

      utils.insertAtCaretPos(editorRef.current, highlightSpan)

      setShowSuggestions(true)
      utils.autoPositionCaret(highlightSpan)

      e.preventDefault()
    }
  }

  useEffect(() => {
    if (defaultValue && editorRef.current) {
      // editorRef.current 
      editorRef.current.innerHTML = utils.convertToMentions(defaultValue, mentions)
    }
  }, [defaultValue])

  useEffect(() => {
    if (disabled && editorRef.current) {
			editorRef.current.setAttribute('contenteditable', 'false')
			editorRef.current.style.opacity = '0.5'
		}  
  }, [disabled])

  useLayoutEffect(() => {
    if (!editorRef?.current || typeof document === 'undefined') return
    const onChangeHandler = () => {
      onChange({
        text: editorRef.current?.innerText || '',
        markup: utils.convertToMarkup(editorRef.current?.innerHTML || '')
      })
    }

    const observer = new MutationObserver(onChangeHandler)
    observer.observe(editorRef.current, { attributes: true, childList: true, subtree: true })

    editorRef.current.addEventListener('keydown', keyDownListener)
    editorRef.current.addEventListener('keyup', keyUpListener)
    editorRef.current.addEventListener('paste', onPasteListener)
    editorRef.current.addEventListener('input', onChangeHandler)

    return () => {
      editorRef.current?.removeEventListener('keydown', keyDownListener)
      editorRef.current?.removeEventListener('keyup', keyUpListener)
      editorRef.current?.removeEventListener('paste', onPasteListener)
      editorRef.current?.removeEventListener('input', onChangeHandler)
      observer.disconnect()
    }
  }, [])

  return (
    <div
      className='react-mentionable'
      style={{
        position: 'relative'
      }}
    >
			<div
        className='react-mentionable-editor-container'
        style={{
          position: 'relative'
        }}
      >
			  <div
          placeholder={placeHolder}
          className={`react-mentionable-input ${inputClassName}`}
          style={{
            padding: '0.5rem'
          }}
          ref={(node) => {
            editorRef.current = node
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref) {
              ref.current = node
            }
          }} 
          contentEditable
        />
			</div>
      {
        showSuggestions &&
        <div
          className={suggestionsClassName}
          style={{
            position: 'absolute',
            width: '100%'
          }}
        >
          {suggestions && suggestions.map((suggestion) => {
            if (renderSuggestion) return renderSuggestion(currentTrigger.current || '', suggestion, selectSuggestion)
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
      }
		</div>
  )
}) 

export default ReactMentionable
