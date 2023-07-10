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
  label
}: { mentionClassname: string, editorEl: HTMLDivElement, highlightEl: HTMLElement, label: string }) => {
	const mentionEl = document.createElement('span')
		
  mentionEl.className = mentionClassname
  mentionEl.contentEditable = 'false'
  mentionEl.style.marginRight = '5px'
  mentionEl.innerText = label
  
  // insert tag after highlight element
  insertAfter(mentionEl, highlightEl)

  const anchorTextNode = document.createTextNode('\u00A0')
  insertAfter(anchorTextNode, mentionEl)

  // remove highlighted node and replace with tag node
  editorEl.removeChild(highlightEl)

  // remove highlight el
  highlightEl.parentNode?.removeChild(highlightEl) 

  scrollIntoView(editorEl)
  autoPositionCaret(anchorTextNode)
}
export const removeHighlight = (editorEl: HTMLDivElement, highlightEl: HTMLElement) => {
  // Add text node
  const textNode = document.createTextNode(highlightEl.innerText)

  // remove highlighted node
  insertAfter(textNode, highlightEl)

  editorEl.removeChild(highlightEl)
}

export const removeBreaks = (el: HTMLElement | null) => {
  if (!el) return
	const nodes = el.getElementsByTagName('br')
	for (let i = 0; i < nodes.length; i++) {
		nodes[i].parentNode?.removeChild(nodes[i])
	}
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


export const insertAtCaretPos = (parentEl: HTMLElement, insertEl:HTMLElement) => {
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
	
	parentEl.removeChild(anchorNode)

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
export const scrollIntoView = (editorEl: HTMLElement) => {
  const lastElement = getLastElement(editorEl)
  if (lastElement?.scrollIntoView) {
    lastElement.scrollIntoView()
  }
}

export const debounce = (callback: Function, interval: number): Function => {
  let debounceTimeoutId: number

  return function(...args: Array<any>) {
    clearTimeout(debounceTimeoutId)
    debounceTimeoutId = window.setTimeout(() => callback.apply(null, args), interval)
  }
}
