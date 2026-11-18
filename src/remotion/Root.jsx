'use client'

import React from 'react'
import { Composition } from 'remotion'
import { NightTrainBumper } from './NightTrainBumper'
import { DiscordChatBumper } from './DiscordChatBumper'
import { AboutNetworkBumper } from './AboutNetworkBumper'

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
      <Composition
        id="AboutNetworkBumper"
        component={AboutNetworkBumper}
        durationInFrames={270}
        fps={30}
        width={700}
        height={300}
        defaultProps={{}}
      />
    </>
  )
}

export default RemotionRoot

