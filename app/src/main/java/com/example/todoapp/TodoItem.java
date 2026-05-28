package com.example.todoapp;

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
}
