package com.example.frontend;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.intent.Intents.intended;
import static androidx.test.espresso.intent.matcher.IntentMatchers.hasComponent;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;

import androidx.test.espresso.intent.Intents;
import androidx.test.ext.junit.rules.ActivityScenarioRule;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;

public class OpenPreferenceTest {
    @Rule
    public ActivityScenarioRule<CalendarActivity> activityRule =
            new ActivityScenarioRule<>(CalendarActivity.class);


    @Before
    public void setUp() throws Exception {
        Intents.init();
    }

    @After
    public void tearDown() throws Exception {
        Intents.release();
    }

    @Test
    public void checkPreferenceButton() {
        onView(withId(R.id.imageButton2))
                .check(matches(isDisplayed()));
        onView(withId(R.id.imageButton2)).perform(click());

        intended(hasComponent(PreferenceActivity.class.getName()));
    }

}
