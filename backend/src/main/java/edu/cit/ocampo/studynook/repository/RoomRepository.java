package edu.cit.ocampo.studynook.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.cit.ocampo.studynook.entity.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {}