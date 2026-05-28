import React, { useState } from 'react';
import { 
  FileCode, Terminal, Copy, Check, Folder, ChevronRight, CheckCircle2,
  Code2, Sparkles, Layers, BookOpen, ExternalLink, RefreshCw
} from 'lucide-react';

// Organized groups of files for the Todo Android application
interface AndroidFile {
  id: string;
  name: string;
  path: string;
  language: 'java' | 'xml';
  description: string;
  content: string;
}

const JAVA_FILES: AndroidFile[] = [
  {
    id: 'main_activity',
    name: 'MainActivity.java',
    path: 'app/src/main/java/com/example/todoapp/MainActivity.java',
    language: 'java',
    description: 'Binds RecyclerView, handles floating action buttons, opens material dialogs, and interacts with SQLite Database Helper.',
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
  {
    id: 'todo_item',
    name: 'TodoItem.java',
    path: 'app/src/main/java/com/example/todoapp/TodoItem.java',
    language: 'java',
    description: 'The standard data model class (POJO) representing a custom checklist entry with priority states.',
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
  {
    id: 'db_helper',
    name: 'TodoDatabaseHelper.java',
    path: 'app/src/main/java/com/example/todoapp/TodoDatabaseHelper.java',
    language: 'java',
    description: 'Extends SQLiteOpenHelper to initialize local SQLite schemas, update fields, and delete to-do records.',
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
  {
    id: 'adapter',
    name: 'TodoAdapter.java',
    path: 'app/src/main/java/com/example/todoapp/TodoAdapter.java',
    language: 'java',
    description: 'Implements full-performance ViewHolder pattern to efficiently reuse custom to-do rows as lists change.',
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
  }
];

const XML_FILES: AndroidFile[] = [
  {
    id: 'manifest',
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Declares package name, entry point Activity (MainActivity), application themes, and intent triggers.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:label="@string/app_name"
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
  {
    id: 'layout_main',
    name: 'activity_main.xml',
    path: 'app/src/main/res/layout/activity_main.xml',
    language: 'xml',
    description: 'The primary UI layout using ConstraintLayout, containing a Material AppBar, Todo list RecyclerView, empty state holder space, and a FloatingActionButton.',
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
  {
    id: 'layout_item',
    name: 'item_todo.xml',
    path: 'app/src/main/res/layout/item_todo.xml',
    language: 'xml',
    description: 'Highly structured list item styling featuring clean CardView margins, native CheckBox button bounds, and a trailing delete button.',
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
  {
    id: 'colors',
    name: 'colors.xml',
    path: 'app/src/main/res/values/colors.xml',
    language: 'xml',
    description: 'Stores design system color values including Material Slate defaults and individual item priority hexadecimal states.',
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
  {
    id: 'strings',
    name: 'strings.xml',
    path: 'app/src/main/res/values/strings.xml',
    language: 'xml',
    description: 'Provides fully localized UI string translation key references mapped from standard resources.',
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
  {
    id: 'themes',
    name: 'themes.xml',
    path: 'app/src/main/res/values/themes.xml',
    language: 'xml',
    description: 'Instructs the device styles compiler to assign Material3 NoActionBar parent variables with deep custom colors.',
    content: `<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.TodoApp" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryDark">@color/primary_dark</item>
        <item name="colorAccent">@color/accent</item>
        <item name="android:statusBarColor">@color/primary_dark</item>
        <item name="android:windowLightStatusBar">false</item>
    </style>
</resources>`
  }
];

export default function App() {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(JAVA_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Safe manual syntax highlighter for premium feeling UI
  const highlightCode = (text: string, lang: 'java' | 'xml') => {
    if (lang === 'java') {
      const keywords = /\b(package|import|public|class|private|extends|protected|void|override|new|return|if|else|for|boolean|int|long|final|static|instanceof|throws)\b/g;
      const annotations = /(@\w+)/g;
      const strings = /("(?:[^"\\]|\\.)*")/g;
      const comments = /(\/\/.*|\/\*[\s\S]*?\*\/)/g;

      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(comments, '<span class="text-slate-500 font-normal italic">$1</span>')
        .replace(strings, '<span class="text-emerald-400">$1</span>')
        .replace(keywords, '<span class="text-orange-400 font-semibold">$1</span>')
        .replace(annotations, '<span class="text-blue-400 font-medium">$1</span>');
    } else {
      // Simple XML highlighter (tags, attributes, string properties)
      const tags = /(&lt;\/?[a-zA-Z0-9:._-]+)/g;
      const attribs = /\b([a-zA-Z0-9:._-]+)(?=\s*=)/g;
      const strings = /("(?:[^"\\]|\\.)*")/g;
      const comments = /(&lt;!--[\s\S]*?--&gt;)/g;

      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(comments, '<span class="text-slate-500">$1</span>')
        .replace(tags, '<span class="text-blue-400 font-semibold">$1</span>')
        .replace(attribs, '<span class="text-amber-400 font-normal">$1</span>')
        .replace(strings, '<span class="text-emerald-300">$1</span>');
    }
  };

  return (
    <div id="workbench_root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-200">
      
      {/* Top Header / Developer Panel */}
      <header id="workbench_header" className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-950 to-blue-800 border border-blue-900/40 shadow-lg shadow-blue-900/20">
            <Code2 className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">
              Android Native To-Do Codebase
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Purified Java + XML • Native SQLite Engine
            </p>
          </div>
        </div>

        {/* Clean compilation badge */}
        <div id="gradle_compilation_status" className="flex items-center gap-3 self-start md:self-auto bg-blue-950/30 border border-blue-900/50 rounded-xl px-4 py-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-300 font-medium">AAPT Compile Fix Applied:</span>{' '}
            <span className="text-slate-400 font-mono text-[11px]">removed non-existent @mipmap icons from AndroidManifest.xml</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="workbench_main" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 leading-relaxed">
        
        {/* Left Hand side: Pure Java & XML file list */}
        <section id="sidebar_explorer" className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Section: Java Source Code */}
          <div className="bg-slate-900/40 rounded-2xl border border-slate-900 p-4 shadow-sm">
            <div className="flex items-center gap-2 px-2 pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-amber-500 font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-amber-500/10">JAVA</span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Java Source Files</h2>
            </div>
            
            <nav className="flex flex-col gap-1.5">
              {JAVA_FILES.map((file) => {
                const isActive = selectedFile.id === file.id;
                return (
                  <button
                    key={file.id}
                    id={`btn_file_${file.id}`}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 group ${
                      isActive 
                        ? 'bg-blue-600/10 border-blue-500/40 text-blue-200' 
                        : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                    }`}
                  >
                    <FileCode className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${
                      isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'
                    }`} />
                    <div className="min-w-0">
                      <div className="font-mono text-xs font-bold leading-tight">{file.name}</div>
                      <div className={`text-[11px] mt-1 transition-colors leading-normal line-clamp-2 ${
                        isActive ? 'text-blue-300/70' : 'text-slate-500 group-hover:text-slate-450'
                      }`}>
                        {file.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section: XML Resource Files */}
          <div className="bg-slate-900/40 rounded-2xl border border-slate-900 p-4 shadow-sm">
            <div className="flex items-center gap-2 px-2 pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-blue-400 font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-blue-500/10">XML</span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">XML Resources & Manifests</h2>
            </div>
            
            <nav className="flex flex-col gap-1.5">
              {XML_FILES.map((file) => {
                const isActive = selectedFile.id === file.id;
                return (
                  <button
                    key={file.id}
                    id={`btn_file_${file.id}`}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 group ${
                      isActive 
                        ? 'bg-blue-600/10 border-blue-400/40 text-blue-200' 
                        : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                    }`}
                  >
                    <FileCode className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${
                      isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'
                    }`} />
                    <div className="min-w-0">
                      <div className="font-mono text-xs font-bold leading-tight">{file.name}</div>
                      <div className={`text-[11px] mt-1 transition-colors leading-normal line-clamp-2 ${
                        isActive ? 'text-blue-300/70' : 'text-slate-500 group-hover:text-slate-450'
                      }`}>
                        {file.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Quick guide on SQLite & Gradle integration */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-xs text-slate-400 space-y-3">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              Android Architecture Overview
            </div>
            <p className="leading-relaxed">
              This native application implements a direct SQLite controller loop without any third-party runtime databases. Data flow is cleanly mediated through <code className="font-mono text-blue-300">TodoDatabaseHelper</code> to the <code className="font-mono text-blue-300">MainActivity</code> recyclerview.
            </p>
            <div className="flex flex-wrap gap-1 text-[10px] font-mono">
              <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">SQLite</span>
              <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Material3</span>
              <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">RecyclerView</span>
              <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Gradle 8.5</span>
            </div>
          </div>
        </section>

        {/* Right Hand side: Custom Code Viewer */}
        <section id="code_viewer_panel" className="lg:col-span-8 flex flex-col bg-slate-900/30 rounded-2xl border border-slate-900 overflow-hidden shadow-2xl h-[560px] lg:h-auto">
          
          {/* Filename Bar */}
          <div className="px-5 py-4 border-b border-slate-900 bg-slate-950/40 flex items-center justify-between gap-4">
            <div className="min-w-0 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                selectedFile.language === 'java' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}>
                {selectedFile.language.toUpperCase()}
              </span>
              <div className="font-mono text-xs text-slate-300 truncate font-semibold" title={selectedFile.path}>
                {selectedFile.path}
              </div>
            </div>

            <button
              id="btn_copy_to_clipboard"
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-semibold cursor-pointer transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Primary scrollable container */}
          <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-xs flex items-stretch">
            
            {/* Styled Pre block */}
            <pre className="w-full flex">
              {/* Line Numbers column */}
              <div className="text-right text-slate-600 select-none pr-4 border-r border-slate-900/60 sticky left-0 bg-slate-950 flex flex-col font-mono text-xs leading-5">
                {selectedFile.content.split('\n').map((_, index) => (
                  <span key={index} className="block block-line-number">{index + 1}</span>
                ))}
              </div>
              
              {/* Actual Code Display row */}
              <div 
                className="pl-4 flex-1 overflow-x-auto text-slate-300 font-mono text-xs leading-5 select-text whitespace-pre"
                dangerouslySetInnerHTML={{ __html: highlightCode(selectedFile.content, selectedFile.language) }}
              />
            </pre>
          </div>
          
          {/* Mini info overlay bar */}
          <div className="px-5 py-3.5 border-t border-slate-900 bg-slate-950/30 text-slate-500 text-[11px] flex items-center justify-between">
            <span className="font-mono">COM.EXAMPLE.TODOAPP • {selectedFile.content.split('\n').length} lines</span>
            <span>Character Count: {selectedFile.content.length}</span>
          </div>

        </section>

      </main>
      
      {/* Visual Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 px-6 text-center text-[11px] text-slate-500 font-mono">
        Native Android To-Do Codebase Explorer • Designed purely for Java-focused application development
      </footer>

    </div>
  );
}
