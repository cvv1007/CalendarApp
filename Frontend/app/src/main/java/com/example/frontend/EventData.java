package com.example.frontend;

public class EventData {
    private String startTime;
    private String eventName;
    private String duration;

    public EventData(String startTime, String eventName, String duration) {

        this.startTime = startTime;
        this.eventName = eventName;
        this.duration = duration;
    }

    public String getStartTime() {return this.startTime;}

    public String getEventName() {return this.eventName;}

    public String getDuration() {return this.duration;}



}
