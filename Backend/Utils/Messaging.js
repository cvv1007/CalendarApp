/*
* Socket logic interface for Group Chats
*/
const socketIo = require('socket.io');
const db = require('/Database.js');

const allowedOrigins = [
    'http://10.0.2.2:3000',
    '0.0.0.0',
]

class ChatManager {
    constructor(server) {
        this.initSocketIo(server);
    }

    /**
     * Close the socket server
     */
    closeSocket() {
        if (this.io) this.io.close();
    }
    
    /**
     * Start all the socket server and set up listeners
     * @param {Server} server 
     */
    initSocketIo(server) {
        this.io = socketIo(server, {
            cors: {
                origin: allowedOrigins,
                methods: ['GET', 'POST'],
            }
        });
        
        this.io.on('connection', (socket) => {
            socket.on('joinChatroom', async (username, chatName) => {
                const user = await db.getUser(username);
                const chatExists = user.events.some(e => e.eventName === chatName);

                if (chatExists) { // validate chat exists within user events array
                    socket.join(chatName);
                    socket.chatName = chatName;
                    socket.emit('chatJoined');
                }
            });

            socket.on('leaveChatroom', () => {
                if (socket.chatName) {
                    socket.leave(socket.chatName);
                    socket.chatName = null;
                    socket.emit('chatLeft');
                }
            });

            socket.on('sendMessage', async (message, sender) => {
                if (socket.chatName) {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const seconds = String(now.getSeconds()).padStart(2, '0');
                    let messageObj = {
                        sender,
                        message,
                        timestamp: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
                    }
                    socket.to(socket.chatName).except(socket.id).emit('message', messageObj);
                    socket.emit('messageSent', `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
                    await db.addMessage(socket.chatName, messageObj);
                }
            });

            socket.on('disconnect', () => {
                if (socket.chatName) {
                    socket.leave(socket.chatName);
                }
            });
        });
    }
}

/**
 * Start the chat manager service
 * @param {Server} server 
 * @returns Instance of ChatManager
 */
function initializeChatManager(server) {
    return new ChatManager(server);
}
  
module.exports = initializeChatManager;