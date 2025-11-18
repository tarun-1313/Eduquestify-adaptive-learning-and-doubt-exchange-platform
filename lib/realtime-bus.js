// This persists per server instance in Next.js runtime.
import { EventEmitter } from "events"

const globalAny = globalThis
if (!globalAny.__realtimeBus) {
  globalAny.__realtimeBus = new EventEmitter()
  globalAny.__realtimeBus.setMaxListeners(1000)
}

export const bus = globalAny.__realtimeBus
