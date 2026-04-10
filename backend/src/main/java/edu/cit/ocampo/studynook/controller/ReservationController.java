package edu.cit.ocampo.studynook.controller;

import edu.cit.ocampo.studynook.entity.Reservation;
import edu.cit.ocampo.studynook.entity.Room;
import edu.cit.ocampo.studynook.repository.ReservationRepository;
import edu.cit.ocampo.studynook.service.ReservationService;
import edu.cit.ocampo.studynook.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private static final Set<LocalTime> ALLOWED_SLOT_STARTS = Set.of(
            LocalTime.of(7, 30),
            LocalTime.of(9, 30),
            LocalTime.of(11, 30),
            LocalTime.of(13, 30),
            LocalTime.of(15, 30),
            LocalTime.of(17, 30),
            LocalTime.of(19, 30)
    );

    private final ReservationService reservationService;
    private final RoomService roomService;
    private final ReservationRepository reservationRepository;

    public ReservationController(ReservationService reservationService, RoomService roomService,
                                 ReservationRepository reservationRepository) {
        this.reservationService = reservationService;
        this.roomService = roomService;
        this.reservationRepository = reservationRepository;
    }

    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @GetMapping("/user")
    public ResponseEntity<?> getReservationsByUser(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        return ResponseEntity.ok(reservationService.getReservationsByUserEmail(email));
    }

    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody Map<String, String> payload) {
        try {
            String userEmail = payload.get("userEmail");
            String roomIdStr = payload.get("roomId");
            String startTimeStr = payload.get("startTime");
            String endTimeStr = payload.get("endTime");

            if (userEmail == null || userEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User email is required"));
            }
            if (roomIdStr == null || roomIdStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Room is required"));
            }
            if (startTimeStr == null || startTimeStr.trim().isEmpty() || endTimeStr == null || endTimeStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Start and end time are required"));
            }

            Long roomId = Long.parseLong(roomIdStr);
            LocalDateTime startTime = LocalDateTime.parse(startTimeStr);
            LocalDateTime endTime = LocalDateTime.parse(endTimeStr);

            if (!endTime.isAfter(startTime)) {
                return ResponseEntity.badRequest().body(Map.of("error", "End time must be after start time"));
            }

            // Enforce fixed booking windows: same date, exactly 2 hours, and allowed slot starts.
            if (!startTime.toLocalDate().equals(endTime.toLocalDate())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Booking must start and end on the same date"));
            }

            if (!Duration.between(startTime, endTime).equals(Duration.ofHours(2))) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only fixed 2-hour timeslots are allowed"));
            }

            if (!ALLOWED_SLOT_STARTS.contains(startTime.toLocalTime().withSecond(0).withNano(0))) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid start time slot selected"));
            }

            Optional<Room> roomOpt = roomService.getRoomById(roomId);
            if (roomOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Room not found"));
            }

            Room room = roomOpt.get();
            if (!"Available".equalsIgnoreCase(room.getStatus()) && !"Fully Booked".equalsIgnoreCase(room.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Room is currently not available for booking"));
            }

            List<Reservation> activeRoomReservations = reservationRepository.findByRoom_IdAndStatus(roomId, "Booked");
            long overlappingCount = activeRoomReservations.stream()
                    .filter(r -> startTime.isBefore(r.getEndTime()) && endTime.isAfter(r.getStartTime()))
                    .count();

            if ("Discussion Room".equalsIgnoreCase(room.getType()) && overlappingCount > 0) {
                return ResponseEntity.status(409).body(Map.of("error", "This discussion room is already booked for that time slot"));
            }

            if ("Laboratory Hub".equalsIgnoreCase(room.getType()) && overlappingCount >= room.getCapacity()) {
                return ResponseEntity.status(409).body(Map.of("error", "Laboratory hub reached capacity for that time slot"));
            }

            Reservation reservation = new Reservation();
            reservation.setRoom(room);
            reservation.setUserEmail(userEmail);
            reservation.setStartTime(startTime);
            reservation.setEndTime(endTime);
            reservation.setStatus("Booked");

            return ResponseEntity.status(201).body(reservationService.saveReservation(reservation));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid reservation payload"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id) {
        Optional<Reservation> resOpt = reservationService.getReservationById(id);
        if (resOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Reservation not found"));
        }

        Reservation reservation = resOpt.get();
        reservation.setStatus("Cancelled");
        reservationService.saveReservation(reservation);

        return ResponseEntity.ok(Map.of("message", "Reservation cancelled successfully"));
    }
}
