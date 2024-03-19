package com.example.frontend;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public class AlarmReceiver extends BroadcastReceiver {
//    private final String CHANNEL_ID = "32";

    @Override
    public void onReceive(Context context, Intent intent) {
        // Handle the alarm here. For instance, you can show a notification.
        Intent notificationIntent = new Intent(context, MainActivity.class);

        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, notificationIntent, 0);




        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, "32")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("Alarm")
                .setContentText("Event will happen soon")
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        Log.d("Alarm", "Alarm triggered");

        notificationManager.notify(200, builder.build());
    }
}

