import type { Mention } from "./react-mentionable"

export const getLastKeyStroke = (el: HTMLDivElement | null): string | undefined => {
  if (!el) return
  const caretPos = getCaretPosition(el)
  return el.innerText.at(caretPos - 1)
}

export const insertMention = ({
  mentionClassname,
  editorEl,
  highlightEl,
  value,
  label,
  trigger
}: { mentionClassname: string, editorEl: HTMLDivElement, highlightEl: HTMLElement, value: string, label: string, trigger: string }) => {
	const mentionEl = document.createElement('span')
		
  mentionEl.className = mentionClassname
  mentionEl.setAttribute('trigger', trigger)
  mentionEl.setAttribute('value', value)
  mentionEl.contentEditable = 'false'
  mentionEl.innerText = label
  
  // insert tag after highlight element
  insertAfter(mentionEl, highlightEl)

  const anchorTextNode = document.createTextNode('\u00A0')
  insertAfter(anchorTextNode, mentionEl)

  // remove highlighted node and replace with tag node
  editorEl.removeChild(highlightEl)

  // remove highlight el
  highlightEl.parentNode?.removeChild(highlightEl) 

  autoPositionCaret(editorEl)
}
export const removeHighlight = (editorEl: HTMLDivElement, highlightEl: HTMLElement) => {
  // Add text node
  const textNode = document.createTextNode(highlightEl.innerText)

  // remove highlighted node
  insertAfter(textNode, highlightEl)

  if (highlightEl.parentNode) {
    highlightEl.parentNode.removeChild(highlightEl)
  } else {
    editorEl.removeChild(highlightEl)
  }
}

export const removeTrailingBreaks = (el: HTMLElement | Node) => {
  const nodes = el.childNodes
  const len = nodes.length
	for (let i = len; i > 0; i--) {
    const node = nodes[i]
    if (node?.nodeName === '#text') return // stop once we reach text
    if (node?.nodeName === 'BR') {
      node.parentNode?.removeChild(node)
    }
	}
}

export const removeFontTags = (el: HTMLElement | null) => {
  if (!el) return
	const nodes = el.getElementsByTagName('font')
  if (!nodes.length) return
	for (let i = 0; i < nodes.length; i++) {
    const text = nodes[i].innerText
    const textNode = document.createTextNode(text)
    nodes[i].parentNode?.appendChild(textNode)
		nodes[i].parentNode?.removeChild(nodes[i])
	}
  autoPositionCaret(el)
}

export const getLastElement = (parentEl: HTMLElement, refNode?: HTMLElement): HTMLElement | undefined => {
	const len = parentEl.childNodes.length - 1
	let lastElement
	for (let i = 0; i <= len; i++) {
		const currentEl = parentEl.childNodes[i]
		if (currentEl.nodeName !== '#text') {
			lastElement = currentEl
		}
		if (currentEl === refNode) break
	}
	return lastElement as HTMLElement
}

export const getLastNode = (parentNode:HTMLElement, refNode?:Node): ChildNode | undefined => {
	if (!refNode) {
		return parentNode.childNodes[parentNode.childNodes.length - 1]
	}
	const len = parentNode.childNodes.length - 1
	let lastNode
	for (let i = 0; i <= len; i++) {
		lastNode = parentNode.childNodes[i]
		if (lastNode === refNode) break
	}
	return lastNode
}

export const getCaretPosition = (element:HTMLElement): number => {
	let caretOffset = 0

  if (window.getSelection) {
    var range = window.getSelection()?.getRangeAt(0)
    if (!range) return caretOffset

    var preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(element)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    caretOffset = preCaretRange.toString().length
  } 

  return caretOffset
}


