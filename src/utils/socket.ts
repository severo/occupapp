import io from 'socket.io-client'
import { getModule } from 'vuex-module-decorators'
import Socket from '@/store/socket.ts'
const socketStore = getModule(Socket)

export const connect = () => {
  const namespace = 'occupapp-beta'
  const url = new URL(namespace, socketStore.serverUrl.toString())
  const socket = io(url)
  socketStore.setSocket(socket)

  return socket
}

export const disconnect = () => {
  if (socketStore.socket !== undefined) {
    socketStore.socket.disconnect()
  }
  socketStore.deleteSocket()
}
