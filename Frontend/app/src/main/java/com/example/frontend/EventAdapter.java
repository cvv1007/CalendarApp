package com.example.frontend;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class EventAdapter extends RecyclerView.Adapter<EventAdapter.EventViewHolder> {
    private List<EventData> eventList;
//    private Context context;

    public EventAdapter(List<EventData> eventList) {
        this.eventList = eventList;
//        this.context = context;
    }

    @NonNull
    @Override
    public EventViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view;
        view = LayoutInflater.from(parent.getContext()).inflate(R.layout.list_events, parent, false);

        return new EventViewHolder(view);

    }

    @Override
    public void onBindViewHolder(@NonNull EventViewHolder holder, int position) {
        EventData events = eventList.get(position);
        holder.bind(events);
    }

    @Override
    public int getItemCount() {
        return eventList.size();
    }

    public class EventViewHolder extends RecyclerView.ViewHolder {
        private TextView startTime;
        private TextView eventName;
        private TextView duration;

        public EventViewHolder(View itemView) {
            super(itemView);
            startTime = itemView.findViewById(R.id.tv_startTime);
            eventName = itemView.findViewById(R.id.tv_eventName);
            duration = itemView.findViewById(R.id.tv_duration);
        }

        public void bind(EventData events) {
            // Bind data to the views
            startTime.setText(events.getStartTime());
            eventName.setText(events.getEventName());
            duration.setText(events.getDuration());
        }
    }



}
