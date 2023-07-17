"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  convertFormattedMentions: () => convertFormattedMentions,
  debounce: () => debounce,
  default: () => react_mentionable_default
});
module.exports = __toCommonJS(src_exports);

// src/react-mentionable.tsx
var import_react = __toESM(require("react"));

// src/utils.ts
var getLastKeyStroke = (el) => {
  if (!el)
    return;
  const caretPos = getCaretPosition(el);
  return el.innerText.at(caretPos - 1);
};
var insertMention = ({
  mentionClassName,
  editorEl,
  highlightEl,
  value,
  label,
  trigger,
  keepTrigger = false
}) => {
  const mentionEl = document.createElement("span");
  let mentionLabel = label;
  let mentionValue = value;
  if (!keepTrigger && label.indexOf(trigger) === 0) {
    mentionLabel = mentionLabel.substr(1);
  } else if (keepTrigger && label.indexOf(trigger) === -1) {
    mentionLabel = `${trigger}${mentionLabel}`;
  }
  if (mentionValue.indexOf(trigger) === 0) {
    mentionValue = mentionValue.substr(1);
  }
  mentionEl.className = mentionClassName, mentionEl.setAttribute("trigger", trigger);
  mentionEl.setAttribute("value", mentionValue);
  mentionEl.contentEditable = "false";
  mentionEl.innerText = mentionLabel.trim();
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
var convertToMentions = (str, mentions) => {
  const mentionMarkupRegex = /__(.)\[([^\]]+)\]\(([^\)]+)\)__/g;
  return str.replace(mentionMarkupRegex, (match, p1, p2, p3) => {
    const trigger = p1;
    const label = p2;
    const value = p3;
    const classname = mentions.find((m) => m.trigger === trigger)?.mentionClassName;
    return `<span class="${classname}" trigger="${trigger}" value="${value}" contenteditable="false">${label}</span>`;
  });
};
var convertFormattedMentions = (str, cb) => {
  const mentionMarkupRegex = /__(.)\[([^\]]+)\]\(([^\)]+)\)__/g;
  return str.replace(mentionMarkupRegex, (match, p1, p2, p3) => {
    const trigger = p1;
    const label = p2;
    const value = p3;
    return cb(trigger, label, value);
  });
};
var debounce = (callback, interval) => {
  let debounceTimeoutId;
  return function(...args) {
    clearTimeout(debounceTimeoutId);
    debounceTimeoutId = window.setTimeout(() => callback.apply(null, args), interval);
  };
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
var MENTION_HIGHLIGHT_CLASSNAME = "react-mentionable-highlight";
var ReactMentionable = (0, import_react.forwardRef)(
  (props, ref) => {
    const {
      placeHolder,
      defaultValue,
      inputClassName,
      suggestionsClassName,
      mentions,
      onChange,
      renderSuggestion,
      disabled
    } = props;
    const editorRef = (0, import_react.useRef)();
    const [showSuggestions, setShowSuggestions] = (0, import_react.useState)(false);
    const [suggestions, setSuggestions] = (0, import_react.useState)([]);
    const triggers = mentions.map((mention) => mention.trigger);
    let currentTrigger = (0, import_react.useRef)();
    let matches = (0, import_react.useRef)([]);
    const selectSuggestion = (suggestion) => {
      const highlightEl = document.getElementsByClassName(MENTION_HIGHLIGHT_CLASSNAME)[0];
      if (!editorRef.current || !highlightEl)
        return;
      const mention = mentions.find((m) => m.trigger === currentTrigger.current);
      insertMention({
        mentionClassName: mention?.mentionClassName || "",
        trigger: currentTrigger.current || "",
        keepTrigger: mention?.keepTrigger || false,
        value: suggestion.value,
        editorEl: editorRef.current,
        label: suggestion.label,
        highlightEl
      });
      setShowSuggestions(false);
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
      const highlightEl = document.getElementsByClassName(MENTION_HIGHLIGHT_CLASSNAME)[0];
      removeFontTags(editorRef.current);
      const key = e.key || getLastKeyStroke(editorRef.current);
      if (highlightEl && key === "Tab" || key === " ") {
        const requireMatch = mentions.find((m) => m.trigger === currentTrigger.current)?.requireMatch;
        if (matches.current.length && key === "Tab") {
          const mention = mentions.find((m) => m.trigger === currentTrigger.current);
          insertMention({
            mentionClassName: mention?.mentionClassName || "",
            trigger: currentTrigger.current || "",
            keepTrigger: mention?.keepTrigger || false,
            value: matches.current[0].value,
            editorEl: editorRef.current,
            label: matches.current[0].label,
            highlightEl
          });
        } else if (!requireMatch) {
          const mention = mentions.find((m) => m.trigger === currentTrigger.current);
          insertMention({
            mentionClassName: mention?.mentionClassName || "",
            trigger: currentTrigger.current || "",
            keepTrigger: mention?.keepTrigger || false,
            value: highlightEl.innerText,
            editorEl: editorRef.current,
            label: highlightEl.innerText,
            highlightEl
          });
        } else if (requireMatch) {
          removeHighlight(editorRef.current, highlightEl);
          autoPositionCaret(editorRef.current);
        }
        matches.current = [];
        setSuggestions([]);
        setShowSuggestions(false);
      } else if (highlightEl && key !== currentTrigger.current) {
        const inputStr = highlightEl?.innerText || "";
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
            matches.current = suggested;
            setSuggestions(matches.current);
          });
        }
      }
      if (key === "Backspace") {
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
        if (!highlightEl) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
      onChange({
        text: editorRef.current.innerText,
        markup: convertToMarkup(editorRef.current.innerHTML)
      });
    };
    const keyDownListener = (e) => {
      const key = e.key || getLastKeyStroke(editorRef.current);
      const highlightEl = document.getElementsByClassName(MENTION_HIGHLIGHT_CLASSNAME)[0];
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
        if (highlightEl) {
          e.preventDefault();
          return;
        }
        currentTrigger.current = key;
        const highlightSpan = document.createElement("span");
        highlightSpan.className = `${MENTION_HIGHLIGHT_CLASSNAME} ${mentions.find((m) => m.trigger === currentTrigger.current)?.highlightClassName}`;
        highlightSpan.innerText = currentTrigger.current;
        highlightSpan.setAttribute("contentEditable", "true");
        insertAtCaretPos(editorRef.current, highlightSpan);
        setShowSuggestions(true);
        autoPositionCaret(highlightSpan);
        e.preventDefault();
      }
    };
    (0, import_react.useEffect)(() => {
      if (defaultValue && editorRef.current) {
        editorRef.current.innerHTML = convertToMentions(defaultValue, mentions);
      }
    }, [defaultValue]);
    (0, import_react.useEffect)(() => {
      if (disabled && editorRef.current) {
        editorRef.current.setAttribute("contenteditable", "false");
        editorRef.current.style.opacity = "0.5";
      }
    }, [disabled]);
    (0, import_react.useLayoutEffect)(() => {
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
    return /* @__PURE__ */ import_react.default.createElement(
      "div",
      {
        className: "react-mentionable",
        style: {
          position: "relative"
        }
      },
      /* @__PURE__ */ import_react.default.createElement(
        "div",
        {
          className: "react-mentionable-editor-container",
          style: {
            position: "relative"
          }
        },
        /* @__PURE__ */ import_react.default.createElement(
          "div",
          {
            placeholder: placeHolder,
            className: `react-mentionable-input ${inputClassName}`,
            style: {
              padding: "0.5rem"
            },
            ref: (node) => {
              editorRef.current = node;
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            },
            contentEditable: true
          }
        )
      ),
      showSuggestions && /* @__PURE__ */ import_react.default.createElement(
        "div",
        {
          className: suggestionsClassName,
          style: {
            position: "absolute",
            width: "100%"
          }
        },
        suggestions && suggestions.map((suggestion) => {
          if (renderSuggestion)
            return renderSuggestion(currentTrigger.current || "", suggestion, selectSuggestion);
          return /* @__PURE__ */ import_react.default.createElement(
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
  }
);
var react_mentionable_default = ReactMentionable;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  convertFormattedMentions,
  debounce
});
