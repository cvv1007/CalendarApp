package com.example.frontend;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class ChatRoomAdapter extends RecyclerView.Adapter<ChatRoomAdapter.ChatRoomViewHolder>{
    private List<ChatRoom> chatRooms; // List of ChatRooms
    private Context context;


    public ChatRoomAdapter(List<ChatRoom> chatRooms, Context context) {
        this.chatRooms = chatRooms;
        this.context = context;
    }
//    public ChatRoomAdapter(List<ChatRoom> chatRooms){
//        this.chatRooms = chatRooms;
//    }

    @NonNull
    @Override
    public ChatRoomAdapter.ChatRoomViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        // Inflate the ChatRoom layout
        View view;
        view = LayoutInflater.from(parent.getContext()).inflate(R.layout.chat_room, parent, false);

        return new ChatRoomAdapter.ChatRoomViewHolder(view);

    }

    @Override
    public void onBindViewHolder(@NonNull ChatRoomAdapter.ChatRoomViewHolder holder, int position) {
        // Bind chatroom data to the views in the ViewHolder
        ChatRoom room = chatRooms.get(position);
        holder.bind(room);
    }

    @Override
    public int getItemCount() {
        return chatRooms.size();
    }




    public class ChatRoomViewHolder extends RecyclerView.ViewHolder {
        private TextView roomText;

        public ChatRoomViewHolder(View itemView) {
            super(itemView);
            roomText = itemView.findViewById(R.id.chat_room);
        }

        public void bind(ChatRoom room) {
            // Bind data to the views
            roomText.setText(room.getChatName());
            String chatName = room.getChatName();
            Bundle userData = new Bundle();
            userData.putString("chatName", chatName);
            userData.putString("username", room.getUsername());
            roomText.setOnClickListener(view -> {
                Intent groupChatIntent = new Intent(context, GroupChat.class);
                groupChatIntent.putExtras(userData);
                context.startActivity(groupChatIntent);
            });
        }
    }
}
