package edu.cit.ocampo.studynook.features.reservation;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserEmail(String email);
    List<Reservation> findByRoom_IdAndStatus(Long roomId, String status);
}