package edu.cit.ocampo.studynook.controller;

import edu.cit.ocampo.studynook.entity.Room;
import edu.cit.ocampo.studynook.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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
        if (room.getName() == null || room.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Room name is required"));
        }
        if (room.getType() == null || room.getType().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Room type is required"));
        }
        if (room.getCapacity() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Capacity must be greater than 0"));
        }

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
}
