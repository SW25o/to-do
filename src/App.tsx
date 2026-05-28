import React, { useState } from 'react';
import { 
  Plus, Check, Trash2, Edit3, Code2, Smartphone, Terminal, 
  Github, Copy, CheckCircle2, FileCode, Folder, FolderOpen, 
  HelpCircle, ChevronRight, Info, BookOpen, Layers, Settings,
  Play, Download, Cpu, RefreshCw, X, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Simulated Task interface for the web preview
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  isCompleted: boolean;
}

// Full code representation for the visual directory explorer
const PROJECT_FILES = [
  {
    name: '.github/workflows',
    type: 'folder',
    children: [
      { name: 'android.yml', id: 'workflow' }
    ]
  },
  {
    name: 'app/src/main',
    type: 'folder',
    children: [
      { name: 'AndroidManifest.xml', id: 'manifest' },
      { name: 'java/com/example/todoapp/MainActivity.java', id: 'main_activity' },
      { name: 'java/com/example/todoapp/TodoItem.java', id: 'todo_item' },
      { name: 'java/com/example/todoapp/TodoDatabaseHelper.java', id: 'db_helper' },
      { name: 'java/com/example/todoapp/TodoAdapter.java', id: 'adapter' },
      { name: 'res/layout/activity_main.xml', id: 'layout_main' },
      { name: 'res/layout/item_todo.xml', id: 'layout_item' },
      { name: 'res/values/colors.xml', id: 'colors' },
      { name: 'res/values/strings.xml', id: 'strings' },
      { name: 'res/values/themes.xml', id: 'themes' }
    ]
  },
  { name: 'build.gradle', id: 'root_build_gradle', type: 'file' },
  { name: 'settings.gradle', id: 'settings_gradle', type: 'file' },
  { name: 'gradle.properties', id: 'gradle_properties', type: 'file' },
  { name: 'app/build.gradle', id: 'app_build_gradle', type: 'file' }
];

