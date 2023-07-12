import React, { useState, useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import ReactMentionable from '../react-mentionable'
import type { Mention, Suggestion } from '../react-mentionable'
import { debounce } from '../utils'
// import TomBrady from './public/images/tom-brady.jpg'
// import AlbertEinstein from './images/albert-einstein.jpg'
// import ElonMusk from './images/elon-musk.jpg'
// import MikeTyson from './images/mike-tyson.jpg'
import './DemoStyles.css'

const Demo = () => {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const apiCall = debounce((resolve: Function) => {
    window.setTimeout(() => {
      resolve([{
        label: 'Albert Einstein',
        value: '/people/albert-einstein',
        handle: '@alberteinstein',
        avatar: '/images/albert-einstein.jpg'
      }, {
        label: 'Elon Musk',
        value: '/people/elon-musk',
        handle: '@elonmusk',
        avatar: '/images/elon-musk.jpg'
      }, {
        label: 'Mike Tyson',
        value: '/people/mike-tyson',
        handle: '@miketyson',
        avatar: '/images/mike-tyson.jpg'
      }, {
        label: 'Tom Brady',
        value: '/people/mike-tyson',
        handle: '@tombrady',
        avatar: '/images/tom-brady.jpg'
      }]) 
    }, 200)
  }, 100)
  const fetchSuggestions = async (searchStr: string): Promise<Array<Suggestion>> => {
    return await new Promise((resolve) => {
      apiCall(resolve) 
    })
  }

  return (
    <>
      <ReactMentionable
        ref={editorRef}
        placeHolder='What is on your mind?'
        inputClass='inputClass'
        defaultValue={'Hey __@[Elon Musk](/people/elon-musk)__   wanna buy Equria? or __@[Tom Brady](/people/mike-tyson)__  maybe?'}
        suggestionsClass='suggestions'
        onChange={({ text, markup }) => {
          console.log('onChange', markup)
        }}
        mentions={[{
          trigger: '@',
          highlightClassName: 'highlight',
          mentionClassname: 'mention',
          suggestions: (searchStr: string) => fetchSuggestions(searchStr) 
        }]}
        renderSuggestion={(suggestion, selectSuggestion) => (
          <div
            onClick={() => selectSuggestion(suggestion)}
            key={suggestion.label}
            className='react-mentionable-suggestion'
            style={{ borderBottom: '1px solid #ccc', padding: '1rem', cursor: 'pointer' }}
          >
            { suggestion.label }
          </div>
        )}
      />
      <br />
      <div style={{width: '100%', height: '500px', background: 'green' }} />
      <br />
      <div style={{width: '100%', height: '500px', background: 'blue' }} />
      <br />
      <div style={{width: '100%', height: '500px', background: 'red' }} />
    </>
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
