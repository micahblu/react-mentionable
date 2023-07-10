import React, { useState, useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import ReactMentionable from '../react-mentionable'
import type { Mention } from '../react-mentionable'
import './DemoStyles.css'

const Demo = () => {
  const editorRef = useRef<HTMLDivElement | null>(null)
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
        suggestions: [{
          label: 'Albert Einstein',
          value: '/people/albert-einstein'
          }, {
          label: 'Elon Musk',
          value: '/people/elon-musk'
        }]
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
