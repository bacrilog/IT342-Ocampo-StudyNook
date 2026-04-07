package edu.cit.ocampo.studynook.dto;

public class RoomDTO {
    private Long id;
    private String name;
    private String type;
    private int capacity;
    private String status;

    public RoomDTO() {}

    public RoomDTO(Long id, String name, String type, int capacity, String status) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.status = status;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}