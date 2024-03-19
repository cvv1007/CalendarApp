package com.example.frontend;

import android.icu.text.SimpleDateFormat;

public class Message {
    private String messageText;
    private String sender;
    private String timestamp;

    private Boolean isSend; //true when it's sent by user, false when it's received by user

    public Message() {

    }

    // constructor to include timestamp from database messages
    public Message(String messageText, String sender, String timestamp, Boolean isSend) {
        this.messageText = messageText;
        this.sender = sender;
        this.timestamp = timestamp;
        this.isSend = isSend;
    }

    public Message(String messageText, String sender, Boolean isSend) {
        this.messageText = messageText;
        this.sender = sender;
        this.isSend = isSend;

        // Create a SimpleDateFormat object with the desired date and time format
        long currentTimeMillis = System.currentTimeMillis();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        this.timestamp = dateFormat.format(currentTimeMillis);
    }

    public String getMessageText() {
        return messageText;
    }

    public void setMessageText(String messageText) {
        this.messageText = messageText;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getTimestamp() {
        return timestamp;
    }
    
    public void setIsSend(Boolean isSend) {
        this.isSend = isSend;
    }

    public void setTimestamp(long timestamp) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        this.timestamp = dateFormat.format(timestamp);
    }

    public Boolean getIsSend(){
        return isSend;
    }
}
