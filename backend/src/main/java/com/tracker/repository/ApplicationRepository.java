package com.tracker.repository;

import com.tracker.model.Application;
import com.tracker.model.ApplicationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ApplicationRepository extends MongoRepository<Application, String> {

    List<Application> findByUserIdOrderByUpdatedAtDesc(String userId);

    List<Application> findByUserIdAndStatus(String userId, ApplicationStatus status);

    List<Application> findByUserIdAndTagsContaining(String userId, String tag);

    @Query("{ 'userId': ?0, 'dateApplied': { $gte: ?1, $lte: ?2 } }")
    List<Application> findByUserIdAndDateRange(String userId, LocalDate from, LocalDate to);

    @Query("{ 'userId': ?0, $or: [ " +
           "{ 'company': { $regex: ?1, $options: 'i' } }, " +
           "{ 'role': { $regex: ?1, $options: 'i' } }, " +
           "{ 'notes': { $regex: ?1, $options: 'i' } } ] }")
    List<Application> searchByKeyword(String userId, String keyword);

    long countByUserIdAndStatus(String userId, ApplicationStatus status);

    long countByUserId(String userId);
}
