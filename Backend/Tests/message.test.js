/* For testing sockets in Messaging.js */

const { createServer } = require("node:http");
const io = require('socket.io-client');
const initializeChatManager = require('../Interfaces/Messaging.js');

const db = require('../Databases/Database.js');
jest.mock('../Databases/Database.js');

describe('Test socket server group chat', () => {
    let chatManager, clientSocket, server;

    // set up client and server sockets
    beforeEach((done) => {
        server = createServer();
        chatManager = initializeChatManager(server);

        const testPort = 8080
        server.listen(testPort, () => {
            clientSocket = io(`http://localhost:${testPort}`);
            clientSocket.on('connect', () => { done(); });
        });
    });
    
    // clean up client socket calls
    afterEach(() => {
        clientSocket.disconnect();
        chatManager.closeSocket();
    });

    // clean up server and sockets
    afterAll(() => {
        server.close();
        clientSocket.disconnect();
        chatManager.closeSocket();
    })

    const user = 'user@gmail.com';
    const mockChat = 'cpen321';

    test('join chat if chat exists for user', (done) => {
        db.getUser.mockResolvedValue({events: [{eventName: mockChat}]});

        clientSocket.emit('joinChatroom', user, 'cpen321');
        clientSocket.on('chatJoined', () => {
            const serverSockets = chatManager.io.sockets.sockets; // connected sockets
            const testSocket = Array.from(serverSockets.values())[0]; // retrieve first socket, should only have one connection
            
            expect(testSocket.chatName).toBe(mockChat); // check if that socket on serverside has chatName
            expect(testSocket.rooms.has(mockChat)).toBe(true);
            done();
        });
    })

    test('leave chatroom', (done) => {
        db.getUser.mockResolvedValue({events: [{eventName: mockChat}]});

        clientSocket.emit('joinChatroom', user, 'cpen321');
        clientSocket.on('chatJoined', () => {
            clientSocket.emit('leaveChatroom');
            clientSocket.on('chatLeft', () => {
                const serverSockets = chatManager.io.sockets.sockets;
                const testSocket = Array.from(serverSockets.values())[0];

                expect(testSocket.chatName).toBeNull();
                expect(testSocket.rooms.has(mockChat)).toBe(false);
                done();
            })
        });
    })

    test('sending message', (done) => {
        let mockMessage = {
            sender: user,
            message: 'hello',
            timestamp: '',
        };
        db.getUser.mockResolvedValue({events: [{eventName: mockChat}]});
        db.addMessage.mockResolvedValue(true);

        clientSocket.emit('joinChatroom', user, 'cpen321');
        clientSocket.on('chatJoined', () => {
            clientSocket.emit('sendMessage', 'hello', user)
            clientSocket.on('messageSent', (timestamp) => {
                mockMessage.timestamp = timestamp;
                const serverSockets = chatManager.io.sockets.sockets;
                const testSocket = Array.from(serverSockets.values())[0];
                
                expect(db.addMessage).toHaveBeenCalledWith(testSocket.chatName, mockMessage);
                done();
            })
            
        });
    })

    test('invalid chat', async () => {
        db.getUser.mockResolvedValue({events: [{eventName: 'not cpen321'}]});

        clientSocket.emit('joinChatroom', user, 'cpen321');
        clientSocket.emit('sendMessage', 'hello', user);
        clientSocket.emit('leaveChatroom');
        await new Promise(resolve => setTimeout(resolve, 2000));

        const serverSockets = chatManager.io.sockets.sockets;
        const testSocket = Array.from(serverSockets.values())[0];

        expect(testSocket.rooms.has(mockChat)).toBe(false);
        expect(testSocket.chatName).toBeUndefined();
    })

    test('invalid io (server error)', () => {
        chatManager.io = null;
        expect(chatManager.io).toBeNull();
    })
})