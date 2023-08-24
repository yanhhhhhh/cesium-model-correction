import { Map } from './map'
import { Tool } from './tool'

function Page() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <Map />
      <Tool />
    </div>
  )
}

export default Page
