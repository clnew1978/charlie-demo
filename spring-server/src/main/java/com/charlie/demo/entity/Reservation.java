package com.charlie.demo.entity;

import lombok.Data;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("Reservation")
public class Reservation {
    @Id
    private String id;
    private String guestName;
    private String guestPhone;
    private Long arrivalTime;
    private Integer tableSize;
    private ReservationStatus status;

    public static Reservation fromDocument(org.bson.Document doc) {
        Reservation retval = new Reservation();
        retval.id = doc.getObjectId("_id").toHexString();
        retval.guestName = doc.getString("guestName");
        retval.guestPhone = doc.getString("guestPhone");
        retval.arrivalTime = doc.getLong("arrivalTime");
        retval.tableSize = doc.getInteger("tableSize");
        retval.status = ReservationStatus.valueOf(doc.getString("status"));
        return retval;
    }

    public org.bson.Document toDocument() {
        org.bson.Document doc = new org.bson.Document();

        if (this.id.length() > 0) {
            doc.put("_id", new ObjectId(this.id));
        }
        doc.put("guestName", this.guestName);
        doc.put("guestPhone", this.guestPhone);
        doc.put("arrivalTime", this.arrivalTime);
        doc.put("tableSize", this.tableSize);
        doc.put("status", this.status.value);
        return doc;
    }

}
