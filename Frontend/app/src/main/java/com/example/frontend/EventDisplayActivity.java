package com.example.frontend;

import android.os.Bundle;
import android.util.Log;
import android.view.WindowManager;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class EventDisplayActivity extends AppCompatActivity {
    private final String TAG = "EventDisplayActivity";
    private final String server_url = ServerConfig.SERVER_URL;
//    private EventAdapter eventAdapter;
    private List<EventData> dataArrayList = new ArrayList<>(); // list of received events

//    private RecyclerView rv_eventList;

//    private Bundle userData;
//    private HttpsRequest httpsRequest;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_schedule);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

        Bundle userData = getIntent().getExtras();
        HttpsRequest httpsRequest = new HttpsRequest();

        // initialize recyclerView
        RecyclerView rv_eventList = findViewById(R.id.rv_eventList);
        rv_eventList.setLayoutManager(new LinearLayoutManager(this));
        EventAdapter eventAdapter = new EventAdapter(dataArrayList);
        rv_eventList.setAdapter(eventAdapter);

        httpsRequest.get(server_url + "/api/calendar/day_schedule?user=" + userData.getString("userEmail"), null, new HttpsCallback() {

            @Override
            public void onResponse(String response) {
                try {
                    JSONArray scheduleArr = new JSONArray(response);
                    if (scheduleArr.length() == 0) {
                        runOnUiThread(() -> {
                            Toast.makeText(EventDisplayActivity.this, "Please Create a Schedule First!", Toast.LENGTH_LONG).show();
                        });
                    }
                    for (int i = 0; i < scheduleArr.length(); i++) {
                        JSONObject scheduleObj = scheduleArr.getJSONObject(i);
                        JSONObject routeObj = scheduleObj.getJSONObject("route");
                        JSONObject eventObj = scheduleObj.getJSONObject("event");
                        // process objects to obtain route duration
                        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm");
                        SimpleDateFormat scheduleTimeFormat = new SimpleDateFormat("HH:mm");
                        JSONObject durationObj = routeObj.getJSONObject("duration");
                        int routeDurationSec = durationObj.getInt("value"); // value in seconds
                        long routeDuration = routeDurationSec / (60 * 60); // in hours

                        // process event object to get event duration
                        Date start = dateFormat.parse(eventObj.getString("start"));
                        Date end = dateFormat.parse(eventObj.getString("end"));
                        long durationMillis = Math.abs(start.getTime() - end.getTime());
                        long eventDuration = durationMillis / (1000 * 60 * 60); // in hours

                        // get start time of event
                        long departTimeMillis = start.getTime() - (routeDurationSec * 1000L); // might need buffer?
                        Date departTime = new Date(departTimeMillis);

                        EventData routeEvent = new EventData(scheduleTimeFormat.format(departTime),
                                "In Transit",
                                String.format("%d", routeDuration) + "hours");
                        EventData eventEvent = new EventData(scheduleTimeFormat.format(start),
                                eventObj.getString("eventName"),
                                String.format("%d", eventDuration) + "hours");
                        dataArrayList.add(routeEvent);
                        dataArrayList.add(eventEvent);
                    }
                } catch (JSONException e) {
                    Log.e(TAG, "JSON Error");
                } catch (ParseException e) {
                    Log.e(TAG, "Error Parse Date");
                }
            }
            @Override
            public void onFailure(String error) {
                Log.e(TAG, "Server error: " + error);
            }
        });
    }
}
