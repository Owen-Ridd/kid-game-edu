package com.kidgameedu.backend.config;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import org.bson.types.ObjectId;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
        return builder -> {
            builder.serializerByType(ObjectId.class, new JsonSerializer<ObjectId>() {
                @Override
                public void serialize(ObjectId value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
                    if (value == null) {
                        gen.writeNull();
                    } else {
                        gen.writeString(value.toHexString());
                    }
                }
            });
            builder.deserializerByType(ObjectId.class, new JsonDeserializer<ObjectId>() {
                @Override
                public ObjectId deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
                    String hex = p.getValueAsString();
                    return (hex != null && ObjectId.isValid(hex)) ? new ObjectId(hex) : null;
                }
            });
        };
    }
}
