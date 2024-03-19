package com.example.frontend;

public class ChatRoom {
    private String ChatName;
    private String username;

    public ChatRoom(){

    }

    public ChatRoom(String name, String username){
        this.ChatName = name;
        this.username = username;
    }

    public String getChatName(){
        return this.ChatName;
    }

    public void setChatName(String name){
        this.ChatName = name;
    }

    public String getUsername() {
        return this.username;
    }
}
