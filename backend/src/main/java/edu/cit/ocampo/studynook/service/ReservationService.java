package edu.cit.ocampo.studynook.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.ocampo.studynook.entity.Reservation;
import edu.cit.ocampo.studynook.entity.Room;
import edu.cit.ocampo.studynook.repository.ReservationRepository;
import edu.cit.ocampo.studynook.repository.RoomRepository;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;

    public ReservationService(ReservationRepository reservationRepository, RoomRepository roomRepository) {
        this.reservationRepository = reservationRepository;
        this.roomRepository = roomRepository;
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public Optional<Reservation> getReservationById(Long id) {
        return reservationRepository.findById(id);
    }

    public Reservation saveReservation(Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }

    public List<Reservation> getReservationsByUserEmail(String email) {
        return reservationRepository.findByUserEmail(email);
    }

    @Transactional
    public Reservation createReservation(Reservation reservation) throws Exception {
        Long roomId = reservation.getRoom().getId();
        LocalDateTime startTime = reservation.getStartTime();
        LocalDateTime endTime = reservation.getEndTime();

        // Lock the room row to prevent concurrent bookings (pessimistic lock)
        Optional<Room> lockedRoomOpt = roomRepository.findWithLockById(roomId);
        if (lockedRoomOpt.isEmpty()) {
            throw new Exception("Room not found");
        }

        Room room = lockedRoomOpt.get();

        // Re-check overlaps under lock to prevent race condition
        List<Reservation> activeRoomReservations = reservationRepository.findByRoom_IdAndStatus(roomId, "Booked");
        long overlappingCount = activeRoomReservations.stream()
                .filter(r -> startTime.isBefore(r.getEndTime()) && endTime.isAfter(r.getStartTime()))
                .count();

        if ("Discussion Room".equalsIgnoreCase(room.getType()) && overlappingCount > 0) {
            throw new Exception("This discussion room is already booked for that time slot");
        }

        if ("Laboratory Hub".equalsIgnoreCase(room.getType()) && overlappingCount >= room.getCapacity()) {
            throw new Exception("Laboratory hub reached capacity for that time slot");
        }

        return reservationRepository.save(reservation);
    }
}