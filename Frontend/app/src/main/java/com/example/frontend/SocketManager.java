package com.example.frontend;

import java.net.URISyntaxException;

import io.socket.client.IO;
import io.socket.client.Socket;

// Creates socket instance in main activity, can then emit events elsewhere
public class SocketManager {
    private static Socket socket;

    public static synchronized Socket getSocket() {
        if (socket == null) {
            try {
                IO.Options options = new IO.Options();
                options.transports = new String[]{"websocket"};
                socket = IO.socket(ServerConfig.SERVER_URL, options); // TODO replace with vm uri
            } catch (URISyntaxException e) {
                e.printStackTrace();
            }
        }
        return socket;
    }

}
