package edu.cit.ocampo.studynook.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.ocampo.studynook.entity.Room;
import edu.cit.ocampo.studynook.service.RoomService;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRoomById(@PathVariable Long id) {
        Optional<Room> room = roomService.getRoomById(id);
        if (room.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Room not found"));
        }
        return ResponseEntity.ok(room.get());
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody Room room) {
        if (room.getType() == null || room.getType().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Room type is required"));
        }

        String normalizedType = room.getType().trim();
        if (!"Discussion Room".equalsIgnoreCase(normalizedType)
                && !"Laboratory Hub".equalsIgnoreCase(normalizedType)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid room type"));
        }

        room.setType("Discussion Room".equalsIgnoreCase(normalizedType) ? "Discussion Room" : "Laboratory Hub");
        room.setCapacity("Discussion Room".equalsIgnoreCase(room.getType()) ? 5 : 4);

        int nextNumber = getNextRoomNumber(room.getType());
        room.setName(room.getType() + " " + nextNumber);

        if (room.getStatus() == null || room.getStatus().trim().isEmpty()) {
            room.setStatus("Available");
        }

        Room saved = roomService.saveRoom(room);
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateRoomStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Room> roomOpt = roomService.getRoomById(id);
        if (roomOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Room not found"));
        }

        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }

        Room room = roomOpt.get();
        room.setStatus(status);
        return ResponseEntity.ok(roomService.saveRoom(room));
    }

    private int getNextRoomNumber(String roomType) {
        return roomService.getAllRooms().stream()
                .filter(existingRoom -> roomType.equalsIgnoreCase(existingRoom.getType()))
                .map(Room::getName)
                .filter(name -> name != null && name.startsWith(roomType + " "))
                .map(name -> name.substring((roomType + " ").length()).trim())
                .map(numberPart -> {
                    try {
                        return Integer.parseInt(numberPart);
                    } catch (NumberFormatException ex) {
                        return 0;
                    }
                })
                .max(Integer::compareTo)
                .orElse(0) + 1;
    }
}
