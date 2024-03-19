package com.example.frontend;

import android.util.Log;

import androidx.annotation.NonNull;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.Iterator;
import java.util.concurrent.TimeUnit;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Headers;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.logging.HttpLoggingInterceptor;

public class HttpsRequest {

    private OkHttpClient client;
    private final String TAG = "getRequest";

    public HttpsRequest() {
        HttpLoggingInterceptor requestInterceptor = new HttpLoggingInterceptor(message -> {
            Log.d(TAG, "Request: " + message);
        });
        requestInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);

        HttpLoggingInterceptor responseInterceptor = new HttpLoggingInterceptor(message -> {
            Log.d(TAG, "Response: " + message);
        });
        responseInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);

        OkHttpClient client = new OkHttpClient.Builder()
                .addInterceptor(requestInterceptor)
                .addInterceptor(responseInterceptor)
                .connectTimeout(10, TimeUnit.SECONDS) // Adjust the timeout value as needed
                .readTimeout(10, TimeUnit.SECONDS)
                .writeTimeout(10, TimeUnit.SECONDS)
                .build();

        this.client = client;
    }

    /*
     * Send GET request to the server with custom headers.
     * Parameters:
     *   - url: the URL of the server
     *   - headers: a JSONObject containing headers
     *   - callback: the callback for handling the response
     */
    public void get(String url, JSONObject headers, HttpsCallback callback) {
        Request.Builder requestBuilder = new Request.Builder()
                .url(url)
                .get();

        if (headers != null) {
            // Add custom headers from the JSONObject
            Headers.Builder headersBuilder = new Headers.Builder();
            Iterator<String> keys = headers.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                try {
                    String value = headers.getString(key);
                    headersBuilder.add(key, value);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
            requestBuilder.headers(headersBuilder.build());
        }

        Request request = requestBuilder.build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "request err: " + e.getMessage());
                callback.onFailure(e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                Log.v(TAG, "Request URL: " + request.url());
                Log.v(TAG, "Response URL: " + response.request().url());
                Log.v(TAG,"POST Response : " + response);

                if (response.isSuccessful()) {
                    String responseData = response.body().string();
                    if (responseData != null) {
                        callback.onResponse(responseData);
                    } else {
                        callback.onFailure("response is null");
                    }
                } else {
                    Log.e(TAG, "response fail");
                    callback.onFailure("response fail");
                }
            }
        });
    }

    /*
    * Send POST request to server
    * Parameters: url: the url of server
    *             postData: JSON object that would be send to server
    * */
    public void post(String url, JSONObject postData, HttpsCallback callback){
        MediaType mediaType = MediaType.parse("application/json; charset=utf-8");
        RequestBody body = RequestBody.create(postData.toString(),mediaType);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();


        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                Log.e(TAG,"request err");
                callback.onFailure(e.getMessage());
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                Log.v(TAG,"POST Response : " + response);
                if(response.isSuccessful()){
                    String responseData = response.body().string();
                    if(responseData != null){
                        callback.onResponse(responseData);
                    }else{
                        callback.onFailure("response is null");
                    }
                }else{
                    Log.e(TAG,"response fail");
                    callback.onFailure("response fail");
                }
            }
        });


    }

    /*
     * Send PUT request to server
     * Parameters: url: the url of server
     *             postData: JSON object that would be send to server
     * */
    public void put(String url, JSONObject postData, HttpsCallback callback){
        MediaType mediaType = MediaType.parse("application/json; charset=utf-8");
        RequestBody body = RequestBody.create(postData.toString(),mediaType);
        Request request = new Request.Builder()
                .url(url)
                .put(body)
                .build();


        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                Log.d(TAG,"request err");
                callback.onFailure(e.getMessage());
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if(response.isSuccessful()){
                    String responseData = response.body().string();
                    if(responseData != null){
                        callback.onResponse(responseData);
                    }else{
                        callback.onFailure("response is null");
                    }
                }else{
                    Log.d(TAG,"response fail");
                    callback.onFailure("response fail");
                }
            }
        });


    }
}
