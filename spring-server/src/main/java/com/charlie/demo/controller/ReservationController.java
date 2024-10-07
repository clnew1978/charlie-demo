package com.charlie.demo.controller;

import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Arrays;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.slf4j.LoggerFactory;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.and;
import com.mongodb.client.model.Updates;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.graphql.data.ArgumentValue;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.ContextValue;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Component;
import com.charlie.demo.entity.Reservation;
import com.charlie.demo.entity.ReservationCreateInput;
import com.charlie.demo.entity.ReservationStatus;
import com.charlie.demo.entity.ReservationUpdateInput;
import com.charlie.demo.entity.User;
import com.charlie.demo.entity.UserType;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.result.InsertOneResult;
import com.mongodb.client.result.UpdateResult;
import reactor.core.publisher.Mono;

@Component
class RequestHeaderInterceptor implements WebGraphQlInterceptor {
    @Override
    public Mono<WebGraphQlResponse> intercept(WebGraphQlRequest request, Chain chain) {
        String value = request.getHeaders().getFirst("Authorization");
        if (value != null) {
            request.configureExecutionInput(
                    (executeInput, builder) -> builder.graphQLContext(Collections.singletonMap("token", value))
                            .build());
        }
        return chain.next(request);
    }
}

@Controller
public class ReservationController {
    @Autowired
    private MongoTemplate mongoTemplate;
    private final String collectionName;

    public ReservationController(@Value("${main.mongodb.collection-name:test-0000}") String collectionName) {
        this.collectionName = collectionName;
    }

    @QueryMapping
    public Reservation[] reservations(
            @ContextValue String token,
            ArgumentValue<Long> begin,
            ArgumentValue<Long> end,
            ArgumentValue<ReservationStatus> status) {
        List<Bson> filters = new ArrayList<>();
        User user = Arrays.stream(User.users).filter(u -> u.getId().equals(token)).findFirst().orElse(null);
        if (user == null) {
            return null;
        }
        if (user.getUserType().equals(UserType.Guest)) {
            filters.add(eq("guestName", user.getName()));
        }

        List<Reservation> retval = new ArrayList<Reservation>();
        MongoCollection<Document> collection = mongoTemplate.getCollection(this.collectionName);
        if (filters.size() <= 0) {
            collection.find().forEach(doc -> retval.add(Reservation.fromDocument(doc)));
        } else {
            collection.find(and(filters)).forEach(doc -> retval.add(Reservation.fromDocument(doc)));
        }

        return (Reservation[]) retval.toArray(new Reservation[retval.size()]);
    }

    @MutationMapping
    public Reservation addReservation(@ContextValue String token, @Argument ReservationCreateInput input) {
        User user = Arrays.stream(User.users).filter(u -> u.getId().equals(token)).findFirst().orElse(null);
        if (user == null) {
            return null;
        }

        Document doc = input.toDocument();

        MongoCollection<Document> collection = mongoTemplate.getCollection(this.collectionName);
        InsertOneResult result = collection.insertOne(doc);
        Reservation retval = new Reservation();
        retval.setId(result.getInsertedId().toString());
        retval.setGuestName(input.getGuestName());
        retval.setGuestPhone(input.getGuestPhone());
        retval.setArrivalTime(input.getArrivalTime());
        retval.setTableSize(input.getTableSize());
        retval.setStatus(ReservationStatus.Created);
        return retval;
    }

    @MutationMapping
    public Reservation updateReservation(@ContextValue String token, @Argument ReservationUpdateInput input) {
        User user = Arrays.stream(User.users).filter(u -> u.getId().equals(token)).findFirst().orElse(null);
        if (user == null) {
            return null;
        }

        MongoCollection<Document> collection = mongoTemplate.getCollection(this.collectionName);
        Document query = new Document().append("_id", new ObjectId(input.getId()));
        Bson updates = Updates.combine(
                Updates.set("guestName", input.getGuestName()),
                Updates.set("guestPhone", input.getGuestPhone()),
                Updates.set("arrivalTime", input.getArrivalTime()),
                Updates.set("tableSize", input.getTableSize()),
                Updates.set("status", input.getStatus().value));
        LoggerFactory.getLogger(ReservationController.class).info(updates.toString());
        UpdateResult result = collection.updateOne(query, updates);
        if (result.getModifiedCount() <= 0) {
            return null;
        }
        Reservation retval = new Reservation();
        retval.setId(input.getId());
        retval.setGuestName(input.getGuestName());
        retval.setGuestPhone(input.getGuestPhone());
        retval.setArrivalTime(input.getArrivalTime());
        retval.setTableSize(input.getTableSize());
        retval.setStatus(input.getStatus());
        return retval;
    }
}
