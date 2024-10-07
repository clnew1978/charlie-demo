package com.charlie.demo.entity;

public enum ReservationStatus {
    Created("Created"),
    Completed("Completed"),
    Canceled("Canceled");

    public final String value;

    private ReservationStatus(String value) {
        this.value = value;
    }

}
