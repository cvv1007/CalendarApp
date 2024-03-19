package com.example.frontend;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.icu.util.Calendar;
import android.location.LocationManager;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.CalendarView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.Scope;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import io.socket.client.Socket;

public class CalendarActivity extends AppCompatActivity {
    private final String TAG = "CalendarActivity";
    private CalendarView calendarView;
    private Calendar calendar;
    private Bundle userData;
    private HttpsRequest httpsRequest;
    private String selectedDate;
    private final String server_url = ServerConfig.SERVER_URL;
    private double latitude;
    private double longitude;
    private List<EventData> eventList;
    private EventAdapter eventAdapter;
    private String userEmail="";
    private GoogleSignInClient mGoogleSignInClient;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_calendar);

        //initalize event list
        eventList = new ArrayList<>();
        RecyclerView rv_temp = findViewById(R.id.rv_temp);
        rv_temp.setLayoutManager(new LinearLayoutManager(this));
        eventAdapter= new EventAdapter(eventList);
        rv_temp.setAdapter(eventAdapter);

        userData = getIntent().getExtras();
        httpsRequest = new HttpsRequest();

        if(userData == null){
            userData = new Bundle();
            userData.putString("userEmail", "sample@gmail.com");
        }

        userEmail = userData.getString("userEmail");
        // initialize socket connection
        Socket socket = SocketManager.getSocket();
        socket.connect();

        Button chatButton = findViewById(R.id.button_chat);
        chatButton.setOnClickListener(view -> {
            Intent chatRoomsIntent = new Intent(CalendarActivity.this, ChatRoomsActivity.class);

            // get list of chatrooms associated with the user
            httpsRequest.get(server_url + "/api/chatrooms?user=" + userData.getString("userEmail"), null, new HttpsCallback() {
                @Override
                public void onResponse(String response) {
                    try {
                        JSONArray chatRoomsJson = new JSONArray(response);
                        ArrayList<String> chatRooms = new ArrayList<>();

                        for (int i = 0; i < chatRoomsJson.length(); i++) {
                            JSONObject chatRoom = (JSONObject) chatRoomsJson.get(i);
                            chatRooms.add(chatRoom.getString("chatName"));
                        }
                        userData.putStringArrayList("chatrooms", chatRooms);

                        // add chatrooms to intent and navigate to chatrooms
                        chatRoomsIntent.putExtras(userData);
                        startActivity(chatRoomsIntent);
                    } catch (JSONException e) {
                        Log.e(TAG, "Error on response: JSON error");
                    }
                }
                @Override
                public void onFailure(String error) {
                    Log.e(TAG, "Server error: " + error);
                }
            });
        });
        calendarView = findViewById(R.id.calendarView);
        calendar = Calendar.getInstance();

        getDate();
        getLocation();
        getEvents();
        calendarView.setOnDateChangeListener(new CalendarView.OnDateChangeListener() {
            @Override
            public void onSelectedDayChange(@NonNull CalendarView calendarView, int year, int month, int day) {
                int nMonth = month+1;
                Toast.makeText(CalendarActivity.this, day + "/" + nMonth + "/" + year, Toast.LENGTH_SHORT).show();
                selectedDate = String.format("%04d-%02d-%02d", year, month + 1, day);
            }
        });

        // go to create schedule event
        Button eventDisplay = findViewById(R.id.button_eventDisplay);
        eventDisplay.setOnClickListener(view -> {
            Intent eventIntent = new Intent(CalendarActivity.this, EventDisplayActivity.class);
            eventIntent.putExtras(userData);

            if (permissionChecker()) {
                startActivity(eventIntent);
            } else {
                Log.w(TAG, "No location permissions");
                Toast.makeText(CalendarActivity.this, "Need location permissions to create schedule", Toast.LENGTH_LONG).show();
            }
        });

        // move to CreateNewEvent.java to create new event
        Button createEvent = findViewById(R.id.button_createEvent);
        createEvent.setOnClickListener(view -> {
            Intent createEventIntent = new Intent(CalendarActivity.this, CreateNewEvent.class);
            createEventIntent.putExtras(userData);
            startActivity(createEventIntent);
        });

        // button to create day schedule
        Button createDaySchedule = findViewById(R.id.button_create_schedule);
        createDaySchedule.setOnClickListener(view -> {
            Toast.makeText(CalendarActivity.this, "Started generating schedule for today, please be patient", Toast.LENGTH_LONG).show();
            JSONObject data = new JSONObject();
            // needs username, location (origin)
            try {
                data.put("username", userData.getString("userEmail"));
                data.put("latitude", latitude);
                data.put("longitude", longitude);
            } catch (JSONException e) {
                Log.e(TAG, "Error");
            }
            if (permissionChecker()) {
                httpsRequest.post(server_url + "/api/calendar/day_schedule", data, new HttpsCallback() {
                    @Override
                    public void onResponse(String response) {
                        Log.d(TAG, "Scheduler done");
                        runOnUiThread(() -> {
                            Toast.makeText(CalendarActivity.this, "Schedule has been successfully generated!", Toast.LENGTH_LONG).show();
                        });
                    }
                    @Override
                    public void onFailure(String error) {
                        Log.e(TAG, "Error: Server error");
                        runOnUiThread(() -> {
                            Toast.makeText(CalendarActivity.this, "Schedule has been successfully generated!", Toast.LENGTH_LONG).show();
                        });
                    }
                });
            } else {
                Toast.makeText(CalendarActivity.this, "Need location permissions to create schedule", Toast.LENGTH_LONG).show();
            }
        });

        // sign out
        findViewById(R.id.imageButton3).setOnClickListener(view -> {
            Intent mainIntent = new Intent(CalendarActivity.this, MainActivity.class);
            mainIntent.putExtra("signout", true);
            startActivity(mainIntent);
        });

        // go to and update preferences
        findViewById(R.id.imageButton2).setOnClickListener(view -> {
            Intent settingIntent = new Intent(CalendarActivity.this, PreferenceActivity.class);
            httpsRequest.get(server_url + "/api/preferences?user=" + userData.getString("userEmail"), null, new HttpsCallback() {
                @Override
                public void onResponse(String response) {
                    Log.d(TAG, response);
                    userData.putString("preferences", response);
                    settingIntent.putExtras(userData);
                    startActivity(settingIntent);
                }
                @Override
                public void onFailure(String error) {

                    Log.e(TAG, "Server error: " + error);
                    startActivity(settingIntent);
                }
            });
        });

        // redeclare for silent sign in
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestProfile()
                .requestIdToken(getString(R.string.server_client_id))
                .requestServerAuthCode(getString(R.string.server_client_id))
                .requestScopes(new Scope("https://www.googleapis.com/auth/calendar.readonly"))
                .build();
        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);

        // update import and refresh displayed events
        findViewById(R.id.refresh_button).setOnClickListener(view -> {
            mGoogleSignInClient.silentSignIn().addOnCompleteListener(this, task -> {
                if (task.isSuccessful()) {
                    GoogleSignInAccount account = task.getResult();
                    importCalendar(account.getEmail(), account.getServerAuthCode());
                } else {
                    Exception e = task.getException();
                    if (e != null) {
                        Log.w("TAG", "signInResult:failed code=" + e.getMessage());
                    }
                }
            });
        });
    }

    private void importCalendar(String username, String authCode) {
        JSONObject tokenJson = new JSONObject();
        try {
            tokenJson.put("username", username);
            tokenJson.put("auth_code", authCode);
        } catch (JSONException e){
            Log.e(TAG, "unexpected JSON exception", e);
        }
        httpsRequest.post(server_url + "/api/calendar/import", tokenJson, new HttpsCallback() {
            @Override
            public void onResponse(String response) {
                getEvents(); // update after importing
            }
            @Override
            public void onFailure(String error) {
                Log.e(TAG, "Server error: " + error);
            }
        });
    }

    private void getDate(){
        long date = calendarView.getDate();
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        SimpleDateFormat displayDateFormat = new SimpleDateFormat("dd/MM/yy", Locale.getDefault());
        calendar.setTimeInMillis(date);
        selectedDate = simpleDateFormat.format(calendar.getTime());
        Toast.makeText(getApplicationContext(), displayDateFormat.format(calendar.getTime()), Toast.LENGTH_SHORT).show();
    }

    private void getLocation() {
        LocationManager locationManager  = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                && ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        android.location.LocationListener locationListener = location -> {
            latitude = location.getLatitude();
            longitude = location.getLongitude();
        };
        locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000, 10, locationListener);
