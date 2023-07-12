// src/react-mentionable.tsx
import React, { useRef, useState, useEffect, useLayoutEffect, forwardRef } from "react";

// src/utils.ts
var getLastKeyStroke = (el) => {
  if (!el)
    return;
  const caretPos = getCaretPosition(el);
  return el.innerText.at(caretPos - 1);
};
var insertMention = ({
  mentionClassname,
  editorEl,
  highlightEl,
  value,
  label,
  trigger
}) => {
  const mentionEl = document.createElement("span");
  mentionEl.className = mentionClassname;
  mentionEl.setAttribute("trigger", trigger);
  mentionEl.setAttribute("value", value);
  mentionEl.contentEditable = "false";
  mentionEl.innerText = label;
  insertAfter(mentionEl, highlightEl);
  const anchorTextNode = document.createTextNode("\xA0");
  insertAfter(anchorTextNode, mentionEl);
  editorEl.removeChild(highlightEl);
  highlightEl.parentNode?.removeChild(highlightEl);
  autoPositionCaret(editorEl);
};
var removeHighlight = (editorEl, highlightEl) => {
  const textNode = document.createTextNode(highlightEl.innerText);
  insertAfter(textNode, highlightEl);
  if (highlightEl.parentNode) {
    highlightEl.parentNode.removeChild(highlightEl);
  } else {
    editorEl.removeChild(highlightEl);
  }
};
var removeTrailingBreaks = (el) => {
  const nodes = el.childNodes;
  const len = nodes.length;
  for (let i = len; i > 0; i--) {
    const node = nodes[i];
    if (node?.nodeName === "#text")
      return;
    if (node?.nodeName === "BR") {
      node.parentNode?.removeChild(node);
    }
  }
};
var removeFontTags = (el) => {
  if (!el)
    return;
  const nodes = el.getElementsByTagName("font");
  if (!nodes.length)
    return;
  for (let i = 0; i < nodes.length; i++) {
    const text = nodes[i].innerText;
    const textNode = document.createTextNode(text);
    nodes[i].parentNode?.appendChild(textNode);
    nodes[i].parentNode?.removeChild(nodes[i]);
  }
  autoPositionCaret(el);
};
var getLastNode = (parentNode, refNode) => {
  if (!refNode) {
    return parentNode.childNodes[parentNode.childNodes.length - 1];
  }
  const len = parentNode.childNodes.length - 1;
  let lastNode;
  for (let i = 0; i <= len; i++) {
    lastNode = parentNode.childNodes[i];
    if (lastNode === refNode)
      break;
  }
  return lastNode;
};
var getCaretPosition = (element) => {
  let caretOffset = 0;
  if (window.getSelection) {
    var range = window.getSelection()?.getRangeAt(0);
    if (!range)
      return caretOffset;
    var preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length;
  }
  return caretOffset;
};
var insertAtCaretPos = (parentEl, insertEl) => {
  const selection = window.getSelection();
  const anchorNode = selection?.anchorNode;
  if (!anchorNode)
    return;
  const caretPos = getCaretPosition(parentEl);
  let charCount = 0;
  for (let i = 0; i < parentEl.childNodes.length; i++) {
    const child = parentEl.childNodes[i];
    if (child === anchorNode)
      break;
    if (child.innerText) {
      charCount += child.innerText.length;
    } else {
      charCount += child.nodeValue?.length || 0;
    }
  }
  if (anchorNode === parentEl || charCount === caretPos) {
    if (caretPos === 0 && parentEl.firstChild) {
      parentEl.insertBefore(insertEl, parentEl.firstChild);
    } else {
      parentEl.appendChild(insertEl);
    }
    return;
  }
  let anchorCaretPos;
  if (parentEl.firstChild === anchorNode) {
    anchorCaretPos = caretPos;
  } else {
    anchorCaretPos = caretPos - charCount;
  }
  const beforeNode = document.createTextNode(anchorNode.nodeValue?.substring(0, anchorCaretPos) || "");
  const afterNode = document.createTextNode(anchorNode.nodeValue?.substring(anchorCaretPos) || "");
  const nextSibling = anchorNode.nextSibling;
  anchorNode.parentNode?.removeChild(anchorNode);
  if (nextSibling) {
    parentEl.insertBefore(afterNode, nextSibling);
    parentEl.insertBefore(insertEl, afterNode);
    parentEl.insertBefore(beforeNode, insertEl);
  } else {
    parentEl.appendChild(beforeNode);
    parentEl.appendChild(insertEl);
    parentEl.appendChild(afterNode);
  }
};
var insertAfter = (newNode, existingNode) => {
  existingNode.parentNode?.insertBefore(newNode, existingNode.nextSibling);
};
var autoPositionCaret = (anchorNode) => {
  const selection = window.getSelection();
  const anchor = anchorNode ? anchorNode : selection?.anchorNode;
  if (!anchor)
    return;
  selection?.collapse(anchor, anchor.childNodes.length);
};
var convertMentions = (str, mentions) => {
  const mentionMarkupRegex = /__(.)\[([^\]]+)\]\(([^\)]+)\)__/g;
  return str.replace(mentionMarkupRegex, (match, p1, p2, p3) => {
    const trigger = p1;
    const label = p2;
    const value = p3;
    const classname = mentions.find((m) => m.trigger === trigger)?.mentionClassname;
    return `<span class="${classname}" trigger="${trigger}" value="${value}" contenteditable="false">${label}</span>`;
  });
};
var convertToMarkup = (html) => {
  const mentionRegex = /(<[^>]+>)([^<]+)<\/[^>]+>/g;
  const convertedMarkup = html.replace(/&nbsp;/g, " ").replace(mentionRegex, (match, p1, p2) => {
    const triggerRegex = /trigger="(.)"/;
    const valueRegex = /value="([^"]+)"/;
    const triggerMatch = p1.match(triggerRegex);
    const valueMatch = p1.match(valueRegex);
    if (!triggerMatch || !valueMatch) {
      return p2;
    }
    const trigger = triggerMatch[1];
    const value = valueMatch[1];
    return `__${trigger}[${p2}](${value})__ `;
  });
  return convertedMarkup.replace(/<[^>]+>/g, " ");
};