const FILE_CONTENTS: Record<string, { path: string; language: string; content: string }> = {
  workflow: {
    path: '.github/workflows/android.yml',
    language: 'yaml',
    content: `name: Build Android APK

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Setup Gradle
      uses: gradle/actions/setup-gradle@v3

    - name: Build Debug APK
      run: gradle assembleDebug

    - name: Upload Debug APK
      uses: actions/upload-artifact@v4
      with:
        name: TodoApp-Debug-APK
        path: app/build/outputs/apk/debug/app-debug.apk`
  },
  manifest: {
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.TodoApp">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`
  },
  main_activity: {
    path: 'app/src/main/java/com/example/todoapp/MainActivity.java',
    language: 'java',
    content: `package com.example.todoapp;

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
}`
  },
  todo_item: {
    path: 'app/src/main/java/com/example/todoapp/TodoItem.java',
    language: 'java',
    content: `package com.example.todoapp;

public class TodoItem {
    private long id;
    private String title;
    private String description;
    private String priority; // HIGH, MEDIUM, LOW
    private boolean isCompleted;

    public TodoItem(long id, String title, String description, String priority, boolean isCompleted) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.isCompleted = isCompleted;
    }

    public TodoItem(String title, String description, String priority) {
        this.id = -1;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.isCompleted = false;
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }
}`
  },
  db_helper: {
    path: 'app/src/main/java/com/example/todoapp/TodoDatabaseHelper.java',
    language: 'java',
    content: `package com.example.todoapp;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import java.util.ArrayList;
import java.util.List;

public class TodoDatabaseHelper extends SQLiteOpenHelper {
    private static final String DATABASE_NAME = "todos.db";
    private static final int DATABASE_VERSION = 1;

    private static final String TABLE_TODOS = "todos";
    private static final String COLUMN_ID = "id";
    private static final String COLUMN_TITLE = "title";
    private static final String COLUMN_DESC = "description";
    private static final String COLUMN_PRIORITY = "priority";
    private static final String COLUMN_COMPLETED = "is_completed";

    public TodoDatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        String CREATE_TABLE = "CREATE TABLE " + TABLE_TODOS + " ("
                + COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, "
                + COLUMN_TITLE + " TEXT NOT NULL, "
                + COLUMN_DESC + " TEXT, "
                + COLUMN_PRIORITY + " TEXT, "
                + COLUMN_COMPLETED + " INTEGER DEFAULT 0)";
        db.execSQL(CREATE_TABLE);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_TODOS);
        onCreate(db);
    }

    public long addTodo(TodoItem item) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_TITLE, item.getTitle());
        values.put(COLUMN_DESC, item.getDescription());
        values.put(COLUMN_PRIORITY, item.getPriority());
        values.put(COLUMN_COMPLETED, item.isCompleted() ? 1 : 0);
        
        long id = db.insert(TABLE_TODOS, null, values);
        db.close();
        return id;
    }

    public List<TodoItem> getAllTodos() {
        List<TodoItem> list = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.rawQuery("SELECT * FROM " + TABLE_TODOS + " ORDER BY " + COLUMN_ID + " DESC", null);

        if (cursor.moveToFirst()) {
            do {
                long id = cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_ID));
                String title = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_TITLE));
                String desc = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_DESC));
                String priority = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_PRIORITY));
                boolean completed = cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_COMPLETED)) == 1;

                list.add(new TodoItem(id, title, desc, priority, completed));
            } while (cursor.moveToNext());
        }
        cursor.close();
        db.close();
        return list;
    }

    public int updateTodo(TodoItem item) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_TITLE, item.getTitle());
        values.put(COLUMN_DESC, item.getDescription());
        values.put(COLUMN_PRIORITY, item.getPriority());
        values.put(COLUMN_COMPLETED, item.isCompleted() ? 1 : 0);

        int rows = db.update(TABLE_TODOS, values, COLUMN_ID + " = ?", new String[]{String.valueOf(item.getId())});
        db.close();
        return rows;
    }

    public void deleteTodo(long id) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_TODOS, COLUMN_ID + " = ?", new String[]{String.valueOf(id)});
        db.close();
    }
}`
  },
  adapter: {
    path: 'app/src/main/java/com/example/todoapp/TodoAdapter.java',
    language: 'java',
    content: `package com.example.todoapp;

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

            String priority = item.getPriority();
            tvPriority.setText(priority);
            if ("HIGH".equalsIgnoreCase(priority)) {
                tvPriority.setBackgroundColor(Color.parseColor("#EF4444"));
            } else if ("MEDIUM".equalsIgnoreCase(priority)) {
                tvPriority.setBackgroundColor(Color.parseColor("#F59E0B"));
            } else {
                tvPriority.setBackgroundColor(Color.parseColor("#10B981"));
            }

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
}`
  },
  layout_main: {
    path: 'app/src/main/res/layout/activity_main.xml',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/gray_light">

    <androidx.cardview.widget.CardView
        android:id="@+id/appBarCard"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        app:cardElevation="4dp"
        app:cardMaxElevation="4dp"
        app:layout_constraintTop_toTopOf="parent">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="72dp"
            android:background="@color/primary"
            android:gravity="center_vertical"
            android:orientation="horizontal"
            android:paddingHorizontal="16dp">

            <TextView
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="@string/app_name"
                android:textColor="@color/white"
                android:textSize="22sp"
                android:textStyle="bold" />

            <TextView
                android:id="@+id/tvProgress"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="0/0 Done"
                android:textColor="@color/white"
                android:textSize="14sp"
                android:textStyle="bold"
                android:background="#1E293B"
                android:paddingHorizontal="12dp"
                android:paddingVertical="6dp" />
        </LinearLayout>
    </androidx.cardview.widget.CardView>

    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/rvTodos"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:padding="8dp"
        android:clipToPadding="false"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintTop_toBottomOf="@id/appBarCard"
        tools:listitem="@layout/item_todo" />

    <LinearLayout
        android:id="@+id/layoutEmpty"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:gravity="center"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@id/appBarCard">

        <ImageView
            android:layout_width="80dp"
            android:layout_height="80dp"
            android:src="@android:drawable/ic_menu_agenda"
            app:tint="@color/text_muted" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="16dp"
            android:text="No tasks yet"
            android:textColor="@color/text_dark"
            android:textSize="18sp"
            android:textStyle="bold" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="4dp"
            android:text="Tap the + button to create a task"
            android:textColor="@color/text_muted"
            android:textSize="14sp" />
    </LinearLayout>

    <com.google.android.material.floatingactionbutton.FloatingActionButton
        android:id="@+id/fabAdd"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_margin="20dp"
        android:src="@android:drawable/ic_input_add"
        app:tint="@color/white"
        app:backgroundTint="@color/accent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:contentDescription="@string/add_task" />

</androidx.constraintlayout.widget.ConstraintLayout>`
  },
  layout_item: {
    path: 'app/src/main/res/layout/item_todo.xml',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<androidx.cardview.widget.CardView xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_marginHorizontal="8dp"
    android:layout_marginVertical="6dp"
    app:cardCornerRadius="12dp"
    app:cardElevation="2dp"
    app:cardMaxElevation="2dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical"
        android:padding="16dp">

        <CheckBox
            android:id="@+id/cbComplete"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginEnd="8dp" />

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:orientation="vertical">

            <TextView
                android:id="@+id/tvTitle"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Buy groceries"
                android:textColor="@color/text_dark"
                android:textSize="16sp"
                android:textStyle="bold" />

            <TextView
                android:id="@+id/tvDesc"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginTop="2dp"
                android:text="Milk, eggs, and cereal"
                android:textColor="@color/text_muted"
                android:textSize="13sp" />
        </LinearLayout>

        <TextView
            android:id="@+id/tvPriority"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginHorizontal="8dp"
            android:text="High"
            android:textColor="@color/white"
            android:textSize="11sp"
            android:textStyle="bold"
            android:paddingHorizontal="8dp"
            android:paddingVertical="4dp"
            android:background="@color/priority_high" />

        <ImageButton
            android:id="@+id/btnDelete"
            android:layout_width="36dp"
            android:layout_height="36dp"
            android:background="?attr/selectableItemBackgroundBorderless"
            android:src="@android:drawable/ic_menu_delete"
            app:tint="@color/priority_high"
            android:contentDescription="@string/delete" />

    </LinearLayout>
</androidx.cardview.widget.CardView>`
  },
  colors: {
    path: 'app/src/main/res/values/colors.xml',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#0F172A</color>
    <color name="primary_dark">#020617</color>
    <color name="accent">#3B82F6</color>
    
    <color name="white">#FFFFFF</color>
    <color name="black">#000000</color>
    <color name="gray_light">#F8FAFC</color>
    <color name="gray_border">#E2E8F0</color>
    <color name="text_dark">#1E293B</color>
    <color name="text_muted">#64748B</color>
    
    <color name="priority_high">#EF4444</color>
    <color name="priority_medium">#F59E0B</color>
    <color name="priority_low">#10B981</color>
</resources>`
  },
  strings: {
    path: 'app/src/main/res/values/strings.xml',
    language: 'xml',
    content: `<resources>
    <string name="app_name">Android To-Do</string>
    <string name="add_task">Add Task</string>
    <string name="edit_task">Edit Task</string>
    <string name="task_title_hint">Task Title</string>
    <string name="task_desc_hint">Task Description (Optional)</string>
    <string name="save">Save</string>
    <string name="cancel">Cancel</string>
    <string name="to_do">To-Do</string>
    <string name="completed">Completed</string>
    <string name="delete">Delete</string>
    <string name="priority">Priority</string>
    <string name="priority_high">High</string>
    <string name="priority_medium">Medium</string>
    <string name="priority_low">Low</string>
</resources>`
  },
  themes: {
    path: 'app/src/main/res/values/themes.xml',
    language: 'xml',
    content: `<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.TodoApp" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryDark">@color/primary_dark</item>
        <item name="colorAccent">@color/accent</item>
        <item name="android:statusBarColor">@color/primary_dark</item>
        <item name="android:windowLightStatusBar">false</item>
    </style>
</resources>`
  },
  root_build_gradle: {
    path: 'build.gradle',
    language: 'groovy',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id 'com.android.application' version '8.2.2' apply false
    id 'com.android.library' version '8.2.2' apply false
}`
  },
  settings_gradle: {
    path: 'settings.gradle',
    language: 'groovy',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "TodoApp"
include ':app'`
  },
  gradle_properties: {
    path: 'gradle.properties',
    language: 'properties',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true`
  },
  app_build_gradle: {
    path: 'app/build.gradle',
    language: 'groovy',
    content: `plugins {
    id 'com.android.application'
}

android {
    namespace 'com.example.todoapp'
    compileSdk 34

    defaultConfig {
        applicationId "com.example.todoapp"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.recyclerview:recyclerview:1.3.2'
    implementation 'androidx.cardview:cardview:1.0.0'
    
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}`
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'guide'>('preview');
  
  // Simulator State Machine
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Setup TodoDatabaseHelper',
      description: 'Implement SQLite CRUD operations with Java',
      priority: 'HIGH',
      isCompleted: true
    },
    {
      id: '2',
      title: 'Design activity_main.xml',
      description: 'Define AppbarCard, RecyclerView, and FloatingActionButton widgets',
      priority: 'MEDIUM',
      isCompleted: false
    },
    {
      id: '3',
      title: 'Configure android.yml compiler',
      description: 'Validate automation build triggers on Gradle assembleDebug',
      priority: 'HIGH',
      isCompleted: false
    },
    {
      id: '4',
      title: 'Refactor TodoAdapter',
      description: 'Wire ViewHolder and item selection animations',
      priority: 'LOW',
      isCompleted: false
    }
  ]);

  // Dialog state for adding/editing tasks in simulator
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogDesc, setDialogDesc] = useState('');
  const [dialogPriority, setDialogPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  // File explorer states
  const [selectedFileId, setSelectedFileId] = useState<string>('main_activity');
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Stats calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Simulator helper functions
  const openAddDialog = () => {
    setIsEditMode(false);
    setEditingTaskId(null);
    setDialogTitle('');
    setDialogDesc('');
    setDialogPriority('MEDIUM');
    setDialogOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setIsEditMode(true);
    setEditingTaskId(task.id);
    setDialogTitle(task.title);
    setDialogDesc(task.description);
    setDialogPriority(task.priority);
    setDialogOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dialogTitle.trim()) return;

    if (isEditMode && editingTaskId) {
      setTasks(prev => prev.map(t => t.id === editingTaskId ? {
        ...t,
        title: dialogTitle,
        description: dialogDesc,
        priority: dialogPriority
      } : t));
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: dialogTitle,
        description: dialogDesc,
        priority: dialogPriority,
        isCompleted: false
      };
      setTasks(prev => [newTask, ...prev]);
    }
    setDialogOpen(false);
  };

  const handleDeleteTask = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  // Helper code copying function
  const handleCopyCode = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-blue-600/30 selection:text-blue-200">
      
      {/* Premium Header Decoration */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-950 to-blue-800 border border-blue-900/40 shadow-lg shadow-blue-950/20">
            <Cpu className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">
              Android Developer Workbench
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Pure Java + XML • Built-in APK GitHub Compiler
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80 max-w-sm">
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'preview' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Live Emulator
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'code' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Browse Java/XML
          </button>
          <button 
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'guide' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            GitHub APK Guide
          </button>
        </div>
      </header>

      {/* Main Content Areas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* TAB 1: PREVIEW (Android Emulator + Side Info Panel) */}
        {activeTab === 'preview' && (
          <>
            {/* Phone Display Case */}
            <div className="lg:col-span-5 flex justify-center items-center py-4 bg-slate-950/40 rounded-2xl border border-slate-900/50">
              <div className="relative w-[345px] h-[680px] bg-slate-900 rounded-[50px] p-3.5 shadow-2xl shadow-blue-950/40 border-[3px] border-slate-800 flex flex-col overflow-hidden">
                
                {/* Physical Notch */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-40 h-5 bg-black rounded-full z-50 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-slate-800 rounded-full ml-auto mr-12 border border-slate-900/50"></div>
                </div>

                {/* Simulated Android Status Bar */}
                <div className="h-6 flex items-center justify-between px-6 bg-slate-900 text-[11px] font-mono text-slate-300 select-none z-30 pt-1">
                  <span>9:41 AM</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px]">4G LTE</span>
                    <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-[1px] flex items-center">
                      <div className="w-full h-full bg-slate-200 rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Emulator Screen Frame */}
                <div className="flex-1 bg-slate-100 rounded-[35px] overflow-hidden flex flex-col relative text-slate-900">
                  
                  {/* Android Card Header (Toolbar) */}
                  <div className="bg-slate-900 text-white px-5 py-4 pt-5 flex items-center justify-between shadow-md">
                    <div>
                      <h2 className="text-lg font-bold tracking-tight">Android To-Do</h2>
                      <p className="text-[10px] text-slate-400 font-mono tracking-wider">COM.EXAMPLE.TODOAPP</p>
                    </div>
                    <div className="bg-slate-800 px-3 py-1.5 rounded-full text-xs font-mono font-bold text-blue-300 shadow-inner">
                      {completedTasks}/{totalTasks} Done
                    </div>
                  </div>

                  {/* Task List Container (Simulating RecyclerView) */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
                    
                    {tasks.length === 0 ? (
                      <div className="h-full flex flex-col justify-center items-center text-center opacity-70 py-16">
                        <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 mb-4 shadow-sm">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">No active tasks</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                          All tasks cleared. Tap + to create a custom task.
                        </p>
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {tasks.map(task => (
                          <motion.div 
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => openEditDialog(task)}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow cursor-pointer flex items-start gap-4"
                          >
                            <input 
                              type="checkbox"
                              checked={task.isCompleted}
                              onChange={() => toggleTaskComplete(task.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-5 h-5 mt-0.5 rounded-md text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer accent-blue-600"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-bold leading-tight ${
                                task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                              } break-words`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className={`text-xs mt-1 ${
                                  task.isCompleted ? 'text-slate-300' : 'text-slate-500'
                                } line-clamp-2 break-words`}>
                                  {task.description}
                                </p>
                              )}
                              
                              <div className="mt-2.5 flex items-center gap-2">
                                <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                                  task.priority === 'HIGH' 
                                    ? 'bg-red-550 text-red-650' 
                                    : task.priority === 'MEDIUM' 
                                      ? 'bg-amber-100 text-amber-700' 
                                      : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {task.priority} Priority
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={(e) => handleDeleteTask(task.id, e)}
                              className="p-1 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Android Floating Action Button */}
                  <button 
                    onClick={openAddDialog}
                    className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 z-40 cursor-pointer"
                  >
                    <Plus className="w-7 h-7" />
                  </button>

                  {/* Visual Touch Area Bottom */}
                  <div className="h-5 bg-slate-900 w-full flex items-center justify-center pt-1 pb-2 font-semibold">
                    <div className="w-32 h-1 bg-slate-700 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Information & Architecture Sidepane */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-6">
              
              <div className="space-y-6">
                
                {/* Introduction Callout */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-850 space-y-3">
                  <div className="flex items-center gap-2.5 text-blue-400">
                    <Cpu className="w-5 h-5" />
                    <h3 className="font-bold text-sm tracking-wide">COMPILER READY CONFIGURATION</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    This workbench does not just fake code block previews—it contains **actual physical, compile-ready Android project files initialized in the workspace**. Below is a visual map showing how the Java application leverages standard local SQLite architecture.
                  </p>
                </div>

                {/* Architecture Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900/60 flex gap-4">
                    <div className="text-blue-500 p-2 bg-blue-950/40 rounded-lg h-fit">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-300">SQLite & SQLHelper</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-normal">
                        Utilizes original raw Android SQLite frameworks via <span className="text-blue-300 font-semibold font-mono">TodoDatabaseHelper.java</span>. Keeps dependency chains lightweight.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900/60 flex gap-4">
                    <div className="text-blue-500 p-2 bg-blue-950/40 rounded-lg h-fit">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-300">RecyclerView Binding</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-normal">
                        Handles memory-efficient view-recycling via a standard custom ViewHolder in <span className="text-blue-300 font-semibold font-mono">TodoAdapter.java</span>.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900/60 flex gap-4">
                    <div className="text-blue-500 p-2 bg-blue-950/40 rounded-lg h-fit">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-300">XML View Composition</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-normal">
                        Designed with material elements featuring a high-contrast floating button, modern cards, and dynamic priority color tags.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900/60 flex gap-4">
                    <div className="text-emerald-500 p-2 bg-emerald-950/30 rounded-lg h-fit">
                      <Github className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-300">Automated GitHub Build</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-normal">
                        A clean, production-level CI config file builds a fresh debug APK instantly upon tracking code changes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simulated Android Terminal Output */}
                <div className="rounded-xl border border-slate-900 bg-slate-950/80 p-4 font-mono text-[11px] leading-relaxed relative">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      <span className="text-slate-400 font-bold ml-1">Android Build Mock Terminal</span>
                    </div>
                    <span className="text-[10px] text-blue-500 font-bold uppercase animate-pulse">Running Simulator</span>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <p className="text-slate-500">$ java -version</p>
                    <p className="text-slate-400">openjdk version "17.0.10" 2024-01-16 LT</p>
                    <p className="text-slate-500">$ gradle assembleDebug</p>
                    <p className="text-blue-400">Task :app:compileDebugJavaWithJavac UP-TO-DATE</p>
                    <p className="text-blue-400">Task :app:mergeDebugResources SUCCESSFUL</p>
                    <p className="text-emerald-400 font-semibold">BUILD SUCCESSFUL in 1.482s</p>
                    <p className="text-emerald-500 font-semibold">✓ APK Output Compiled: app/build/outputs/apk/debug/app-debug.apk</p>
                  </div>
                </div>

              </div>

              {/* Simple persistent prompt advising the user what to do */}
              <div className="mt-8 bg-blue-950/10 border border-blue-900/20 p-4 rounded-xl flex items-start gap-3.5">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-normal">
                  <p className="font-bold text-slate-100">Looking for the direct files?</p>
                  <p className="mt-1">
                    Toggle to the <strong className="text-blue-400">Browse Java/XML</strong> tab in the header. You can inspect the fully structured Gradle configurations, Java modules, and visual layouts we've written for you.
                  </p>
                </div>
              </div>

            </div>
          </>
        )}

        {/* TAB 2: CODE (Physical Project Code Inspector Explorer) */}
        {activeTab === 'code' && (
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[580px] items-stretch">
            
            {/* Visual File Tree Navigation (Left Pane) */}
            <div className="md:col-span-4 bg-slate-900/30 border border-slate-900 rounded-xl p-4 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                Workspace Files
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-1 text-xs">
                {PROJECT_FILES.map((file, idx) => {
                  if (file.type === 'folder') {
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 text-slate-300 font-semibold font-mono bg-slate-900/20 rounded-lg">
                          <FolderOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{file.name}</span>
                        </div>
                        <div className="pl-4 border-l border-slate-800 ml-4 space-y-1">
                          {file.children?.map(child => (
                            <button
                              key={child.id}
                              onClick={() => setSelectedFileId(child.id)}
                              className={`w-full flex items-center justify-between text-left px-3 py-1.5 rounded-md font-mono transition-colors ${
                                selectedFileId === child.id 
                                  ? 'bg-blue-600/10 text-blue-400 border border-blue-900/40 font-bold' 
                                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                              }`}
                            >
                              <span className="truncate">{child.name}</span>
                              <ChevronRight className="w-3 h-3 text-slate-500" />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFileId(file.id || '')}
                        className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg font-mono transition-colors ${
                          selectedFileId === file.id 
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-900/40 font-bold' 
                            : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{file.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    );
                  }
                })}
              </div>
            </div>

            {/* Smart Syntax Code Viewer (Right Pane) */}
            <div className="md:col-span-8 flex flex-col bg-slate-950 border border-slate-900 rounded-xl overflow-hidden">
              
              {/* Toolbar metadata of selected file */}
              <div className="px-5 py-3 bg-slate-900/40 border-b border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-mono font-bold text-slate-300">
                    /{FILE_CONTENTS[selectedFileId]?.path}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCode(FILE_CONTENTS[selectedFileId]?.content || '')}
                  className="flex items-center gap-1.5 px-3 py-1 ml-auto rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy File
                    </>
                  )}
                </button>
              </div>

              {/* Formatted Editor Space */}
              <div className="flex-1 p-5 overflow-auto font-mono text-[11px] sm:text-xs text-slate-300 bg-slate-950 leading-relaxed selection:bg-slate-800">
                <pre className="whitespace-pre">{FILE_CONTENTS[selectedFileId]?.content}</pre>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: GUIDE (How to deploy and build) */}
        {activeTab === 'guide' && (
          <div className="lg:col-span-12 bg-slate-900/20 border border-slate-900 rounded-2xl p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center gap-4 border-b border-slate-900 pb-5">
              <div className="p-3 bg-blue-950/50 rounded-xl border border-blue-900/30 text-blue-400 h-fit">
                <Github className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">GitHub Actions APK Compiler Guide</h2>
                <p className="text-xs text-slate-400 mt-1">
                  How to push from this safe workbench workspace to GitHub and auto-build your APK artifact.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Step 1 Card */}
              <div className="p-5 rounded-xl border border-slate-900/80 bg-slate-950/40 space-y-3">
                <div className="w-7 h-7 bg-blue-900/40 text-blue-400 font-bold font-mono rounded-lg flex items-center justify-center text-xs">
                  01
                </div>
                <h3 className="font-bold text-sm text-slate-100 font-mono">Download Codebase</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  In AI Studio, look at the top settings icon/export button of the workbench application to download the complete file structure as a <strong className="text-slate-300">ZIP</strong> folder, or configure the direct sync to GitHub.
                </p>
              </div>

              {/* Step 2 Card */}
              <div className="p-5 rounded-xl border border-slate-900/80 bg-slate-950/40 space-y-3">
                <div className="w-7 h-7 bg-blue-900/40 text-blue-400 font-bold font-mono rounded-lg flex items-center justify-center text-xs">
                  02
                </div>
                <h3 className="font-bold text-sm text-slate-100 font-mono">Create GitHub Repo</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Create a new repository on your GitHub account. Initialize git locally in the extracted workspace folder, link the origin, and build a push command to your main remote branch.
                </p>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 font-mono text-[10px] text-slate-400 space-y-1">
                  <p>git init</p>
                  <p>git add .</p>
                  <p>git commit -m "init"</p>
                  <p>git push -u origin main</p>
                </div>
              </div>

              {/* Step 3 Card */}
              <div className="p-5 rounded-xl border border-slate-900/80 bg-slate-950/40 space-y-3">
                <div className="w-7 h-7 bg-emerald-900/30 text-emerald-400 font-bold font-mono rounded-lg flex items-center justify-center text-xs">
                  03
                </div>
                <h3 className="font-bold text-sm text-slate-100 font-mono">Download Compiled APK</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Go to the <strong className="text-emerald-400">Actions</strong> tab in your repository. The checkout automated workspace builds with Java 17 and Gradle. Once built, download the debug APK!
                </p>
              </div>

            </div>

            <div className="p-4 rounded-xl bg-blue-950/15 border border-blue-900/30 text-slate-300 flex items-start gap-4">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs leading-relaxed">
                <p className="font-bold text-white">How does it work behind the scenes?</p>
                <p className="mt-1">
                  The automated GitHub action searches for standard top-level <strong className="text-blue-300">build.gradle</strong> and <strong className="text-blue-300">settings.gradle</strong> files. It triggers the robust Android environment preinstalled on the official GitHub Runner virtual machine (Ubuntu-latest). This is lightweight, secure, and needs no heavy offline Android Studio setups.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Simulator Modal Dialog for adding/editing tasks */}
      <AnimatePresence>
        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl text-slate-950 border border-slate-100 relative"
            >
              
              <button 
                onClick={() => setDialogOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                {isEditMode ? 'Edit Task Widget' : 'Add New Task Widget'}
              </h3>

              <form onSubmit={handleSaveTask} className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Task Title</label>
                  <input
                    type="text"
                    required
                    value={dialogTitle}
                    onChange={(e) => setDialogTitle(e.target.value)}
                    placeholder="Enter widget title"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Description</label>
                  <textarea
                    value={dialogDesc}
                    onChange={(e) => setDialogDesc(e.target.value)}
                    placeholder="Widget description (optional)"
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Priority Label</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setDialogPriority(p)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                          dialogPriority === p 
                            ? p === 'HIGH' 
                              ? 'bg-red-500 text-white shadow-sm' 
                              : p === 'MEDIUM' 
                                ? 'bg-amber-500 text-white shadow-sm' 
                                : 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    className="flex-1 py-3 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10"
                  >
                    {isEditMode ? 'Update Task' : 'Add Task'}
                  </button>
                </div>

                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => {
                      if (editingTaskId) {
                        handleDeleteTask(editingTaskId);
                        setDialogOpen(false);
                      }
                    }}
                    className="w-full mt-2 py-2.5 text-xs font-bold text-red-650 bg-red-100 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Task Widget
                  </button>
                )}

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent Footer */}
      <footer className="py-4 border-t border-slate-900 bg-slate-950/40 text-center text-[10px] text-slate-500 tracking-wider uppercase font-mono">
        Android SDK v34 Framework API Simulation • JDK 17 • Gradle Native Action Trigger
      </footer>

    </div>
  );
}
