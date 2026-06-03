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
        var jsonSerializer = GenericJacksonJsonRedisSerializer.builder()
                .enableSpringCacheNullValueSupport()
                .build();

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
}