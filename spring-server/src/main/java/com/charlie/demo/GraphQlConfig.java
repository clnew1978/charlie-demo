package com.charlie.demo;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;
import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import reactor.core.publisher.Mono;
import graphql.schema.Coercing;
import graphql.schema.GraphQLScalarType;
import graphql.language.IntValue;
import graphql.language.StringValue;
import java.math.BigInteger;
import java.util.Collections;

class RequestHeaderInterceptor implements WebGraphQlInterceptor {
    @Override
    public Mono<WebGraphQlResponse> intercept(WebGraphQlRequest request, Chain chain) {
        String value = request.getHeaders().getFirst("authorization");
        request.configureExecutionInput(
                (executeInput, builder) -> builder.graphQLContext(Collections.singletonMap("token", value)).build());
        return chain.next(request);
    }
}

@Configuration
public class GraphQlConfig {

    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        GraphQLScalarType Date = GraphQLScalarType.newScalar()
                .name("Date")
                .coercing(new Coercing<Long, Long>() {
                    @Override
                    public Long serialize(Object input) {
                        if (input instanceof Long) {
                            return (Long) input;
                        } else {
                            return null;
                        }
                    }

                    @Override
                    public Long parseValue(Object input) {
                        if (input instanceof Long) {
                            return (Long) input;
                        } else {
                            return null;
                        }
                    }

                    @Override
                    public Long parseLiteral(Object input) {
                        if (input instanceof StringValue) {
                            return Long.parseLong(((StringValue) input).getValue());
                        } else if (input instanceof IntValue) {
                            BigInteger value = ((IntValue) input).getValue();
                            return value.longValue();
                        }
                        return 0L;
                    }
                }).build();
        return wiringBuilder -> wiringBuilder.scalar(Date);
    }

}
