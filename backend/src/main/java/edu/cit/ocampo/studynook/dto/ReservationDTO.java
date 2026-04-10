package edu.cit.ocampo.studynook.dto;

import java.time.LocalDateTime;

public class ReservationDTO {
    private Long id;
    private String userEmail;
    private Long roomId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    public ReservationDTO() {}

    public ReservationDTO(Long id, String userEmail, Long roomId, LocalDateTime startTime, LocalDateTime endTime) {
        this.id = id;
        this.userEmail = userEmail;
        this.roomId = roomId;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
}