// src/react-mentionable.tsx
var ReactMentionable = forwardRef((props, ref) => {
  const {
    placeHolder,
    defaultValue,
    inputClass,
    suggestionsClass,
    mentions,
    onChange,
    renderSuggestion,
    disabled
  } = props;
  const editorRef = useRef();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const triggers = mentions.map((mention) => mention.trigger);
  let isMatching = useRef(false);
  let currentTrigger = useRef();
  let matches = useRef([]);
  let highlightEl = useRef();
  const selectSuggestion = (suggestion) => {
    if (!editorRef.current || !highlightEl.current)
      return;
    insertMention({
      mentionClassname: mentions.find((m) => m.trigger === currentTrigger.current)?.mentionClassname || "",
      trigger: currentTrigger.current || "",
      value: suggestion.value,
      editorEl: editorRef.current,
      label: suggestion.label,
      highlightEl: highlightEl.current
    });
    setShowSuggestions(false);
    isMatching.current = false;
  };
  const onPasteListener = (e) => {
    e.preventDefault();
    const paste = e.clipboardData?.getData("text") || "";
    const selection = window.getSelection();
    if (!selection?.rangeCount)
      return;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(paste));
    selection.collapseToEnd();
    onChange({
      text: editorRef.current?.innerText || paste,
      markup: convertToMarkup(editorRef.current?.innerHTML || paste)
    });
  };
  const keyUpListener = (e) => {
    if (!editorRef.current)
      return;
    removeFontTags(editorRef.current);
    const key = e.key || getLastKeyStroke(editorRef.current);
    if (isMatching.current && key === "Tab" || key === " ") {
      const lastNode = getLastNode(editorRef.current);
      if (!lastNode)
        return;
      const nodeText = lastNode?.nodeValue?.replace(currentTrigger.current || "", "").toLowerCase() || "";
      if (highlightEl.current && (matches.current.length === 1 && isMatching.current) || matches.current.map((m) => m.label).includes(nodeText)) {
        insertMention({
          mentionClassname: mentions.find((m) => m.trigger === currentTrigger.current)?.mentionClassname || "",
          trigger: currentTrigger.current || "",
          value: matches.current[0].value,
          editorEl: editorRef.current,
          label: matches.current[0].label,
          highlightEl: highlightEl.current
        });
      } else if (isMatching.current && matches.current.length !== 1) {
        removeHighlight(editorRef.current, highlightEl.current);
        autoPositionCaret(editorRef.current);
      }
      isMatching.current = false;
      setShowSuggestions(false);
    } else if (key === "Backspace") {
      e.preventDefault();
      const selection = window.getSelection();
      const anchorNode = selection?.anchorNode;
      if (!anchorNode)
        return;
      const last = anchorNode.childNodes.length || 0;
      const lastAnchorChild = anchorNode.childNodes[last - 1];
      if (lastAnchorChild?.nodeValue === "") {
        lastAnchorChild?.parentNode?.removeChild(lastAnchorChild);
      }
      removeTrailingBreaks(anchorNode);
      removeTrailingBreaks(editorRef.current);
      if (highlightEl.current?.innerText.length === 1) {
        e.preventDefault();
        setShowSuggestions(false);
        isMatching.current = false;
      }
    } else if (isMatching.current && key !== currentTrigger.current) {
      const inputStr = highlightEl.current?.innerText || "";
      const symbolIndex = inputStr.lastIndexOf(currentTrigger.current || "");
      const searchStr = inputStr.substr(symbolIndex + 1).replace(/[^\w]/, "");
      const regex = new RegExp(searchStr, "i");
      const mention = mentions.find((m) => m.trigger === currentTrigger.current);
      const suggestions2 = mentions.find((m) => m.trigger === currentTrigger.current)?.suggestions;
      if (Array.isArray(mention?.suggestions)) {
        if (suggestions2) {
          matches.current = suggestions2.filter((suggestion) => regex.test(suggestion.label));
          setSuggestions(matches.current);
        }
      } else {
        mention?.suggestions(searchStr).then((suggested) => {
          matches.current = suggested.filter((suggestion) => regex.test(suggestion.label));
          setSuggestions(matches.current);
        });
      }
    }
    onChange({
      text: editorRef.current.innerText,
      markup: convertToMarkup(editorRef.current.innerHTML)
    });
  };
  const keyDownListener = (e) => {
    const key = e.key || getLastKeyStroke(editorRef.current);
    if (!key || !editorRef.current || typeof document === "undefined")
      return;
    if (key === "Enter") {
      e.preventDefault();
      const br = document.createElement("br");
      const textNode = document.createTextNode("\u200B");
      insertAtCaretPos(editorRef.current, br);
      insertAfter(textNode, br);
      autoPositionCaret(editorRef.current);
    } else if (key === "Tab")
      e.preventDefault();
    else if (triggers.includes(key)) {
      if (isMatching.current) {
        e.preventDefault();
        return;
      }
      currentTrigger.current = key;
      isMatching.current = true;
      highlightEl.current = document.createElement("span");
      highlightEl.current.className = `${mentions.find((m) => m.trigger === currentTrigger.current)?.highlightClassName}`;
      highlightEl.current.innerText = currentTrigger.current;
      highlightEl.current.setAttribute("contentEditable", "true");
      insertAtCaretPos(editorRef.current, highlightEl.current);
      setShowSuggestions(true);
      autoPositionCaret(highlightEl.current);
      e.preventDefault();
    }
  };
  useEffect(() => {
    if (defaultValue && editorRef.current) {
      editorRef.current.innerHTML = convertMentions(defaultValue, mentions);
    }
  }, [defaultValue]);
  useEffect(() => {
    if (disabled && editorRef.current) {
      editorRef.current.setAttribute("contenteditable", "false");
      editorRef.current.style.opacity = "0.5";
    }
  }, [disabled]);
  useLayoutEffect(() => {
    if (!editorRef?.current || typeof document === "undefined")
      return;
    editorRef.current.addEventListener("keydown", keyDownListener);
    editorRef.current.addEventListener("keyup", keyUpListener);
    editorRef.current.addEventListener("paste", onPasteListener);
    return () => {
      editorRef.current?.removeEventListener("keydown", keyDownListener);
      editorRef.current?.removeEventListener("keyup", keyUpListener);
      editorRef.current?.removeEventListener("paste", onPasteListener);
    };
  }, []);
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "react-mentionable",
      style: {
        position: "relative"
      }
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "react-mentionable-editor-container",
        style: {
          position: "relative"
        }
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          placeholder: placeHolder,
          className: `react-mentionable-input ${inputClass}`,
          style: {
            padding: "0.5rem"
          },
          ref: (node) => {
            editorRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current;
            }
          },
          contentEditable: true
        }
      )
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: suggestionsClass,
        style: {
          opacity: `${showSuggestions ? "1" : "0"}`,
          position: "absolute",
          width: "100%"
        }
      },
      suggestions && suggestions.map((suggestion) => {
        if (renderSuggestion)
          return renderSuggestion(suggestion, selectSuggestion);
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            onClick: () => selectSuggestion(suggestion),
            key: suggestion.label,
            className: "react-mentionable-suggestion"
          },
          suggestion.label
        );
      })
    )
  );
});
var react_mentionable_default = ReactMentionable;
export {
  react_mentionable_default as default
};
