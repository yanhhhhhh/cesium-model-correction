import { initMap } from '.'
import { useMount } from 'ahooks'
import { useSetAtom } from 'jotai'
import { mapLoadedAtom } from '@/page/store'

function Map() {
  const setMapLoaded = useSetAtom(mapLoadedAtom)
  useMount(() => {
    const cgis = initMap()
    if (cgis) {
      setMapLoaded(true)
    }
  })

  return (
    <div
      id="cesium-map"
      className="absolute left-0 top-0 h-full w-full overflow-hidden"
    ></div>
  )
}
export default Map
