import React, { useState, useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import ReactMentionable from '../react-mentionable'
import type { Mention, Suggestion } from '../react-mentionable'
import { debounce } from '../utils'
import './DemoStyles.css'

const Demo = () => {
  const editorRef = useRef<HTMLDivElement | null>(null)
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

  return (
    <ReactMentionable
      ref={editorRef}
      placeHolder='What is on your mind?'
      inputClass='inputClass'
      onChange={() => {}}
      onSubmit={() => {}}
      mentions={[{
        trigger: '@',
        highlightClassName: 'highlight',
        mentionClassname: 'mention',
        suggestions: (searchStr: string) => fetchSuggestions(searchStr) 
      }]}
    />
  )
}


const meta: Meta<typeof Demo> = {
  component: Demo 
}

export default meta

type Story = StoryObj<typeof Demo>

export const Primary: Story = {
  args: {
     
  }
}
