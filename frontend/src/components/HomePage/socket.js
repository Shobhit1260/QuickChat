import {io} from 'socket.io-client';
import BASE from '../../api.js'

const socket=io(`${BASE}`,{
    autoConnect:false,
})

export default socket;