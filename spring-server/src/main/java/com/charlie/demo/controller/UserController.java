package com.charlie.demo.controller;

import java.util.Arrays;

import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.stereotype.Controller;

import com.charlie.demo.entity.AuthenticationInfo;
import com.charlie.demo.entity.User;

@Controller
public class UserController {

    @QueryMapping
    public User[] users() {
        return User.users;
    }

    @MutationMapping
    public AuthenticationInfo login(@Argument String name, @Argument String password) {
        User user = Arrays.stream(User.users)
                .filter(u -> u.getName().equals(name) && u.getPassword().equals(password))
                .findFirst()
                .orElse(null);
        if (user == null) {
            return null;
        }
        return new AuthenticationInfo(user.getId(), user.getName(), user.getUserType());
    }

}
