package com.charlie.demo.entity;

public enum UserType {
    Guest("Guest"),
    Employee("Employee");

    public final String value;

    private UserType(String value) {
        this.value = value;
    }

}
