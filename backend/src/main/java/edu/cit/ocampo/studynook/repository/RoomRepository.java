package edu.cit.ocampo.studynook.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import edu.cit.ocampo.studynook.entity.Room;
import jakarta.persistence.LockModeType;

public interface RoomRepository extends JpaRepository<Room, Long> {

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	Optional<Room> findWithLockById(Long id);
}