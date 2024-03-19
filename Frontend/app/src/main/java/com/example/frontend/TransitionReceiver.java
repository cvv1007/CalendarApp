package com.example.frontend;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import com.google.android.gms.location.ActivityTransition;
import com.google.android.gms.location.ActivityTransitionEvent;
import com.google.android.gms.location.ActivityTransitionResult;
import com.google.android.gms.location.DetectedActivity;

import timber.log.Timber;

public class TransitionReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (ActivityTransitionResult.hasResult(intent)) {
            ActivityTransitionResult result = ActivityTransitionResult.extractResult(intent);
            if(result == null){return;}

            for (ActivityTransitionEvent event : result.getTransitionEvents()) {
                if (event.getActivityType() == DetectedActivity.STILL) {
                    if (event.getTransitionType() == ActivityTransition.ACTIVITY_TRANSITION_ENTER) {
                        Timber.tag("transition").d("User is still now");
                    } else if (event.getTransitionType() == ActivityTransition.ACTIVITY_TRANSITION_EXIT) {
                        Timber.tag("transition").d("User is not still now");
                    }

                }else if(event.getActivityType() == DetectedActivity.WALKING){
                    if (event.getTransitionType() == ActivityTransition.ACTIVITY_TRANSITION_ENTER) {
                        Timber.tag("transition").d("User is walking now");
                    } else if (event.getTransitionType() == ActivityTransition.ACTIVITY_TRANSITION_EXIT) {
                        Timber.tag("transition").d("User is not walking now");
                    }
                }else if(event.getActivityType() == DetectedActivity.IN_VEHICLE){
                    if (event.getTransitionType() == ActivityTransition.ACTIVITY_TRANSITION_ENTER) {
                        Timber.tag("transition").d("User is in vehicle now");
                    } else if (event.getTransitionType() == ActivityTransition.ACTIVITY_TRANSITION_EXIT) {
                        Timber.tag("transition").d("User is not in vehicle now");
                    }
                }
            }
        }
    }
}
