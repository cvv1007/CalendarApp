package com.example.frontend;

import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class ChatRoomsActivity extends AppCompatActivity {

//    private Bundle userData;
    private List<ChatRoom> chatRooms;
    private RecyclerView chatRoomRecyclerView;
    private ChatRoomAdapter chatRoomAdapter;
    private HttpsRequest httpsRequest;
    private final String server_url = ServerConfig.SERVER_URL;
//    private String url;
    private final String TAG = "ChatRoom";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat_rooms);

        //Set action bar
        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setDisplayHomeAsUpEnabled(true);
        }

        //initialize https request
        httpsRequest = new HttpsRequest();

        //get value from previous intent
        Bundle userData = getIntent().getExtras();
        String userEmail = userData.getString("userEmail");

        //initialize the list of chat rooms
        chatRooms = new ArrayList<>();

        // chatrooms data get from userData.getStringArrayList("chatrooms")
        ArrayList<String> roomNameList = userData.getStringArrayList("chatrooms");

        if(roomNameList != null){
            for(int i = 0; i < roomNameList.size(); i++){
                chatRooms.add(new ChatRoom(roomNameList.get(i), userEmail));
            }

        }

//        chatRooms.add(new ChatRoom("test"));
        //initialize recyclerView
        chatRoomRecyclerView = findViewById(R.id.chatRoomRecyclerView);
        chatRoomRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        chatRoomAdapter = new ChatRoomAdapter(chatRooms,this);
        chatRoomRecyclerView.setAdapter(chatRoomAdapter);

        if(userEmail != null){
            Log.d(TAG,userEmail);
        }else {
            Log.d(TAG,"pass user email is null");
        }


        // list of all chat rooms from get request
        findViewById(R.id.create_room).setOnClickListener(view -> {


            int size = chatRooms.size();
            ChatRoom newRoom = new ChatRoom("room " + size, userEmail);
            chatRooms.add(newRoom);
            chatRoomRecyclerView.scrollToPosition(chatRooms.size()-1);
            chatRoomAdapter.notifyDataSetChanged();
            try {
                postChatRoom(userEmail,"room " + size);
            } catch (JSONException e) {
                Log.d(TAG,"JSON error");
            }
        });
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();

        if (id == android.R.id.home) {
            // respond to back arrow
            onBackPressed();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    //post new created chat room to database
    private void postChatRoom(String userEmail, String chatName) throws JSONException {
        JSONObject postData = new JSONObject();
        postData.put("chatName",chatName);
        String url = String.format(server_url + "/api/chatrooms?user=%s",userEmail);
        httpsRequest.post(url, postData, new HttpsCallback() {
            @Override
            public void onResponse(String response) {
                Log.d(TAG,response);
            }

            @Override
            public void onFailure(String error) {
                Log.d(TAG,error);
            }
        });
    }

}