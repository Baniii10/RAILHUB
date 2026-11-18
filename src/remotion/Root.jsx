'use client'

import React from 'react'
import { Composition } from 'remotion'
import { NightTrainBumper } from './NightTrainBumper'
import { DiscordChatBumper } from './DiscordChatBumper'

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="NightTrainBumper"
        component={NightTrainBumper}
        durationInFrames={300}
        fps={30}
        width={800}
        height={450}
        defaultProps={{}}
      />
      <Composition
        id="DiscordChatBumper"
        component={DiscordChatBumper}
        durationInFrames={300}
        fps={30}
        width={720}
        height={340}
        defaultProps={{}}
      />
    </>
  )
}

export default RemotionRoot

