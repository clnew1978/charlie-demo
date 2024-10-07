package com.charlie.demo.entity;

import org.bson.Document;

import lombok.Data;

@Data
public class ReservationCreateInput {
    private String guestName;
    private String guestPhone;
    private Long arrivalTime;
    private Integer tableSize;

    public Document toDocument() {
        Document doc = new Document();
        doc.put("guestName", guestName);
        doc.put("guestPhone", guestPhone);
        doc.put("arrivalTime", arrivalTime);
        doc.put("tableSize", tableSize);
        doc.put("status", ReservationStatus.Created.value);
        return doc;
    }
}
