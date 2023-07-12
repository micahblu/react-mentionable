declare module 'react-mentionable/index' {
  export { default } from 'react-mentionable/react-mentionable';
  export { convertFormattedMentions, debounce } from 'react-mentionable/utils';

}
declare module 'react-mentionable/react-mentionable' {
  import React from 'react';
  export type Suggestion = {
      label: string;
      value: string;
      [x: string]: any;
  };
  export type Mention = {
      trigger: string;
      highlightClassName?: string;
      mentionClassname?: string;
      suggestions: Array<Suggestion> | ((searchStr: string) => Promise<Array<Suggestion>>);
  };
  type ReactMenttionableProps = {
      placeHolder?: string;
      inputClass?: string;
      suggestionsClass?: string;
      defaultValue?: string;
      onChange: (props: {
          text: string;
          markup: string;
      }) => void;
      mentions: Array<Mention>;
      renderSuggestion?: (suggestion: Suggestion, selectSuggestion: (suggestion: Suggestion) => void) => React.ReactElement;
      disabled?: boolean;
  };
  const ReactMentionable: React.ForwardRefExoticComponent<ReactMenttionableProps & React.RefAttributes<HTMLDivElement>>;
  export default ReactMentionable;

}
declare module 'react-mentionable/stories/ReactMentionable.stories' {
  import React from 'react';
  import type { Meta, StoryObj } from '@storybook/react';
  import './DemoStyles.css';
  const Demo: () => React.JSX.Element;
  const meta: Meta<typeof Demo>;
  export default meta;
  type Story = StoryObj<typeof Demo>;
  export const Primary: Story;

}
declare module 'react-mentionable/utils' {
  import type { Mention } from "react-mentionable/react-mentionable";
  export const getLastKeyStroke: (el: HTMLDivElement | null) => string | undefined;
  export const insertMention: ({ mentionClassname, editorEl, highlightEl, value, label, trigger }: {
      mentionClassname: string;
      editorEl: HTMLDivElement;
      highlightEl: HTMLElement;
      value: string;
      label: string;
      trigger: string;
  }) => void;
  export const removeHighlight: (editorEl: HTMLDivElement, highlightEl: HTMLElement) => void;
  export const removeTrailingBreaks: (el: HTMLElement | Node) => void;
  export const removeFontTags: (el: HTMLElement | null) => void;
  export const getLastElement: (parentEl: HTMLElement, refNode?: HTMLElement) => HTMLElement | undefined;
  export const getLastNode: (parentNode: HTMLElement, refNode?: Node) => ChildNode | undefined;
  export const getCaretPosition: (element: HTMLElement) => number;
  export const insertAtCaretPos: (parentEl: HTMLElement, insertEl: HTMLElement | ChildNode) => void;
  export const insertAfter: (newNode: Node, existingNode: Node) => void;
  export const autoPositionCaret: (anchorNode: Node) => void;
  export const convertToMentions: (str: string, mentions: Array<Mention>) => string;
  export const convertFormattedMentions: (str: string, cb: (trigger: string, label: string, value: string) => string) => string;
  export const debounce: (callback: Function, interval: number) => Function;
  export const convertToMarkup: (html: string) => string;

}
declare module 'react-mentionable' {
  import main = require('react-mentionable/src/index');
  export = main;
}