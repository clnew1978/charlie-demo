package com.charlie.demo.entity;

import lombok.Data;

import org.springframework.data.annotation.Id;

@Data
public class User {
    @Id
    private String id;
    private String name;
    private String phone;
    private UserType userType;
    private String password;

    public static User[] users = {
            new User("E62A51C2-8B3B-4458-900D-B7FDED379AC4", "Guest1", "111-11111", UserType.Guest, "12345"),
            new User("CFA2292E-DA77-4C0A-B16C-6DD181356778", "Guest2", "222-22222", UserType.Guest, "12345"),
            new User("CECC7067-84C1-4F8A-8410-9BCCABD4CE6C", "Guest3", "333-33333", UserType.Guest, "12345"),
            new User("EBE64507-5680-46F1-A901-E6C97E634ED9", "Employee1", "444-44444", UserType.Employee, "12345"),
            new User("62DF5E5C-9D55-493D-9FF0-491BFAB98D37", "Employee2", "555-55555", UserType.Employee, "12345"),
    };

    private User(String id, String name, String phone, UserType userType, String password) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.userType = userType;
        this.password = password;
    }
}
