package com.example.frontend;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.withId;

import static org.hamcrest.Matchers.not;

import android.view.View;
import android.widget.EditText;

import androidx.test.ext.junit.rules.ActivityScenarioRule;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.junit.Rule;
import org.junit.Test;

import java.util.regex.Pattern;

public class CreateNewEventTest {

    @Rule
    public ActivityScenarioRule<CalendarActivity> calendarActivityActivityTestRule1
            = new ActivityScenarioRule<>(CalendarActivity.class);


    @Test
    public void checkValidInput(){
        onView(withId(R.id.button_createEvent)).perform(click());

        onView(withId(R.id.et_eName)).perform(replaceText("cpen321"));
        onView(withId(R.id.et_location)).perform(replaceText("mcld"));
        onView(withId(R.id.et_sTime)).perform(replaceText("13:00"));
        onView(withId(R.id.et_eTime)).perform(replaceText("15:00"));

    }

    @Test
    public void checkInvalidInput(){
        onView(withId(R.id.button_createEvent)).perform(click());

        String invalidTimeFormat = "invalidTimeFormat";
        onView(withId(R.id.et_eName)).perform(replaceText("cpen321"));
        onView(withId(R.id.et_location)).perform(replaceText("mcld"));
        onView(withId(R.id.et_sTime)).perform(replaceText(invalidTimeFormat)); // Invalid time format
        onView(withId(R.id.et_eTime)).perform(replaceText("15:00"));

        onView(withId(R.id.et_sTime)).check(matches(not(hasValidTimeFormat())));
    }

    private static Matcher<View> hasValidTimeFormat() {
        return new TypeSafeMatcher<View>() {
            @Override
            protected boolean matchesSafely(View item) {
                if (!(item instanceof EditText)) {
                    return false;
                }
                String text = ((EditText) item).getText().toString();

                // Use regex to check if the input matches "HHmm" format
                return Pattern.matches("^\\d{4}$", text);
            }

            @Override
            public void describeTo(Description description) {
                description.appendText("has valid time format (HHmm)");
            }
        };
    }
}
