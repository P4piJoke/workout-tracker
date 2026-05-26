package com.ppjk.workouttracker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(
        basePackages = "com.ppjk.workouttracker.repository.mongo"
)
@EnableElasticsearchRepositories(
        basePackages = "com.ppjk.workouttracker.repository.elasticsearch"
)
public class RepositoryConfig { }
