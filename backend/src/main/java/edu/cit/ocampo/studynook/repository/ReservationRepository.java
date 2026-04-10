package edu.cit.ocampo.studynook.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.cit.ocampo.studynook.entity.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserEmail(String email);
    List<Reservation> findByRoom_IdAndStatus(Long roomId, String status);
}