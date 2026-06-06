package com.ppjk.workouttracker.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import tools.jackson.databind.DefaultTyping;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.cfg.DateTimeFeature;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.jsontype.BasicPolymorphicTypeValidator;

import java.time.Duration;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String PERSONAL_RECORDS = "stats:personal-records";
    public static final String EXERCISE_PROGRESS = "stats:exercise-progress";
    public static final String MUSCLE_BALANCE = "stats:muscle-balance";
    public static final String OVERLOAD = "stats:overload";

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        var jsonSerializer = new GenericJacksonJsonRedisSerializer(cacheObjectMapper());

        var defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(jsonSerializer))
                .disableCachingNullValues();

        var perCacheConfig = Map.of(
                PERSONAL_RECORDS, defaultConfig.entryTtl(Duration.ofMinutes(10)),
                EXERCISE_PROGRESS, defaultConfig.entryTtl(Duration.ofMinutes(10)),
                MUSCLE_BALANCE, defaultConfig.entryTtl(Duration.ofMinutes(10)),
                OVERLOAD, defaultConfig.entryTtl(Duration.ofMinutes(10))
        );

        return RedisCacheManager.builder(factory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(perCacheConfig)
                .build();
    }

    /**
     * A dedicated ObjectMapper for the cache serializer — separate from any
     * Spring MVC ObjectMapper so we don't pollute HTTP responses with @class fields.
     * <p>
     * activateDefaultTypingAsProperty() writes an "@class" field alongside every
     * serialized object, e.g.:
     * <p>
     * {"@class":"com.ppjk...PersonalRecord","exerciseId":"..."}
     * <p>
     * Without it, Jackson stores a plain LinkedHashMap and cannot reconstruct
     * the correct type when reading back from Redis — which was the original error.
     * <p>
     * BasicPolymorphicTypeValidator restricts which packages may be instantiated
     * during deserialization, preventing arbitrary class instantiation via Redis.
     */
    private ObjectMapper cacheObjectMapper() {
        var ptv = BasicPolymorphicTypeValidator.builder()
                .allowIfBaseType("com.ppjk.workouttracker")
                .allowIfBaseType(Object.class)
                .build();

        return JsonMapper.builder()
                .findAndAddModules()
                .disable(DateTimeFeature.WRITE_DATES_AS_TIMESTAMPS)
                .activateDefaultTypingAsProperty(
                        ptv,
                        DefaultTyping.JAVA_LANG_OBJECT,
                        "@class"
                )
                .build();
    }
}