//        locationListener.onLocationChanged(Objects.requireNonNull(locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)));
    }

    // check if location permissions have been granted
    private boolean permissionChecker() {
        int fineLocationPermission = ActivityCompat.checkSelfPermission(CalendarActivity.this, android.Manifest.permission.ACCESS_FINE_LOCATION);
        int coarseLocationPermission = ActivityCompat.checkSelfPermission(CalendarActivity.this, android.Manifest.permission.ACCESS_COARSE_LOCATION);

        return fineLocationPermission == PackageManager.PERMISSION_GRANTED && coarseLocationPermission == PackageManager.PERMISSION_GRANTED;
    }

    private void getEvents(){
        httpsRequest.get(server_url + "/api/calendar/by_day"+ String.format("?user=%s&day=%s",userEmail,selectedDate),
                null, new HttpsCallback() {
            @Override
            public void onResponse(String response) {
                try{
                    Log.d(TAG, response);
                    eventList.clear(); // clear events first
                    JSONArray eventJsonArray = new JSONArray(response);
                    SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm");
                    SimpleDateFormat eventTimeFormat = new SimpleDateFormat("HH:mm");
                    for (int i=0; i<eventJsonArray.length();i++){
                        JSONObject eventJson = eventJsonArray.getJSONObject(i);

                        Date start = dateFormat.parse(eventJson.getString("start"));
                        Date end = dateFormat.parse(eventJson.getString("end"));
                        long durationMillis = Math.abs(start.getTime() - end.getTime());
                        long eventDuration = durationMillis / (1000 * 60 * 60); // in hours

                        EventData newEvent = new EventData(eventTimeFormat.format(start),
                                eventJson.getString("eventName"),
                                String.format("%d Hours", eventDuration)
                        );
                        eventList.add(newEvent);
                    }
                    runOnUiThread(() -> {
                        eventAdapter.notifyDataSetChanged();
                    });
                }catch (JSONException e){
                    Log.e(TAG,"GET events JSON error");
                } catch (ParseException e) {
                    Log.e(TAG, "Error formatting date");
                }
            }

            @Override
            public void onFailure(String error) {
                Log.d(TAG,"GET events fail");
            }
        });
    }

}
