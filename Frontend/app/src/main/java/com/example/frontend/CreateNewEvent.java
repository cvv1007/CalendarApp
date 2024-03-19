package com.example.frontend;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class CreateNewEvent extends AppCompatActivity {
    private EditText eventName;
    private EditText eventLocation;
    private EditText eventStartTime;
    private EditText eventEndTime;
//    private Button submit;
    private Bundle userData;
    private HttpsRequest httpsRequest;
    private final String server_url = ServerConfig.SERVER_URL;
    private final String TAG = "CreateEvent";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_event);

        userData = getIntent().getExtras();
        httpsRequest = new HttpsRequest();

        Button submit = findViewById(R.id.button_submit);
        submit.setOnClickListener(view -> {
            eventName = findViewById(R.id.et_eName);
            eventLocation = findViewById(R.id.et_location);
            eventStartTime = findViewById(R.id.et_sTime);
            eventEndTime = findViewById(R.id.et_eTime);

            JSONObject data = new JSONObject();
            JSONObject eventData = new JSONObject();
            JSONArray events = new JSONArray();
            try {
                eventData.put("eventName", eventName.getText());
                eventData.put("start", eventStartTime.getText());
                eventData.put("end", eventEndTime.getText());
                eventData.put("address", eventLocation.getText());
                events.put(eventData);

                data.put("username", userData.getString("userEmail"));
                data.put("events", events);
            } catch (JSONException e) {
                Log.e(TAG, "Error");
            }
            Log.d(TAG, eventData.toString());

            httpsRequest.post(server_url + "/api/calendar", data, new HttpsCallback() {
                @Override
                public void onResponse(String response) {
                    Log.d(TAG, response);
                    Intent eventIntent = new Intent(CreateNewEvent.this, CalendarActivity.class);
                    eventIntent.putExtras(userData);
                    startActivity(eventIntent);
                }
                @Override
                public void onFailure(String error) {
                    Log.e(TAG, error);
                }
            });
        });
    }
}
