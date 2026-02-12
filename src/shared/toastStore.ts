type Listener = (msg: string) => void

let listener: Listener | null = null

export function setToastListener(fn: Listener) {
  listener = fn
}

export function pushToast(msg: string) {
  listener?.(msg)
}
