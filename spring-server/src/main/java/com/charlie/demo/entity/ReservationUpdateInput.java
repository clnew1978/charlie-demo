package com.charlie.demo.entity;

import lombok.Data;

@Data
public class ReservationUpdateInput {
    private String id;
    private String guestName;
    private String guestPhone;
    private Long arrivalTime;
    private Integer tableSize;
    private ReservationStatus status;
}
