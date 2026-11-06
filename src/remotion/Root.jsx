'use client'

import React from 'react'
import { Composition } from 'remotion'
import { DayTrainBumper } from './DayTrainBumper'
import { NightTrainBumper } from './NightTrainBumper'

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="DayTrainBumper"
        component={DayTrainBumper}
        durationInFrames={300}
        fps={30}
        width={800}
        height={450}
        defaultProps={{}}
      />
      <Composition
        id="NightTrainBumper"
        component={NightTrainBumper}
        durationInFrames={300}
        fps={30}
        width={800}
        height={450}
        defaultProps={{}}
      />
    </>
  )
}

export default RemotionRoot
