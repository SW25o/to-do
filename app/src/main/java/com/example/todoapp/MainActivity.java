package com.example.todoapp;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.todoapp.TodoAdapter.OnTodoEventListener;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import java.util.List;

public class MainActivity extends AppCompatActivity {
    private TodoDatabaseHelper dbHelper;
    private List<TodoItem> todoList;
    private TodoAdapter adapter;
    
    private RecyclerView rvTodos;
    private LinearLayout layoutEmpty;
    private TextView tvProgress;
    private FloatingActionButton fabAdd;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize DB Helper
        dbHelper = new TodoDatabaseHelper(this);
        todoList = dbHelper.getAllTodos();

        // Bind Views
        rvTodos = findViewById(R.id.rvTodos);
        layoutEmpty = findViewById(R.id.layoutEmpty);
        tvProgress = findViewById(R.id.tvProgress);
        fabAdd = findViewById(R.id.fabAdd);

        // Setup RecyclerView
        rvTodos.setLayoutManager(new LinearLayoutManager(this));
        
        adapter = new TodoAdapter(todoList, new OnTodoEventListener() {
            @Override
            public void onTodoCheckChanged(TodoItem item, boolean isChecked) {
                item.setCompleted(isChecked);
                dbHelper.updateTodo(item);
                updateUIState();
            }

            @Override
            public void onTodoDelete(TodoItem item) {
                dbHelper.deleteTodo(item.getId());
                todoList.remove(item);
                adapter.updateList(todoList);
                updateUIState();
                Toast.makeText(MainActivity.this, "Task deleted", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onTodoClick(TodoItem item) {
                showTaskDialog(item);
            }
        });
        
        rvTodos.setAdapter(adapter);

        // Setup Floating Action Button
        fabAdd.setOnClickListener(v -> showTaskDialog(null));

        updateUIState();
    }

    private void updateUIState() {
        int total = todoList.size();
        int completed = 0;
        for (TodoItem item : todoList) {
            if (item.isCompleted()) {
                completed++;
            }
        }

        tvProgress.setText(completed + "/" + total + " Done");

        if (total == 0) {
            layoutEmpty.setVisibility(View.VISIBLE);
            rvTodos.setVisibility(View.GONE);
        } else {
            layoutEmpty.setVisibility(View.GONE);
            rvTodos.setVisibility(View.VISIBLE);
        }
    }

    private void showTaskDialog(final TodoItem taskToEdit) {
        boolean isEdit = taskToEdit != null;
        
        MaterialAlertDialogBuilder builder = new MaterialAlertDialogBuilder(this);
        builder.setTitle(isEdit ? "Edit Task" : "Add Task");

        // Inflate custom dialog layout programmatically
        LinearLayout container = new LinearLayout(this);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setPadding(48, 24, 48, 24);

        final EditText etTitle = new EditText(this);
        etTitle.setHint("Task title");
        if (isEdit) etTitle.setText(taskToEdit.getTitle());
        container.addView(etTitle);

        final EditText etDesc = new EditText(this);
        etDesc.setHint("Description (optional)");
        etDesc.setPadding(0, 32, 0, 32);
        if (isEdit) etDesc.setText(taskToEdit.getDescription());
        container.addView(etDesc);

        TextView tvPriorityLabel = new TextView(this);
        tvPriorityLabel.setText("Priority:");
        tvPriorityLabel.setPadding(0, 16, 0, 8);
        container.addView(tvPriorityLabel);

        final Spinner spinnerPriority = new Spinner(this);
        String[] priorities = {"LOW", "MEDIUM", "HIGH"};
        ArrayAdapter<String> spinnerAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, priorities);
        spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerPriority.setAdapter(spinnerAdapter);
        if (isEdit) {
            int pos = 0;
            for (int i = 0; i < priorities.length; i++) {
                if (priorities[i].equalsIgnoreCase(taskToEdit.getPriority())) {
                    pos = i;
                    break;
                }
            }
            spinnerPriority.setSelection(pos);
        }
        container.addView(spinnerPriority);

        builder.setView(container);

        builder.setPositiveButton(isEdit ? "Update" : "Add", (dialog, which) -> {
            String title = etTitle.getText().toString().trim();
            String desc = etDesc.getText().toString().trim();
            String priority = spinnerPriority.getSelectedItem().toString();

            if (title.isEmpty()) {
                Toast.makeText(MainActivity.this, "Title cannot be empty!", Toast.LENGTH_SHORT).show();
                return;
            }

            if (isEdit) {
                taskToEdit.setTitle(title);
                taskToEdit.setDescription(desc);
                taskToEdit.setPriority(priority);
                dbHelper.updateTodo(taskToEdit);
                adapter.notifyDataSetChanged();
            } else {
                TodoItem newItem = new TodoItem(title, desc, priority);
                long id = dbHelper.addTodo(newItem);
                newItem.setId(id);
                todoList.add(0, newItem);
                adapter.updateList(todoList);
            }
            updateUIState();
        });

        builder.setNegativeButton("Cancel", (dialog, which) -> dialog.cancel());
        builder.show();
    }
}
