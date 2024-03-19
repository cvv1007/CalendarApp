package com.example.frontend;

public interface HttpsCallback {
    void onResponse(String response);
    void onFailure(String error);
}
