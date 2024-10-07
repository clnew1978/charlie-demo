package com.charlie.demo.entity;

import lombok.Data;

@Data
public class AuthenticationInfo {
    String token;
    String name;
    String userType;

    public AuthenticationInfo(String token, String name, UserType userType) {
        this.token = token;
        this.name = name;
        this.userType = userType.value;
    }

}
