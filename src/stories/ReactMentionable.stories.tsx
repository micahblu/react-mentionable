import React, { useState, useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import ReactMentionable from '../react-mentionable'
import type { Mention, Suggestion } from '../react-mentionable'
import { debounce, convertFormattedMentions } from '../'
// import TomBrady from './public/images/tom-brady.jpg'
// import AlbertEinstein from './images/albert-einstein.jpg'
// import ElonMusk from './images/elon-musk.jpg'
// import MikeTyson from './images/mike-tyson.jpg'
import './DemoStyles.css'

const Demo = () => {
  const markup = 'The two GOATS of all time have to be __@[Mike Tyson](/people/mike-tyson)__  and __@[Tom Brady](/people/mike-tyson)__!'
  const toLinks = convertFormattedMentions(markup, (trigger: string, label: string, value: string) => {
    return `<a href="${value}">${label}</a>`
  })
  const suggestions = [{
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
    }]
  // console.log('toLinks', toLinks)
  const editorRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const apiCall = debounce((resolve: Function) => {
    window.setTimeout(() => {
      resolve(suggestions) 
    }, 200)
  }, 100)
  const fetchSuggestions = async (searchStr: string): Promise<Array<Suggestion>> => {
    return await new Promise((resolve) => {
      apiCall(resolve) 
    })
  }

  const renderSuggestion = (suggestion: Suggestion, selectSuggestion: Function) => (
    <div
      onClick={() => selectSuggestion(suggestion)}
      key={suggestion.label}
      className='react-mentionable-suggestion'
      style={{ borderBottom: '1px solid #ccc', padding: '1rem', cursor: 'pointer' }}
    >
      { suggestion.label }
    </div>
  )
  return (
    <>
      <ReactMentionable
        ref={editorRef}
        placeHolder='What is on your mind?'
        inputClassName='inputClass'
        defaultValue={''}
        suggestionsClassName='suggestions'
        onChange={({ text, markup }) => {
          // console.log('onChange', markup)
        }}
        mentions={[{
          trigger: '@',
          highlightClassName: 'highlight',
          mentionClassName: 'mention',
          requireMatch: true,
          keepTrigger: false,
          suggestions
        }, {
          trigger: '#',
          highlightClassName: 'highlight',
          mentionClassName: 'mention',
          requireMatch: false,
          keepTrigger: true,
          suggestions: [{
            label: 'React',
            value: 'React'
          }, {
            label: 'ReactMentionable',
            value: 'ReactMentionable'
          },  {
            label: 'ToTheMoon',
            value: 'ReactMentionable'
          }]
        }]}
        renderSuggestion={renderSuggestion}
      />
      <button onClick={() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = ''
        }
      }}>
        Clear
      </button>
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
