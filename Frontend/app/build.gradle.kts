plugins {
    id("com.android.application")
}

android {
    namespace = "com.example.frontend"
    compileSdk = 33

    defaultConfig {
        applicationId = "com.example.frontend"
        minSdk = 29
        targetSdk = 33
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
}

dependencies {

    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.9.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.preference:preference:1.1.1")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    implementation ("com.squareup.okhttp3:okhttp:4.10.0")
    implementation ("io.socket:socket.io-client:2.1.0")
    implementation ("com.google.android.gms:play-services-auth:20.7.0")
    implementation ("com.google.code.gson:gson:2.8.6")
    implementation ("com.googlecode.json-simple:json-simple:1.1")
    implementation("com.google.android.gms:play-services-location:21.0.1")

    implementation ("com.jakewharton.timber:timber:4.7.1")
    implementation ("pub.devrel:easypermissions:3.0.0")
    implementation ("com.google.android.material:material:1.5.0-alpha02")
    implementation ("io.karn:notify:develop-SNAPSHOT")
    implementation ("com.google.gms:google-services:4.3.3")
    implementation ("com.google.android.gms:play-services-location:17.0.0")

    implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.4.0")
    androidTestImplementation("androidx.test:runner:1.4.0")
    androidTestImplementation("androidx.test:rules:1.4.0")
    androidTestImplementation ("androidx.test.espresso:espresso-contrib:3.4.0")
    androidTestImplementation ("androidx.test.espresso:espresso-web:3.4.0")

    androidTestImplementation ("androidx.test.espresso:espresso-intents:3.1.0")


}