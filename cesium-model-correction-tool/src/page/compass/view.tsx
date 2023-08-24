import CompassSvg from '@/assets/compass.svg'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { mapLoadedAtom } from '..'

import { Math } from 'cesium'
function Compass() {
  const mapLoaded = useAtomValue(mapLoadedAtom)
  const [compassAngle, setCompassAngle] = useState(0)
  // useEffect(() => {
  //   if (!mapLoaded) return
  //   cgis.compassAngleChanged.addEventListener((e: number) => {
  //     setCompassAngle(Number(Math.toDegrees(e).toFixed(2)))
  //   })
  // }, [mapLoaded])
  return (
    <div className="absolute top-4 right-4 flex flex-col justify-center align-middle">
      <img
        src={CompassSvg}
        className="w-10 h-10"
        style={{
          transform: `rotate(${compassAngle}deg)`,
        }}
      />
      <div className="text-center">{compassAngle}</div>
    </div>
  )
}
export default Compass
