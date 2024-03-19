package com.example.frontend;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;


import io.socket.client.Socket;


public class GroupChat extends AppCompatActivity {

//    private Button sendButton;

    private Socket mSocket;
//    private Emitter.Listener onMessage;
    private EditText messageEditText;

    private RecyclerView messageRecyclerView;
    private MessageAdapter messageAdapter;
    private List<Message> messages; //record the messages of chat room
//    private Bundle userData;
    private HttpsRequest httpsRequest;
    private String username;

    private final String server_url = ServerConfig.SERVER_URL;
    final  static String TAG = "GroupChat";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_group_chat);

        Bundle userData = getIntent().getExtras();

        if(userData == null){
            userData = new Bundle();
            userData.putString("chatName", "Room1");
            userData.putString("userName", "user1");
        }
        String chatName = userData.getString("chatName");
        username = userData.getString("username");

        httpsRequest = new HttpsRequest();

        //set up socket connection to server
        mSocket = SocketManager.getSocket();
        mSocket.emit("joinChatroom", username, chatName);

        // listener for new messages from other users
        mSocket.on("message", args -> {
            try {
                JSONObject messageObj = new JSONObject((String) args[0]);
                Message m = new Message(messageObj.getString("message"),
                        messageObj.getString("sender"),
                        messageObj.getString("timestamp"),
                        false);
                updateMessages(m);
            } catch (JSONException e) {
                Log.d(TAG,"Message JSON error: "+e.getMessage());
            }
        });


        //initialize messages list
        messages = new ArrayList<>();

        //initialize recycler view
        messageRecyclerView = findViewById(R.id.recyclerView);
        messageRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        messageAdapter = new MessageAdapter(messages); // 'messages' is a list of message objects
        messageRecyclerView.setAdapter(messageAdapter);

        //get previous messages
        getChatHistory(chatName);

        //initialize message view
        messageEditText = findViewById(R.id.editTextSend);
        Button sendButton = findViewById(R.id.buttonSend);


        //send button callback
        sendButton.setOnClickListener(v -> {
            long startTime = System.currentTimeMillis();
            String messageText = messageEditText.getText().toString();
            // Add the message to the message list or send it to a server
            // Then, update the RecyclerView to display the new message

            if(messageText.length() > 150){
                messageEditText.setError("The messages is too long, it should be less than 150 characters");
            }else{
                Message msg = new Message(messageText, username,true);

                mSocket.emit("sendMessage", messageText, username);

                messages.add(msg);
                messageRecyclerView.scrollToPosition(messages.size() - 1);
                messageAdapter.notifyDataSetChanged();
                messageEditText.setText(""); // Clear the message input field
                long endTime = System.currentTimeMillis();
                long interval = endTime - startTime;
                Log.d("MessageTest","Message sent and receive time in milliseconds: " + interval);
            }

        });

    }

    private void updateMessages(Message m) {
        messages.add(m);
        messageRecyclerView.scrollToPosition(messages.size() - 1);
        messageAdapter.notifyDataSetChanged();
    }

    //get previous messages of the room
    private void getChatHistory(String chatName){
        String url = String.format("%s/api/message_history/?chatName=%s", server_url, chatName);

        httpsRequest.get(url, null , new HttpsCallback() { //test locally right now

            @Override
            public void onResponse(String response) {
                try {
                    JSONArray messageArray = new JSONArray(response);
                    for (int i = 0; i < messageArray.length(); i++) {
                        JSONObject msgObj = messageArray.getJSONObject(i);
                        Message m = new Message(msgObj.getString("message"),
                                msgObj.getString("sender"),
                                msgObj.getString("timestamp"),
                                false);
                        if (msgObj.getString("sender").equals(username)) {
                            m.setIsSend(true);
                        }
                        messages.add(m);
                    }
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            // This block of code is executed on the main UI thread
                            messageAdapter.notifyDataSetChanged();
                        }
                    });

                } catch (JSONException e) {
                    Log.e(TAG, "Error");
                }
            }

            @Override
            public void onFailure(String error) {
                Log.d(TAG,error);
            }
        });

    }



}