package com.hotspotscamp.entity;

public class UserProfile {

    private String email;
    private String name;

    public UserProfile(String email, String name) {
        this.email = email;
        this.name = name;
    }

    public UserProfile() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
