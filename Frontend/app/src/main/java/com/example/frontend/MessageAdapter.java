package com.example.frontend;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class MessageAdapter extends RecyclerView.Adapter<MessageAdapter.MessageViewHolder> {
    private List<Message> messages; // List of messages
    private static final int VIEW_SENDER = 1;
    private static final int VIEW_RECEIVER = 2;
    public MessageAdapter(List<Message> messages) {
        this.messages = messages;
    }

    @Override
    public int getItemViewType(int position){
        Message message = messages.get(position);
        if(message.getIsSend()){
            return VIEW_SENDER;
        }else{
            return VIEW_RECEIVER;
        }

    }

    @NonNull
    @Override
    public MessageViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        // Inflate the message layout
        View view;
        if(viewType == VIEW_SENDER){
            view = LayoutInflater.from(parent.getContext()).inflate(R.layout.message_send, parent, false);
        }else {
            view = LayoutInflater.from(parent.getContext()).inflate(R.layout.message_receive, parent, false);
        }
        return new MessageViewHolder(view);

    }

    @Override
    public void onBindViewHolder(@NonNull MessageViewHolder holder, int position) {
        // Bind message data to the views in the ViewHolder
        Message message = messages.get(position);
        holder.bind(message);
    }

    @Override
    public int getItemCount() {
        return messages.size();
    }



    public class MessageViewHolder extends RecyclerView.ViewHolder {
        private TextView messageText;
        private TextView senderText;

        public MessageViewHolder(View itemView) {
            super(itemView);
            messageText = itemView.findViewById(R.id.message);
            senderText = itemView.findViewById(R.id.sender);
        }

        public void bind(Message message) {
            // Bind data to the views
            messageText.setText(message.getMessageText());
            senderText.setText(message.getSender());
        }
    }
}
