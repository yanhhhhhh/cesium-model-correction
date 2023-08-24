export interface Transform {
  type: 'translate' | 'rotate' | 'scale'
  axis: 'x' | 'y' | 'z'
  value: number
}