export const insertAtCaretPos = (parentEl: HTMLElement, insertEl: HTMLElement | ChildNode) => {
	const selection = window.getSelection()
	const anchorNode = selection?.anchorNode

  if (!anchorNode) return

	const caretPos = getCaretPosition(parentEl)

	let charCount = 0
	for (let i = 0; i < parentEl.childNodes.length; i++) {
    const child = <HTMLElement>parentEl.childNodes[i]
		if (child === anchorNode) break
		if (child.innerText) {
			charCount += child.innerText.length
		} else {
			charCount += child.nodeValue?.length || 0
		}
	}
	if (anchorNode === parentEl || charCount === caretPos) {
		// If at caret position 0 and there are other elements, insert before, else append
		if (caretPos === 0 && parentEl.firstChild) {
			parentEl.insertBefore(insertEl, parentEl.firstChild)
		} else {
			parentEl.appendChild(insertEl)
		}
		return
	}
	let anchorCaretPos
	if (parentEl.firstChild === anchorNode) {
		anchorCaretPos = caretPos
	} else {
		anchorCaretPos = caretPos - charCount
	}
	// We need to insert the element within the text node at the caret position
	const beforeNode = document.createTextNode(anchorNode.nodeValue?.substring(0, anchorCaretPos) || '')
	const afterNode = document.createTextNode(anchorNode.nodeValue?.substring(anchorCaretPos) || '')
	const nextSibling = anchorNode.nextSibling
	
	anchorNode.parentNode?.removeChild(anchorNode)

	if (nextSibling) {
		parentEl.insertBefore(afterNode, nextSibling)
		parentEl.insertBefore(insertEl, afterNode)
		parentEl.insertBefore(beforeNode, insertEl)
	} else {
		parentEl.appendChild(beforeNode)
		parentEl.appendChild(insertEl)
		parentEl.appendChild(afterNode)
	}
}

export const insertAfter = (newNode:Node, existingNode:Node) => {
	existingNode.parentNode?.insertBefore(newNode, existingNode.nextSibling)
}

export const autoPositionCaret = (anchorNode: Node) => {
  const selection = window.getSelection()
  const anchor = anchorNode ? anchorNode : selection?.anchorNode
  if (!anchor) return
  selection?.collapse(anchor, anchor.childNodes.length)
}

// Horizontal scroll into view, for overflow text
// export const scrollIntoView = (editorEl: HTMLElement) => {
//   const lastElement = getLastElement(editorEl)
//   if (lastElement?.scrollIntoView) {
//     lastElement.scrollIntoView()
//   }
// }

export const convertToMentions = (str: string, mentions: Array<Mention>) => {
  const mentionMarkupRegex = /__(.)\[([^\]]+)\]\(([^\)]+)\)__/g

  return str.replace(mentionMarkupRegex, (match, p1, p2, p3) => {
    const trigger = p1
    const label = p2
    const value = p3

    const classname = mentions.find(m => m.trigger === trigger)?.mentionClassname
    return `<span class="${classname}" trigger="${trigger}" value="${value}" contenteditable="false">${label}</span>`
  })
}

export const convertFormattedMentions = (str: string, cb: (trigger: string, label: string, value: string) => string) => {
  const mentionMarkupRegex = /__(.)\[([^\]]+)\]\(([^\)]+)\)__/g

  return str.replace(mentionMarkupRegex, (match, p1, p2, p3) => {
    const trigger = p1
    const label = p2
    const value = p3
    return cb(trigger, label, value)
  })
}

export const debounce = (callback: Function, interval: number): Function => {
  let debounceTimeoutId: number

  return function(...args: Array<any>) {
    clearTimeout(debounceTimeoutId)
    debounceTimeoutId = window.setTimeout(() => callback.apply(null, args), interval)
  }
}

export const convertToMarkup = (html: string): string => {
  const mentionRegex = /(<[^>]+>)([^<]+)<\/[^>]+>/g

  const convertedMarkup = html.replace(/&nbsp;/g, ' ').replace(mentionRegex, (match, p1, p2) => {
    const triggerRegex = /trigger="(.)"/
    const valueRegex = /value="([^"]+)"/
    const triggerMatch = p1.match(triggerRegex)
    const valueMatch = p1.match(valueRegex)

    if (!triggerMatch || !valueMatch) {
      return p2 
    }

    const trigger = triggerMatch[1]
    const value = valueMatch[1]

    return `__${trigger}[${p2}](${value})__ `
  })

  // unsafe strip of html tags
  return convertedMarkup.replace(/<[^>]+>/g, ' ')
} 
