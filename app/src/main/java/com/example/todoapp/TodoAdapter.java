package com.example.todoapp;

import android.graphics.Color;
import android.graphics.Paint;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.ImageButton;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class TodoAdapter extends RecyclerView.Adapter<TodoAdapter.TodoViewHolder> {
    private List<TodoItem> todoList;
    private OnTodoEventListener listener;

    public interface OnTodoEventListener {
        void onTodoCheckChanged(TodoItem item, boolean isChecked);
        void onTodoDelete(TodoItem item);
        void onTodoClick(TodoItem item);
    }

    public TodoAdapter(List<TodoItem> todoList, OnTodoEventListener listener) {
        this.todoList = todoList;
        this.listener = listener;
    }

    @NonNull
    @Override
    public TodoViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_todo, parent, false);
        return new TodoViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull TodoViewHolder holder, int position) {
        TodoItem item = todoList.get(position);
        holder.bind(item, listener);
    }

    @Override
    public int getItemCount() {
        return todoList.size();
    }

    public void updateList(List<TodoItem> newList) {
        this.todoList = newList;
        notifyDataSetChanged();
    }

    static class TodoViewHolder extends RecyclerView.ViewHolder {
        CheckBox cbComplete;
        TextView tvTitle;
        TextView tvDesc;
        TextView tvPriority;
        ImageButton btnDelete;

        public TodoViewHolder(@NonNull View itemView) {
            super(itemView);
            cbComplete = itemView.findViewById(R.id.cbComplete);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvDesc = itemView.findViewById(R.id.tvDesc);
            tvPriority = itemView.findViewById(R.id.tvPriority);
            btnDelete = itemView.findViewById(R.id.btnDelete);
        }

        public void bind(final TodoItem item, final OnTodoEventListener listener) {
            tvTitle.setText(item.getTitle());
            
            if (item.getDescription() == null || item.getDescription().trim().isEmpty()) {
                tvDesc.setVisibility(View.GONE);
            } else {
                tvDesc.setVisibility(View.VISIBLE);
                tvDesc.setText(item.getDescription());
            }

            // Set priority colors
            String priority = item.getPriority();
            tvPriority.setText(priority);
            if ("HIGH".equalsIgnoreCase(priority)) {
                tvPriority.setBackgroundColor(Color.parseColor("#EF4444"));
            } else if ("MEDIUM".equalsIgnoreCase(priority)) {
                tvPriority.setBackgroundColor(Color.parseColor("#F59E0B"));
            } else {
                tvPriority.setBackgroundColor(Color.parseColor("#10B981"));
            }

            // Strikethrough for completed tasks
            cbComplete.setOnCheckedChangeListener(null);
            cbComplete.setChecked(item.isCompleted());
            if (item.isCompleted()) {
                tvTitle.setPaintFlags(tvTitle.getPaintFlags() | Paint.STRIKE_THRU_TEXT_FLAG);
                tvTitle.setTextColor(Color.parseColor("#94A3B8"));
            } else {
                tvTitle.setPaintFlags(tvTitle.getPaintFlags() & (~Paint.STRIKE_THRU_TEXT_FLAG));
                tvTitle.setTextColor(Color.parseColor("#1E293B"));
            }

            cbComplete.setOnCheckedChangeListener((buttonView, isChecked) -> {
                if (listener != null) {
                    listener.onTodoCheckChanged(item, isChecked);
                }
            });

            btnDelete.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onTodoDelete(item);
                }
            });

            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onTodoClick(item);
                }
            });
        }
    }
}
