package edu.cit.ocampo.studynook.features.room;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import jakarta.persistence.LockModeType;

public interface RoomRepository extends JpaRepository<Room, Long> {

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	Optional<Room> findWithLockById(Long id);
}