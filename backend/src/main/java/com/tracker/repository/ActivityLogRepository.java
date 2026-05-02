package com.tracker.repository;

import com.tracker.model.ActivityLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {
    List<ActivityLog> findByApplicationIdOrderByTimestampDesc(String applicationId);
    List<ActivityLog> findByUserIdOrderByTimestampDesc(String userId);
}
