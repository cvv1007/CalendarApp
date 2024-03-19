package com.example.frontend;


import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;

import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;

import androidx.core.app.NotificationCompat;

import com.google.android.gms.location.ActivityRecognition;
import com.google.android.gms.location.ActivityRecognitionClient;
import com.google.android.gms.location.ActivityTransition;
import com.google.android.gms.location.ActivityTransitionRequest;
import com.google.android.gms.location.DetectedActivity;

import java.util.ArrayList;
import java.util.List;

public class ActivityRecognitionService extends Service {
//    private ActivityRecognitionClient activityRecognitionClient;
    private List<ActivityTransition> transitions;

    private final String CHANNEL_ID = "ActivityRecognitionChannel";
    private final int NOTIFICATION_ID = 3;
    private final String TAG = "ActivityRecognition";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();

    }

    public int onStartCommand(Intent intent, int flags, int startId) {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, 0);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Activity Recognition")
                .setContentText("Detecting user activity")
                .setContentIntent(pendingIntent)
                .build();

        startForeground(NOTIFICATION_ID, notification);

        // set up activity recognition
        setActivityRecognition();

        return START_NOT_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void setActivityRecognition() {
        Intent intent = new Intent(this, TransitionReceiver.class);
        PendingIntent transitionPendingIntent = PendingIntent.getBroadcast(this, 0, intent, 0);
        createActivityTransitions();
        ActivityRecognitionClient activityRecognitionClient = ActivityRecognition.getClient(this);
        ActivityTransitionRequest request = new ActivityTransitionRequest(transitions);
        activityRecognitionClient.requestActivityTransitionUpdates(
                        request, transitionPendingIntent)
                .addOnSuccessListener(aVoid -> {
                    Log.d(TAG,"Set success!");
                })
                .addOnFailureListener(e -> {
                    Log.d(TAG,"Set fail!");
                });
    }

    //create activity transitions lists
    private void createActivityTransitions(){

        transitions = new ArrayList<>();
        transitions.add(
                new ActivityTransition.Builder()
                        .setActivityType(DetectedActivity.IN_VEHICLE)
                        .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_ENTER)
                        .build());
        transitions.add(
                new ActivityTransition.Builder()
                        .setActivityType(DetectedActivity.IN_VEHICLE)
                        .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_EXIT)
                        .build());
        transitions.add(
                new ActivityTransition.Builder()
                        .setActivityType(DetectedActivity.STILL)
                        .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_ENTER)
                        .build());
        transitions.add(
                new ActivityTransition.Builder()
                        .setActivityType(DetectedActivity.STILL)
                        .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_EXIT)
                        .build());
        transitions.add(
                new ActivityTransition.Builder()
                        .setActivityType(DetectedActivity.WALKING)
                        .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_ENTER)
                        .build());
        transitions.add(
                new ActivityTransition.Builder()
                        .setActivityType(DetectedActivity.WALKING)
                        .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_EXIT)
                        .build());

    }


    //create notification channels
    private void createNotificationChannel() {
        CharSequence name = "Service channel";
        String description = "activity recognition service channel";
        int importance = NotificationManager.IMPORTANCE_HIGH;
        NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
        channel.setDescription(description);

        NotificationManager notificationManager = getSystemService(NotificationManager.class);
        notificationManager.createNotificationChannel(channel);

    }
}
